/**
 * Shanten (distance-to-ready) calculation and win detection.
 *
 * `shanten` is the number of tile exchanges still needed to reach a ready hand.
 *   -1 = winning hand
 *    0 = ready (tenpai)
 *    n = n tiles away
 *
 * Three hand shapes are supported:
 *   - standard: 4 sets + 1 pair
 *   - seven pairs (chiitoitsu) — concealed hands only
 *   - thirteen orphans (kokushi musou) — concealed hands only
 *
 * All of this is written from scratch against the published rules; the search is
 * a straightforward exhaustive decomposition, which is fast enough at 14 tiles
 * and much easier to verify than a lookup-table approach.
 */

import {
  TILE_KINDS,
  ORPHAN_TILES,
  tileIndex,
  tileFromIndex,
  type Tile
} from './tiles';
import type { Ruleset } from './engine';

/** Blocks that make up a decomposed hand. */
export type SetKind = 'triplet' | 'run' | 'pair';

export interface HandSet {
  kind: SetKind;
  /** Lowest tile of the block. */
  tile: Tile;
  /** True when the block came from a called meld rather than the hand. */
  open?: boolean;
}

const ORPHAN_INDEXES = ORPHAN_TILES.map(tileIndex);

/**
 * Persistent memo cache for `shanten`, keyed by the counts array plus meld
 * count. The AI calls shanten hundreds of times per move on the same handful
 * of tile multisets, so the hit rate is high. A cap keeps a long-lived session
 * from growing the map without bound — when the cap is exceeded we clear it
 * and start fresh, which is a cheap price for bounded memory.
 */
const SHANTEN_CACHE_LIMIT = 5000;
const shantenCache = new Map<string, number>();

/** True when index `i` starts a valid run (same suit, ranks r, r+1, r+2). */
function canStartRun(i: number): boolean {
  if (i >= 27) return false; // honours never form runs
  return i % 9 <= 6;
}

/** True when index `i` and `i + gap` are in the same numbered suit. */
function sameSuitWithin(i: number, gap: number): boolean {
  if (i >= 27) return false;
  return i % 9 <= 8 - gap;
}

/**
 * Maximise (2 * sets + partials) over every decomposition of `counts`.
 * `blockBudget` caps how many blocks may still be taken so we never count more
 * than four non-pair blocks.
 */
function searchBlocks(
  counts: number[],
  start: number,
  sets: number,
  partials: number,
  blockBudget: number
): { sets: number; partials: number } {
  let i = start;
  while (i < TILE_KINDS && counts[i] === 0) i += 1;
  if (i >= TILE_KINDS || blockBudget <= 0) return { sets, partials };

  let best = { sets, partials };
  const consider = (candidate: { sets: number; partials: number }) => {
    const score = candidate.sets * 2 + candidate.partials;
    if (score > best.sets * 2 + best.partials) best = candidate;
  };

  // Complete triplet.
  if (counts[i] >= 3) {
    counts[i] -= 3;
    consider(searchBlocks(counts, i, sets + 1, partials, blockBudget - 1));
    counts[i] += 3;
  }

  // Complete run.
  if (canStartRun(i) && counts[i + 1] > 0 && counts[i + 2] > 0) {
    counts[i] -= 1;
    counts[i + 1] -= 1;
    counts[i + 2] -= 1;
    consider(searchBlocks(counts, i, sets + 1, partials, blockBudget - 1));
    counts[i] += 1;
    counts[i + 1] += 1;
    counts[i + 2] += 1;
  }

  // Partial: pair waiting to become a triplet.
  if (counts[i] >= 2) {
    counts[i] -= 2;
    consider(searchBlocks(counts, i, sets, partials + 1, blockBudget - 1));
    counts[i] += 2;
  }

  // Partial: two adjacent tiles (open or edge wait).
  if (sameSuitWithin(i, 1) && counts[i + 1] > 0) {
    counts[i] -= 1;
    counts[i + 1] -= 1;
    consider(searchBlocks(counts, i, sets, partials + 1, blockBudget - 1));
    counts[i] += 1;
    counts[i + 1] += 1;
  }

  // Partial: gap of one (closed wait).
  if (sameSuitWithin(i, 2) && counts[i + 2] > 0) {
    counts[i] -= 1;
    counts[i + 2] -= 1;
    consider(searchBlocks(counts, i, sets, partials + 1, blockBudget - 1));
    counts[i] += 1;
    counts[i + 2] += 1;
  }

  // Discard this tile as a floater and move on.
  counts[i] -= 1;
  consider(searchBlocks(counts, i, sets, partials, blockBudget));
  counts[i] += 1;

  return best;
}

/**
 * Shanten for the standard 4-sets-plus-pair shape.
 * `meldCount` is the number of already-called melds (each counts as a set).
 */
export function shantenStandard(counts: number[], meldCount = 0): number {
  const work = [...counts];
  let best = Infinity;

  const evaluate = (hasPair: boolean) => {
    const budget = 4 - meldCount;
    const { sets, partials } = searchBlocks(work, 0, meldCount, 0, budget);
    const cappedPartials = Math.min(partials, 4 - sets);
    const value = 8 - 2 * sets - cappedPartials - (hasPair ? 1 : 0);
    if (value < best) best = value;
  };

  // Without an explicit pair.
  evaluate(false);

  // With each possible pair pulled out first.
  for (let i = 0; i < TILE_KINDS; i += 1) {
    if (work[i] >= 2) {
      work[i] -= 2;
      evaluate(true);
      work[i] += 2;
    }
  }

  return best;
}

/**
 * Shanten for seven pairs. Concealed hands only.
 *
 * The rulesets disagree on whether a four-of-a-kind counts as two pairs:
 * Japanese riichi requires seven *distinct* pairs, so a kind with 3+ tiles
 * contributes at most one pair and the extras are dead weight; Hong Kong and
 * Chinese Official let a concealed quad split into two pairs (`floor(c / 2)`).
 */
export function shantenSevenPairs(
  counts: number[],
  ruleset: Ruleset = 'hongkong'
): number {
  const strict = ruleset === 'riichi';
  let pairs = 0;
  let singles = 0;
  for (let i = 0; i < TILE_KINDS; i += 1) {
    const c = counts[i];
    if (strict) {
      if (c >= 2) pairs += 1;
      else if (c === 1) singles += 1;
    } else {
      pairs += Math.floor(c / 2);
      if (c % 2 === 1) singles += 1;
    }
  }
  // Draws to a win: complete existing singles (1 draw each), then start brand
  // new pairs from absent kinds (2 draws each). Shanten is draws minus one.
  const needed = Math.max(0, 7 - pairs);
  const draws = Math.min(needed, singles) + 2 * Math.max(0, needed - singles);
  return draws - 1;
}

/** Shanten for thirteen orphans. Concealed hands only. */
export function shantenThirteenOrphans(counts: number[]): number {
  let kinds = 0;
  let hasPair = false;
  for (const i of ORPHAN_INDEXES) {
    if (counts[i] > 0) kinds += 1;
    if (counts[i] >= 2) hasPair = true;
  }
  return 13 - kinds - (hasPair ? 1 : 0);
}

/**
 * Best shanten across all supported shapes.
 * Seven pairs and thirteen orphans are only legal with a fully concealed hand.
 *
 * Memoised on the counts array plus meld count and ruleset — the dominating
 * caller is the bot AI, which repeatedly evaluates near-identical hands while
 * choosing a discard. The cache is capped to bound memory in long sessions.
 */
export function shanten(
  counts: number[],
  meldCount = 0,
  ruleset: Ruleset = 'hongkong'
): number {
  if (shantenCache.size >= SHANTEN_CACHE_LIMIT) shantenCache.clear();
  // The ruleset changes the result, so it must be part of the key.
  const key = `${ruleset}|${meldCount}|${counts.join(',')}`;
  const cached = shantenCache.get(key);
  if (cached !== undefined) return cached;

  let best = shantenStandard(counts, meldCount);
  if (meldCount === 0) {
    best = Math.min(
      best,
      shantenSevenPairs(counts, ruleset),
      shantenThirteenOrphans(counts)
    );
  }
  shantenCache.set(key, best);
  return best;
}

/** A hand is complete when its shanten is -1. */
export function isWinningHand(
  counts: number[],
  meldCount = 0,
  ruleset: Ruleset = 'hongkong'
): boolean {
  return shanten(counts, meldCount, ruleset) === -1;
}

/** A hand is ready when its shanten is 0. */
export function isReady(
  counts: number[],
  meldCount = 0,
  ruleset: Ruleset = 'hongkong'
): boolean {
  return shanten(counts, meldCount, ruleset) === 0;
}

/**
 * Every tile that would complete the hand.
 * Expects a 13-tile (mod 3 === 1) hand plus its melds.
 */
export function waitingTiles(
  counts: number[],
  meldCount = 0,
  ruleset: Ruleset = 'hongkong'
): Tile[] {
  const waits: Tile[] = [];
  const work = [...counts];
  for (let i = 0; i < TILE_KINDS; i += 1) {
    if (work[i] >= 4) continue; // all four copies already visible in hand
    work[i] += 1;
    if (isWinningHand(work, meldCount, ruleset)) waits.push(tileFromIndex(i));
    work[i] -= 1;
  }
  return waits;
}

/**
 * Decompose a completed standard hand into its blocks.
 * Returns null for hands that are complete only as seven pairs or orphans —
 * those are scored by their own rule, not by block structure.
 */
export function decomposeWin(counts: number[], meldCount = 0): HandSet[] | null {
  return decomposeWins(counts, meldCount)[0] ?? null;
}

/**
 * Enumerate every standard-hand decomposition. A completed hand can have more
 * than one legal grouping; Riichi scoring must use the grouping that produces
 * the highest legal value (not simply the first DFS result).
 */
export function decomposeWins(counts: number[], meldCount = 0): HandSet[][] {
  const work = [...counts];
  const found: HandSet[][] = [];

  const recurse = (start: number, need: number, acc: HandSet[]): void => {
    let i = start;
    while (i < TILE_KINDS && work[i] === 0) i += 1;
    if (i >= TILE_KINDS) {
      if (need === 0) found.push(acc);
      return;
    }
    if (need === 0) return;

    if (work[i] >= 3) {
      work[i] -= 3;
      recurse(i, need - 1, [
        ...acc,
        { kind: 'triplet', tile: tileFromIndex(i) }
      ]);
      work[i] += 3;
    }

    if (canStartRun(i) && work[i + 1] > 0 && work[i + 2] > 0) {
      work[i] -= 1;
      work[i + 1] -= 1;
      work[i + 2] -= 1;
      recurse(i, need - 1, [
        ...acc,
        { kind: 'run', tile: tileFromIndex(i) }
      ]);
      work[i] += 1;
      work[i + 1] += 1;
      work[i + 2] += 1;
    }
  };

  for (let i = 0; i < TILE_KINDS; i += 1) {
    if (work[i] < 2) continue;
    work[i] -= 2;
    const start = found.length;
    recurse(0, 4 - meldCount, []);
    work[i] += 2;
    // The recursion is run before restoring the pair. Its results belong to
    // this pair only, so append it immediately instead of retaining a mutable
    // pair reference.
    for (let index = start; index < found.length; index += 1) {
      found[index] = [...found[index], { kind: 'pair', tile: tileFromIndex(i) }];
    }
  }

  return found;
}
