import {
  isBonusTile,
  isSameKind,
  sortTiles,
  tileFromIndex,
  tileIndex,
  toCounts,
  type Tile
} from '../tiles';
import { decomposeWin, isWinningHand, shanten, waitingTiles } from '../shanten';
import { scoreHand, type ScoreResult } from '../scoring';
import {
  clone,
  handCounts,
  meldCount,
  removeTile,
  takeTileOfKind,
  totalKans
} from './helpers';
import {
  SEATS,
  minimumWinScore,
  tilesRemaining,
  type ClaimOption,
  type GameState,
  type Seat
} from './state';

/** Draw the next live tile for the current player. */
export function drawTile(state: GameState): GameState {
  if (state.phase !== 'draw') return state;
  const next = clone(state);
  const tenpai: Seat[] = [];

  if (tilesRemaining(next) <= 0) {
    next.phase = 'over';
    if (next.ruleset === 'riichi') {
      tenpai.push(...SEATS.filter((seat) => seatShanten(next, seat) === 0));
      if (tenpai.length > 0 && tenpai.length < 4) {
        const gain = 3000 / tenpai.length;
        const loss = 3000 / (4 - tenpai.length);
        for (const seat of SEATS) {
          if (tenpai.includes(seat)) next.players[seat].score += gain;
          else next.players[seat].score -= loss;
        }
      }
      next.honba += 1;
      next.log.push('Exhaustive draw: 3,000-point noten payment settled.');
    }
    next.result = {
      kind: 'draw',
      reason: 'exhaustive',
      tenpaiSeats: next.ruleset === 'riichi' ? tenpai : undefined
    };
    next.log.push('Wall exhausted — the hand is drawn.');
    return next;
  }

  let tile = next.wall[next.wallIndex];
  next.wallIndex += 1;
  const player = next.players[next.turn];
  while (next.ruleset === 'chinese-official' && isBonusTile(tile)) {
    player.flowers.push(tile);
    next.log.push(`Seat ${next.turn} exposes ${tile} and draws a flower replacement.`);
    if (next.deadWallIndex >= next.wall.length) {
      next.phase = 'over';
      next.result = { kind: 'draw', reason: 'exhaustive' };
      return next;
    }
    tile = next.wall[next.deadWallIndex];
    next.deadWallIndex += 1;
  }
  player.hand = sortTiles([...player.hand, tile]);
  player.lastDrawn = tile;
  player.lastDrawWasReplacement = false;
  if (!player.declaredReady) player.temporaryFuriten = false;
  next.phase = 'discard';
  next.lastDiscard = null;
  return next;
}

/** Draw a replacement tile after a kan, taken from the dead wall. */
export function drawReplacement(state: GameState, seat: Seat): void {
  if (state.deadWallIndex >= state.wall.length) return;
  let tile = state.wall[state.deadWallIndex];
  state.deadWallIndex += 1;
  while (state.ruleset === 'chinese-official' && isBonusTile(tile)) {
    state.players[seat].flowers.push(tile);
    state.log.push(`Seat ${seat} exposes ${tile} and draws a flower replacement.`);
    if (state.deadWallIndex >= state.wall.length) return;
    tile = state.wall[state.deadWallIndex];
    state.deadWallIndex += 1;
  }
  state.players[seat].hand = sortTiles([...state.players[seat].hand, tile]);
  state.players[seat].lastDrawn = tile;
  state.players[seat].lastDrawWasReplacement = true;
}

export interface SelfDrawEvaluation {
  complete: boolean;
  legal: boolean;
  score: ScoreResult | null;
  minimum: number;
}

/** Distinguish a complete shape from a legal win that clears the score floor. */
export function evaluateSelfDraw(state: GameState, seat: Seat): SelfDrawEvaluation {
  const player = state.players[seat];
  const minimum = minimumWinScore(state);
  if (player.hand.length % 3 !== 2) {
    return { complete: false, legal: false, score: null, minimum };
  }
  const complete = isWinningHand(handCounts(player), meldCount(player), state.ruleset);
  if (!complete) return { complete: false, legal: false, score: null, minimum };
  const score = scoreHand({
    state,
    seat,
    winningTile: player.hand[player.hand.length - 1],
    selfDrawn: true
  });
  const legal = state.ruleset === 'riichi'
    ? Boolean(score.legalYaku)
    : (state.ruleset === 'chinese-official'
      ? (score.qualifyingTotal ?? score.total) >= minimum
      : score.total >= minimum);
  return { complete: true, legal, score, minimum };
}

/** Can this seat declare a self-drawn win right now? */
export function canDeclareTsumo(state: GameState, seat: Seat): boolean {
  return evaluateSelfDraw(state, seat).legal;
}

/** Discards that leave a closed Riichi hand in tenpai. */
export function availableRiichiDiscards(state: GameState, seat: Seat): Tile[] {
  if (state.ruleset !== 'riichi' || state.phase !== 'discard' || state.turn !== seat) return [];
  const player = state.players[seat];
  if (player.declaredReady || player.melds.some((meld) => !meld.concealed)) return [];
  const candidates = new Set<Tile>();
  for (const tile of player.hand) {
    const hand = [...player.hand];
    if (!removeTile(hand, tile)) continue;
    if (shanten(toCounts(hand), meldCount(player), 'riichi') === 0) candidates.add(tile);
  }
  return [...candidates];
}

/** Arm Riichi; the declaration becomes final on a highlighted tenpai discard. */
export function declareRiichi(state: GameState, seat: Seat): GameState {
  if (availableRiichiDiscards(state, seat).length === 0) return state;
  const next = clone(state);
  next.players[seat].riichiPending = true;
  next.players[seat].doubleRiichiPending = next.players[seat].discards.length === 0 && !next.callsMade;
  next.log.push('Seat ' + seat + ' announces riichi.');
  return next;
}

/** Concealed kans available on the current draw. */
export function availableConcealedKans(state: GameState, seat: Seat): Tile[] {
  if (state.phase !== 'discard' || state.turn !== seat) return [];
  const player = state.players[seat];
  if (state.ruleset === 'riichi' && totalKans(state) >= 4) return [];
  if (player.hand.length % 3 !== 2) return [];
  const counts = handCounts(player);
  const tiles: Tile[] = [];
  for (let i = 0; i < counts.length; i += 1) {
    if (counts[i] !== 4) continue;
    const tile = tileFromIndex(i);
    if (!player.declaredReady || riichiKanPreservesWaits(state, seat, tile)) tiles.push(tile);
  }
  return tiles;
}

/** WRC product rule: a Riichi ankan is legal only when its wait set is unchanged. */
function riichiKanPreservesWaits(state: GameState, seat: Seat, tile: Tile): boolean {
  const player = state.players[seat];
  if (!player.lastDrawn) return false;
  const before = [...player.hand];
  if (!removeTile(before, player.lastDrawn)) return false;
  const after = [...player.hand];
  for (let i = 0; i < 4; i += 1) {
    if (!removeTile(after, tile)) return false;
  }
  const beforeWaits = waitingTiles(toCounts(before), meldCount(player), 'riichi').sort();
  const afterWaits = waitingTiles(toCounts(after), meldCount(player) + 1, 'riichi').sort();
  const fixedTripletForEveryWait = beforeWaits.every((wait) => {
    const winning = toCounts([...before, wait]);
    const sets = decomposeWin(winning, meldCount(player));
    return sets?.some((set) => set.kind === 'triplet' && set.tile === tile);
  });
  return beforeWaits.length > 0 && fixedTripletForEveryWait && beforeWaits.length === afterWaits.length && beforeWaits.every((value, index) => value === afterWaits[index]);
}

/** Added Kongs: promote an already exposed Pung with a self-drawn fourth tile. */
export function availableAddedKans(state: GameState, seat: Seat): Tile[] {
  if (state.ruleset !== 'hongkong' && state.ruleset !== 'riichi') return [];
  if (state.phase !== 'discard' || state.turn !== seat) return [];
  if (state.ruleset === 'riichi' && totalKans(state) >= 4) return [];
  const player = state.players[seat];
  return player.melds
    .filter((meld) => meld.kind === 'pon' && !meld.concealed && player.hand.some((tile) => isSameKind(tile, meld.tiles[0])))
    .map((meld) => meld.tiles[0]);
}

export function availableKans(state: GameState, seat: Seat): Tile[] {
  return [...new Set([...availableConcealedKans(state, seat), ...availableAddedKans(state, seat)])];
}

export function declareConcealedKan(state: GameState, seat: Seat, tile: Tile): GameState {
  if (!availableConcealedKans(state, seat).includes(tile)) return state;
  const next = clone(state);
  const player = next.players[seat];
  const taken: Tile[] = [];
  for (let i = 0; i < 4; i += 1) {
    const removed = takeTileOfKind(player.hand, tile);
    if (removed) taken.push(removed);
  }
  player.melds.push({ kind: 'kan', tiles: sortTiles(taken), concealed: true });
  next.callsMade = true;
  drawReplacement(next, seat);
  // Any call, including a concealed kan, breaks ippatsu for every declared
  // Riichi hand. The next Dora indicator is derived from the kan count.
  if (next.ruleset === 'riichi') {
    for (const participant of next.players) participant.ippatsuEligible = false;
  }
  next.log.push(`Seat ${seat} declares a concealed kan.`);
  next.phase = 'discard';
  return next;
}

/**
 * Announce an Added Kong. The fourth tile remains available for a Robbing the
 * Kong win until every eligible opponent has passed or claimed Ron.
 */
export function declareAddedKan(state: GameState, seat: Seat, tile: Tile, now = Date.now()): GameState {
  if (state.ruleset !== 'hongkong' && state.ruleset !== 'riichi') return state;
  if (!availableAddedKans(state, seat).includes(tile)) return state;
  const next = clone(state);
  const meldIndex = next.players[seat].melds.findIndex(
    (meld) => meld.kind === 'pon' && !meld.concealed && meld.tiles[0] === tile
  );
  if (meldIndex < 0) return state;
  const claims: Partial<Record<Seat, ClaimOption[]>> = {};
  for (const claimant of SEATS) {
    if (claimant === seat) continue;
    const player = next.players[claimant];
    const counts = handCounts(player);
    counts[tileIndex(tile)] += 1;
    if (!isWinningHand(counts, meldCount(player), next.ruleset)) continue;
    const score = scoreHand({ state: { ...next, winContext: 'rob-kong' }, seat: claimant, winningTile: tile, selfDrawn: false });
    const legal = next.ruleset === 'riichi' ? Boolean(score.legalYaku) : score.total >= minimumWinScore(next);
    if (legal) claims[claimant] = [{ kind: 'ron', tiles: [tile] }, { kind: 'pass', tiles: [] }];
  }
  if (Object.keys(claims).length === 0) return completeAddedKan(next, seat, tile, meldIndex);
  next.pendingAddedKan = { seat, tile, meldIndex };
  next.claims = claims;
  next.submitted = {};
  next.claimOpenedAt = now;
  next.phase = 'added-kan-claim';
  next.log.push(`Seat ${seat} declares an added kan; rob-kong window opens.`);
  return next;
}

export function completeAddedKan(state: GameState, seat: Seat, tile: Tile, meldIndex: number): GameState {
  const player = state.players[seat];
  const promoted = takeTileOfKind(player.hand, tile);
  if (!promoted) return state;
  const existing = player.melds[meldIndex];
  player.melds[meldIndex] = { ...existing, kind: 'kan', tiles: sortTiles([...existing.tiles, promoted]) };
  state.callsMade = true;
  drawReplacement(state, seat);
  state.turn = seat;
  state.phase = 'discard';
  state.lastDiscard = null;
  state.pendingAddedKan = undefined;
  if (state.ruleset === 'riichi') {
    for (const participant of state.players) participant.ippatsuEligible = false;
  }
  state.log.push(`Seat ${seat} completes an added kan.`);
  return state;
}

/** Choose the appropriate concealed or added Kong for a tile. */
export function declareKan(state: GameState, seat: Seat, tile: Tile): GameState {
  if (availableConcealedKans(state, seat).includes(tile)) return declareConcealedKan(state, seat, tile);
  return declareAddedKan(state, seat, tile);
}

/** Distance to ready for a seat, useful for hints and the AI. */
export function seatShanten(state: GameState, seat: Seat): number {
  const player = state.players[seat];
  return shanten(handCounts(player), meldCount(player), state.ruleset);
}

/** Tiles that would complete the seat's hand right now. */
export function seatWaits(state: GameState, seat: Seat): Tile[] {
  const player = state.players[seat];
  if (player.hand.length % 3 !== 1) return [];
  return waitingTiles(handCounts(player), meldCount(player), state.ruleset);
}
