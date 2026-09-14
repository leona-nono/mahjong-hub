import {
  sortTiles,
  tileIndex,
  tileRank,
  tileSuit,
  type Tile
} from '../tiles';
import { isWinningHand, waitingTiles } from '../shanten';
import { scoreHand } from '../scoring';
import { completeAddedKan, drawReplacement } from './draw';
import {
  advanceAfterUnclaimedDiscard,
  clone,
  handCounts,
  meldCount,
  takeTileOfKind
} from './helpers';
import {
  CLAIM_TIMEOUT_MS,
  RULESETS,
  SEATS,
  minimumWinScore,
  nextSeat,
  type ClaimKind,
  type ClaimOption,
  type GameState,
  type MeldKind,
  type Seat
} from './state';
import { finishWithDoubleRon, finishWithWin } from './win';

/**
 * Auto-pass every seat that has not answered an open claim window once the
 * window's deadline has passed. Used as a safety net for a silent human player;
 * bots answer their own windows on a timer. Returns the state unchanged while
 * the window is still open.
 */
export function passUnansweredClaims(state: GameState, now: number): GameState {
  if (state.phase !== 'claim' && state.phase !== 'added-kan-claim') return state;
  if (now - (state.claimOpenedAt ?? now) < CLAIM_TIMEOUT_MS) return state;

  const next = clone(state);
  for (const seat of Object.keys(next.claims).map(Number) as Seat[]) {
    if (next.submitted[seat] === undefined) {
      next.submitted[seat] = { kind: 'pass', tiles: [] };
    }
  }
  return maybeResolveClaims(next);
}

/** Work out what every other seat could call on the discarded tile. */
export function isPermanentFuriten(state: GameState, seat: Seat): boolean {
  if (state.ruleset !== 'riichi') return false;
  const player = state.players[seat];
  const waits = waitingTiles(handCounts(player), meldCount(player), 'riichi');
  return waits.some((tile) => player.discards.includes(tile));
}

export function collectClaims(
  state: GameState,
  tile: Tile,
  from: Seat
): Partial<Record<Seat, ClaimOption[]>> {
  const config = RULESETS[state.ruleset];
  const minimum = minimumWinScore(state);
  const claims: Partial<Record<Seat, ClaimOption[]>> = {};

  for (const seat of SEATS) {
    if (seat === from) continue;
    const player = state.players[seat];
    const options: ClaimOption[] = [];
    const counts = handCounts(player);
    const index = tileIndex(tile);

    // Ron — completing the hand on someone else's discard.
    const test = [...counts];
    test[index] += 1;
    const blockedByFuriten = state.ruleset === 'riichi' && (
      player.temporaryFuriten || isPermanentFuriten(state, seat)
    );
    if (!blockedByFuriten && isWinningHand(test, meldCount(player), state.ruleset)) {
      const score = scoreHand({ state, seat, winningTile: tile, selfDrawn: false });
    const meetsMinimum = state.ruleset === 'chinese-official'
      ? (score.qualifyingTotal ?? score.total) >= minimum
      : score.total >= minimum;
    if (state.ruleset === 'riichi' ? score.legalYaku : meetsMinimum) {
        options.push({ kind: 'ron', tiles: [tile] });
      }
    }

    // Pon and kan — available to any seat.
    if (counts[index] >= 2) options.push({ kind: 'pon', tiles: [tile, tile] });
    if (counts[index] >= 3) options.push({ kind: 'kan', tiles: [tile, tile, tile] });

    // Chi — only from the player to the left, numbered suits only.
    if (config.allowChi && seat === nextSeat(from) && tileSuit(tile) !== 'z') {
      const rank = tileRank(tile);
      const suit = tileSuit(tile);
      const has = (r: number) => r >= 1 && r <= 9 && counts[tileIndex(`${suit}${r}`)] > 0;
      if (has(rank - 2) && has(rank - 1)) {
        options.push({ kind: 'chi', tiles: [`${suit}${rank - 2}`, `${suit}${rank - 1}`] });
      }
      if (has(rank - 1) && has(rank + 1)) {
        options.push({ kind: 'chi', tiles: [`${suit}${rank - 1}`, `${suit}${rank + 1}`] });
      }
      if (has(rank + 1) && has(rank + 2)) {
        options.push({ kind: 'chi', tiles: [`${suit}${rank + 1}`, `${suit}${rank + 2}`] });
      }
    }

    if (options.length > 0) claims[seat] = options;
  }

  return claims;
}

const CLAIM_PRIORITY: Record<ClaimKind, number> = {
  ron: 4,
  kan: 3,
  pon: 2,
  chi: 1,
  pass: 0
};

/** Record one seat's decision during a claim window. */
export function submitClaim(
  state: GameState,
  seat: Seat,
  option: ClaimOption
): GameState {
  if (state.phase !== 'claim' && state.phase !== 'added-kan-claim') return state;
  const next = clone(state);
  if (state.ruleset === 'riichi' && option.kind === 'pass' &&
      state.claims[seat]?.some((claim) => claim.kind === 'ron')) {
    next.players[seat].temporaryFuriten = true;
  }

  next.submitted[seat] = option;
  return maybeResolveClaims(next);
}

/** Resolve the claim window once every eligible seat has answered. */
export function maybeResolveClaims(state: GameState): GameState {
  const pending = Object.keys(state.claims).map(Number) as Seat[];
  const answered = pending.every((seat) => state.submitted[seat] !== undefined);
  if (!answered) return state;

  const next = clone(state);
  if (next.phase === 'added-kan-claim' && next.pendingAddedKan) {
    const pendingKan = next.pendingAddedKan;
    const ronSeats = pending.filter((seat) => next.submitted[seat]!.kind === 'ron');
    next.claims = {};
    next.submitted = {};
    if (ronSeats.length > 0) {
      next.winContext = 'rob-kong';
      next.pendingAddedKan = undefined;
      // A robbed Kong resolves like any other claimed tile, double ron included.
      if (ronSeats.length >= 2 && next.ruleset === 'riichi') {
        return finishWithDoubleRon(next, ronSeats, { tile: pendingKan.tile, from: pendingKan.seat });
      }
      const winner = ronSeats.sort((a, b) => ((a - pendingKan.seat + 4) % 4) - ((b - pendingKan.seat + 4) % 4))[0];
      return finishWithWin(next, winner, pendingKan.tile, false, pendingKan.seat);
    }
    return completeAddedKan(next, pendingKan.seat, pendingKan.tile, pendingKan.meldIndex);
  }
  const discardInfo = next.lastDiscard!;

  // Riichi: every seat that declared ron wins the same discard, and the
  // discarder pays each of them. HK / CO keep the single lowest-seat winner.
  const ronSeats = pending.filter(
    (seat) => next.submitted[seat]!.kind === 'ron'
  );
  if (ronSeats.length >= 2 && next.ruleset === 'riichi') {
    next.claims = {};
    next.submitted = {};
    return finishWithDoubleRon(next, ronSeats, discardInfo);
  }

  let best: { seat: Seat; option: ClaimOption } | null = null;
  for (const seat of pending) {
    const option = next.submitted[seat]!;
    if (option.kind === 'pass') continue;
    if (!best || CLAIM_PRIORITY[option.kind] > CLAIM_PRIORITY[best.option.kind]) {
      best = { seat, option };
    }
  }

  next.claims = {};
  next.submitted = {};

  if (!best) {
    return advanceAfterUnclaimedDiscard(next);
  }

  if (best.option.kind === 'ron') {
    return finishWithWin(next, best.seat, discardInfo.tile, false, discardInfo.from);
  }

  // The claimed tile leaves the discard pile and joins the caller's meld.
  const discarder = next.players[discardInfo.from];
  discarder.discards.pop();

  const caller = next.players[best.seat];
  const contributed: Tile[] = [];
  for (const tile of best.option.tiles) {
    const removed = takeTileOfKind(caller.hand, tile);
    if (removed) contributed.push(removed);
  }
  caller.hand = sortTiles(caller.hand);
  caller.lastDrawn = undefined;

  const meldTiles = sortTiles([...contributed, discardInfo.tile]);
  const kind: MeldKind =
    best.option.kind === 'chi' ? 'chi' : best.option.kind === 'kan' ? 'kan' : 'pon';
  caller.melds.push({ kind, tiles: meldTiles, from: discardInfo.from });
  recordHongKongLiability(next, best.seat, discardInfo.from);
  recordRiichiLiability(next, best.seat, discardInfo.from, kind);
  next.callsMade = true;
  if (next.ruleset === 'riichi') {
    for (const participant of next.players) participant.ippatsuEligible = false;
  }
  next.log.push(`Seat ${best.seat} calls ${best.option.kind}.`);

  if (kind === 'kan') drawReplacement(next, best.seat);

  next.turn = best.seat;
  next.phase = 'discard';
  next.lastDiscard = null;
  return next;
}

/** Record the product-defined Hong Kong 包牌 trigger at the moment of the call. */
function recordHongKongLiability(state: GameState, callerSeat: Seat, providerSeat: Seat): void {
  if (state.ruleset !== 'hongkong') return;
  const exposed = state.players[callerSeat].melds.filter((meld) => !meld.concealed);
  const dragonMelds = exposed.filter((meld) => ['z5', 'z6', 'z7'].includes(meld.tiles[0])).length;
  if (dragonMelds >= 3) {
    state.hongKongLiability = { seat: providerSeat, winner: callerSeat, reason: 'three-open-dragons' };
    state.log.push(`Hong Kong 包牌: seat ${providerSeat} supplied the third exposed Dragon set.`);
  } else if (exposed.length >= 4) {
    state.hongKongLiability = { seat: providerSeat, winner: callerSeat, reason: 'four-open-melds' };
    state.log.push(`Hong Kong 包牌: seat ${providerSeat} supplied the fourth exposed meld.`);
  }
}

/** WRC 2025 pao: third called dragon, fourth called wind, or fourth called quad. */
function recordRiichiLiability(
  state: GameState,
  callerSeat: Seat,
  providerSeat: Seat,
  kind: MeldKind
): void {
  if (state.ruleset !== 'riichi') return;
  const melds = state.players[callerSeat].melds;
  const has = (yakuman: 'bigThreeDragons' | 'bigFourWinds' | 'fourKans') =>
    state.riichiLiabilities.some((entry) => entry.winner === callerSeat && entry.yakuman === yakuman);
  const add = (yakuman: 'bigThreeDragons' | 'bigFourWinds' | 'fourKans', message: string) => {
    if (has(yakuman)) return;
    state.riichiLiabilities.push({ seat: providerSeat, winner: callerSeat, yakuman });
    state.log.push(`WRC pao: seat ${providerSeat} is liable for ${message} by seat ${callerSeat}.`);
  };
  const dragonSets = melds.filter((meld) => meld.kind !== 'chi' && ['z5', 'z6', 'z7'].includes(meld.tiles[0])).length;
  const windSets = melds.filter((meld) => meld.kind !== 'chi' && ['z1', 'z2', 'z3', 'z4'].includes(meld.tiles[0])).length;
  if (dragonSets >= 3) add('bigThreeDragons', 'Big Three Dragons');
  if (windSets >= 4) add('bigFourWinds', 'Big Four Winds');
  if (kind === 'kan' && melds.filter((meld) => meld.kind === 'kan').length >= 4) add('fourKans', 'Four Kans');
}
