/**
 * Bot opponents.
 *
 * The bots play an efficiency game: minimise shanten, break ties on ukeire (how
 * many tiles still in the wall would improve the hand), and prefer throwing away
 * isolated honours early. That is roughly how a competent casual player thinks,
 * which is the right target — bots that play a perfect defensive game are not
 * fun for the audience this site is for.
 *
 * Difficulty scales how much search the bot is allowed to do, not how much it is
 * allowed to cheat. Bots never see hidden information.
 */

import {
  COPIES_PER_TILE,
  TILE_KINDS,
  isHonour,
  isTerminalOrHonour,
  tileIndex,
  toCounts,
  type Tile
} from './tiles';
import { shanten } from './shanten';
import {
  availableConcealedKans,
  canDeclareTsumo,
  seatShanten,
  type ClaimOption,
  type GameState,
  type Seat
} from './engine';

export type Difficulty = 'easy' | 'normal' | 'hard';

export type BotMove =
  | { type: 'tsumo' }
  | { type: 'kan'; tile: Tile }
  | { type: 'discard'; tile: Tile };

/**
 * Unseen copies per tile kind: how many of each kind are not yet visible in any
 * discard, meld, or the seat's own hand. Computed once per acceptance call —
 * scanning the whole table inside the 34-kind loop would do the same work 34
 * times for no benefit.
 */
function unseenCounts(state: GameState, seat: Seat): number[] {
  const seen = new Array<number>(TILE_KINDS).fill(0);
  for (const player of state.players) {
    for (const t of player.discards) seen[tileIndex(t)] += 1;
    for (const meld of player.melds) {
      for (const t of meld.tiles) seen[tileIndex(t)] += 1;
    }
  }
  for (const t of state.players[seat].hand) seen[tileIndex(t)] += 1;
  return seen.map((n) => Math.max(0, COPIES_PER_TILE - n));
}

/**
 * Ukeire: total number of unseen tiles that would reduce the hand's shanten.
 * Higher is better — it is the single most useful tie-breaker for discards.
 */
function acceptance(state: GameState, seat: Seat, hand: Tile[], melds: number): number {
  const counts = toCounts(hand);
  const current = shanten(counts, melds, state.ruleset);
  const unseen = unseenCounts(state, seat);
  let total = 0;
  for (let i = 0; i < TILE_KINDS; i += 1) {
    if (counts[i] >= COPIES_PER_TILE) continue;
    counts[i] += 1;
    const improved = shanten(counts, melds, state.ruleset) < current;
    counts[i] -= 1;
    if (improved) total += unseen[i];
  }
  return total;
}

/**
 * Cheap heuristic used to break remaining ties and to drive the easy bots.
 * Lower means "safer to throw away".
 */
function keepValue(hand: Tile[], tile: Tile): number {
  const counts = toCounts(hand);
  const index = tileIndex(tile);
  const copies = counts[index];
  if (copies >= 2) return 6; // pairs and triplets are worth holding

  if (isHonour(tile)) return 0; // lone honours go first

  // Lone terminals are worth slightly more than lone honours, less than simples.
  let neighbours = 0;
  for (const gap of [-2, -1, 1, 2]) {
    const neighbour = index + gap;
    if (neighbour < 0 || neighbour >= 27) continue;
    if (Math.floor(neighbour / 9) !== Math.floor(index / 9)) continue;
    if (counts[neighbour] > 0) neighbours += Math.abs(gap) === 1 ? 2 : 1;
  }
  return (isTerminalOrHonour(tile) ? 1 : 2) + neighbours;
}

/** Choose what a bot does while holding a 14-tile hand. */
export function chooseMove(
  state: GameState,
  seat: Seat,
  difficulty: Difficulty = 'normal'
): BotMove {
  const player = state.players[seat];

  if (canDeclareTsumo(state, seat)) return { type: 'tsumo' };

  // A declared Riichi hand is locked to tsumogiri.  This check must happen
  // before the generic discard heuristic, otherwise a bot can select an
  // illegal tile and stall its own turn.
  if (state.ruleset === 'riichi' && player.declaredReady && player.lastDrawn) {
    return { type: 'discard', tile: player.lastDrawn };
  }

  // Kan only when it does not break a hand that is already close to ready.
  if (difficulty !== 'easy') {
    const kans = availableConcealedKans(state, seat);
    if (kans.length > 0 && seatShanten(state, seat) >= 2) {
      return { type: 'kan', tile: kans[0] };
    }
  }

  const candidates = Array.from(new Set(player.hand));
  const meldCount = player.melds.length;

  let best: { tile: Tile; shanten: number } | null = null;
  const scored = candidates.map((tile) => {
    const rest = [...player.hand];
    rest.splice(rest.indexOf(tile), 1);
    const value = shanten(toCounts(rest), meldCount, state.ruleset);
    if (!best || value < best.shanten) best = { tile, shanten: value };
    return { tile, rest, shanten: value };
  });

  const minShanten = best!.shanten;
  const tied = scored.filter((c) => c.shanten === minShanten);

  if (tied.length === 1 || difficulty === 'easy') {
    const pick = tied.reduce((a, b) =>
      keepValue(player.hand, a.tile) <= keepValue(player.hand, b.tile) ? a : b
    );
    return { type: 'discard', tile: pick.tile };
  }

  // Full ukeire comparison is only worth its cost on the tied candidates.
  const limit = difficulty === 'hard' ? tied.length : Math.min(tied.length, 5);
  let bestPick = tied[0];
  let bestScore = -1;
  for (const candidate of tied.slice(0, limit)) {
    const score =
      acceptance(state, seat, candidate.rest, meldCount) * 10 -
      keepValue(player.hand, candidate.tile);
    if (score > bestScore) {
      bestScore = score;
      bestPick = candidate;
    }
  }

  return { type: 'discard', tile: bestPick.tile };
}

/**
 * Choose how a bot answers a claim window.
 * Ron is always taken; melds are only called when they genuinely advance the hand.
 */
export function chooseClaim(
  state: GameState,
  seat: Seat,
  options: ClaimOption[],
  difficulty: Difficulty = 'normal'
): ClaimOption {
  const pass: ClaimOption = { kind: 'pass', tiles: [] };

  const ron = options.find((o) => o.kind === 'ron');
  if (ron) return ron;

  if (difficulty === 'easy') {
    // Easy bots call pon on honours only — keeps their hands readable.
    const pon = options.find((o) => o.kind === 'pon' && isHonour(o.tiles[0]));
    return pon ?? pass;
  }

  const player = state.players[seat];
  const discarded = state.lastDiscard?.tile;
  if (!discarded) return pass;

  const before = shanten(toCounts(player.hand), player.melds.length, state.ruleset);

  let bestOption = pass;
  let bestAfter = before;

  for (const option of options) {
    if (option.kind === 'ron' || option.kind === 'pass') continue;
    const rest = [...player.hand];
    let ok = true;
    for (const tile of option.tiles) {
      const at = rest.indexOf(tile);
      if (at === -1) {
        ok = false;
        break;
      }
      rest.splice(at, 1);
    }
    if (!ok) continue;

    const after = shanten(
      toCounts(rest),
      player.melds.length + 1,
      state.ruleset
    );
    // Calling opens the hand, so only do it for a real gain.
    if (after < bestAfter) {
      bestAfter = after;
      bestOption = option;
    }
  }

  // Don't open a hand this early for a marginal sequence.
  if (bestOption.kind === 'chi' && before >= 4) return pass;

  return bestOption;
}
