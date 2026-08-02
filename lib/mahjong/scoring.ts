/**
 * Hand scoring.
 *
 * The three rulesets we ship score on different scales, but they recognise a
 * largely overlapping set of patterns. Rather than maintain three separate
 * tables, we detect patterns once and look the value up per ruleset.
 *
 * This is a deliberately pragmatic subset — the common, recognisable patterns
 * that cover the overwhelming majority of real hands. It is not a tournament
 * scorer, and the value tables are the first thing to extend when we add a
 * competitive mode. Patterns are returned alongside the total so the UI can
 * show players *why* they scored, which is the main teaching moment in a hand.
 */

import {
  isDragon,
  isHonour,
  isSimple,
  isTerminalOrHonour,
  tileIndex,
  tileSuit,
  toCounts,
  type Suit,
  type Tile
} from './tiles';
import {
  decomposeWin,
  shantenSevenPairs,
  shantenThirteenOrphans,
  type HandSet
} from './shanten';
import type { GameState, Seat, Ruleset } from './engine';

export interface ScorePattern {
  id: string;
  label: string;
  value: number;
}

export interface ScoreResult {
  total: number;
  patterns: ScorePattern[];
  /** True when the hand is a limit hand for the ruleset. */
  limit: boolean;
}

/** Fan values per ruleset. Missing entries fall back to the Hong Kong value. */
const VALUES: Record<string, Partial<Record<Ruleset, number>> & { base: number }> = {
  selfDraw: { base: 1, 'chinese-official': 1, riichi: 1 },
  concealed: { base: 1, 'chinese-official': 2, riichi: 1 },
  allSimples: { base: 1, 'chinese-official': 2, riichi: 1 },
  allSequences: { base: 1, 'chinese-official': 2, riichi: 1 },
  dragonTriplet: { base: 1, 'chinese-official': 2, riichi: 1 },
  seatWind: { base: 1, 'chinese-official': 2, riichi: 1 },
  roundWind: { base: 1, 'chinese-official': 2, riichi: 1 },
  allTriplets: { base: 3, 'chinese-official': 6, riichi: 2 },
  halfFlush: { base: 3, 'chinese-official': 6, riichi: 2 },
  sevenPairs: { base: 4, 'chinese-official': 24, riichi: 2 },
  littleThreeDragons: { base: 4, 'chinese-official': 6, riichi: 2 },
  fullFlush: { base: 7, 'chinese-official': 24, riichi: 6 },
  allTerminalsHonours: { base: 10, 'chinese-official': 32, riichi: 13 },
  allHonours: { base: 13, 'chinese-official': 64, riichi: 13 },
  bigThreeDragons: { base: 13, 'chinese-official': 88, riichi: 13 },
  fourConcealedTriplets: { base: 13, 'chinese-official': 64, riichi: 13 },
  thirteenOrphans: { base: 13, 'chinese-official': 88, riichi: 13 }
};

const LIMIT: Record<Ruleset, number> = {
  hongkong: 13,
  riichi: 13,
  'chinese-official': 88
};

function value(id: keyof typeof VALUES, ruleset: Ruleset): number {
  const entry = VALUES[id];
  return entry[ruleset] ?? entry.base;
}

export interface ScoreInput {
  state: GameState;
  seat: Seat;
  winningTile: Tile;
  selfDrawn: boolean;
}

export function scoreHand(input: ScoreInput): ScoreResult {
  const { state, seat, selfDrawn, winningTile } = input;
  const ruleset = state.ruleset;
  const player = state.players[seat];
  const patterns: ScorePattern[] = [];

  // A self-drawn win already holds the winning tile; a discard win (ron) does
  // not — the claimed tile leaves the discard pile and completes the hand.
  const concealedTiles = selfDrawn ? [...player.hand] : [...player.hand, winningTile];
  const meldTiles = player.melds.flatMap((m) => m.tiles);
  const allTiles = [...concealedTiles, ...meldTiles];
  const counts = toCounts(concealedTiles);
  const isConcealed = player.melds.every((m) => m.concealed);

  const push = (id: keyof typeof VALUES, label: string) => {
    patterns.push({ id, label, value: value(id, ruleset) });
  };

  // --- Limit hands checked first; they short-circuit everything else. -------
  if (isConcealed && shantenThirteenOrphans(counts) === -1) {
    push('thirteenOrphans', 'Thirteen Orphans');
    return finalise(patterns, ruleset, true);
  }

  const sets = decomposeWin(counts, player.melds.length);
  const isSevenPairs =
    isConcealed && sets === null && shantenSevenPairs(counts, ruleset) === -1;

  if (isSevenPairs) {
    push('sevenPairs', 'Seven Pairs');
  }

  // --- Suit composition ----------------------------------------------------
  const suitsUsed = new Set<Suit>();
  let honourCount = 0;
  for (const tile of allTiles) {
    const suit = tileSuit(tile);
    if (suit === 'z') honourCount += 1;
    else suitsUsed.add(suit);
  }

  if (honourCount === allTiles.length) {
    push('allHonours', 'All Honours');
    return finalise(patterns, ruleset, true);
  }
  if (suitsUsed.size === 1 && honourCount === 0) {
    push('fullFlush', 'Full Flush');
  } else if (suitsUsed.size === 1 && honourCount > 0) {
    push('halfFlush', 'Half Flush');
  }

  if (allTiles.every(isTerminalOrHonour)) {
    push('allTerminalsHonours', 'All Terminals and Honours');
  }
  if (allTiles.every(isSimple)) {
    push('allSimples', 'All Simples');
  }

  // --- Dragons -------------------------------------------------------------
  const allCounts = toCounts(allTiles);
  let dragonSets = 0;
  let dragonPairs = 0;
  for (const tile of ['z5', 'z6', 'z7'] as Tile[]) {
    const n = allCounts[tileIndex(tile)];
    if (n >= 3) dragonSets += 1;
    else if (n === 2) dragonPairs += 1;
  }
  if (dragonSets === 3) {
    push('bigThreeDragons', 'Big Three Dragons');
    return finalise(patterns, ruleset, true);
  }
  if (dragonSets === 2 && dragonPairs === 1) {
    push('littleThreeDragons', 'Little Three Dragons');
  } else {
    for (let i = 0; i < dragonSets; i += 1) {
      push('dragonTriplet', 'Dragon Triplet');
    }
  }

  // --- Winds ---------------------------------------------------------------
  if (allCounts[tileIndex(player.seatWind)] >= 3) {
    push('seatWind', 'Seat Wind Triplet');
  }
  if (
    state.roundWind !== player.seatWind &&
    allCounts[tileIndex(state.roundWind)] >= 3
  ) {
    push('roundWind', 'Round Wind Triplet');
  }

  // --- Set-structure patterns (standard hands only) ------------------------
  if (sets) {
    const blocks: HandSet[] = [
      ...sets,
      ...player.melds.map((m) => ({
        kind: (m.kind === 'chi' ? 'run' : 'triplet') as HandSet['kind'],
        tile: m.tiles[0],
        open: !m.concealed
      }))
    ];
    const tripletBlocks = blocks.filter((b) => b.kind === 'triplet');
    const runBlocks = blocks.filter((b) => b.kind === 'run');

    if (tripletBlocks.length === 4) {
      const concealedTriplets = tripletBlocks.filter((b) => !b.open).length;
      if (concealedTriplets === 4 && isConcealed) {
        push('fourConcealedTriplets', 'Four Concealed Triplets');
        return finalise(patterns, ruleset, true);
      }
      push('allTriplets', 'All Triplets');
    }
    if (runBlocks.length === 4 && isConcealed) {
      push('allSequences', 'All Sequences');
    }
  }

  // --- Conditions of the win itself ----------------------------------------
  if (selfDrawn) push('selfDraw', 'Self Draw');
  if (isConcealed && !selfDrawn) push('concealed', 'Fully Concealed');

  return finalise(patterns, ruleset, false);
}

function finalise(
  patterns: ScorePattern[],
  ruleset: Ruleset,
  forcedLimit: boolean
): ScoreResult {
  const raw = patterns.reduce((sum, p) => sum + p.value, 0);
  const cap = LIMIT[ruleset];
  const total = Math.min(raw, cap);
  return { total, patterns, limit: forcedLimit || raw >= cap };
}

/** Convenience for the UI: a one-line summary of a score result. */
export function describeScore(result: ScoreResult): string {
  if (result.patterns.length === 0) return 'No scoring patterns';
  return result.patterns.map((p) => `${p.label} (+${p.value})`).join(' · ');
}

/** Re-exported so callers do not need to reach into tiles.ts for this check. */
export { isDragon, isHonour };
