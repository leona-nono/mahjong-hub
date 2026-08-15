/**
 * Difficulty metrics — live snapshot + lookahead profile (curve tuning).
 */

import { type Board, isCleared, removePair } from './board';
import { generateSolvable, rescue } from './generator';
import type { SolitaireLayout } from './layouts';
import { findPairs, isDead } from './solver';

/** Cheap live snapshot (safe for UI every frame). */
export interface DifficultyMetrics {
  branchWidth: number;
  remaining: number;
  hardnessScore: number;
  faceDiversity: number;
}

export function measureDifficulty(board: Board): DifficultyMetrics {
  const branchWidth = findPairs(board).length;
  const remaining = board.remaining;
  const faces = new Set(
    board.tiles.filter((t): t is NonNullable<typeof t> => t !== null)
  );
  const hardnessScore =
    remaining === 0
      ? 0
      : Math.round((remaining / Math.max(1, branchWidth * 2)) * 10) / 10;
  return {
    branchWidth,
    remaining,
    hardnessScore,
    faceDiversity: faces.size
  };
}

/**
 * 1-step lookahead clear profile (design: curve tuning, not solvability proof).
 * Prefer this offline / in tests — not on every React render for classic 144.
 */
export interface DifficultyProfile {
  solved: boolean;
  steps: number;
  /** Average simultaneous matching pairs (higher = easier). */
  avgBranch: number;
  /** Lowest simultaneous matching pairs (lower = easier to dead-end). */
  minBranch: number;
}

export function profileDifficulty(board: Board): DifficultyProfile {
  let current: Board = {
    ...board,
    tiles: [...board.tiles],
    history: [...board.history]
  };
  let sum = 0;
  let minB = Infinity;
  let steps = 0;

  while (current.remaining > 0) {
    const moves = findPairs(current);
    if (moves.length === 0) break;

    let best = moves[0];
    let bestScore = -1;
    const capped = moves.slice(0, 12);
    for (const [i, j] of capped) {
      const trial = removePair(current, i, j);
      const score = findPairs(trial).length;
      if (score > bestScore) {
        bestScore = score;
        best = [i, j];
      }
    }
    current = removePair(current, best[0], best[1]);
    sum += moves.length;
    minB = Math.min(minB, moves.length);
    steps += 1;
  }

  return {
    solved: isCleared(current),
    steps,
    avgBranch: steps > 0 ? sum / steps : 0,
    minBranch: minB === Infinity ? 0 : minB
  };
}

export interface ClearSimResult {
  greedyMoves: number;
  deadEnds: number;
  cleared: boolean;
}

/**
 * Naive greedy clear: always take the first available pair.
 * Counts dead-ends (proxy for shuffles needed under weak play).
 */
export function simulateGreedyClear(
  board: Board,
  opts?: { maxRescues?: number; seed?: number }
): ClearSimResult {
  const maxRescues = opts?.maxRescues ?? 8;
  let seed = opts?.seed ?? board.seed + 17;
  let current = board;
  let greedyMoves = 0;
  let deadEnds = 0;

  while (!isCleared(current) && deadEnds <= maxRescues) {
    const pairs = findPairs(current, 1);
    if (pairs.length === 0) {
      if (current.remaining === 0) break;
      deadEnds += 1;
      if (deadEnds > maxRescues) {
        return { greedyMoves, deadEnds, cleared: false };
      }
      seed += 1;
      current = rescue(current, seed);
      continue;
    }
    const [a, b] = pairs[0];
    current = removePair(current, a, b);
    greedyMoves += 1;
  }

  return {
    greedyMoves,
    deadEnds,
    cleared: isCleared(current)
  };
}

export function opensDead(board: Board): boolean {
  return isDead(board);
}

export const SEG_LENS = [5, 4, 3] as const;
export const SEG_PEAKS = [22, 28, 34] as const;
export const ALPHA_EASY = 12;
export const ALPHA_FULL = 36;
export const DEFAULT_CATALOG_SEED = 20260814;
export const DAILY_ALPHABET = 30;

export type DifficultyBand = 'ease' | 'ramp' | 'peak';

export interface LevelInfo {
  level: number;
  segment: number;
  posInSegment: number;
  segmentLen: number;
  segmentPeak: number;
  t: number;
  alphabet: number;
  band: DifficultyBand;
}

export interface CatalogEntry {
  level: number;
  seed: number;
  alphabet: number;
  layout: SolitaireLayout;
  band: DifficultyBand;
  segment: number;
  /** Opening simultaneous pairs (cheap). Higher = easier. */
  openBranch: number;
  /** Full lookahead average; only when catalog built with profile:true. */
  avgBranch?: number;
}

export function smoothstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function cycleAt<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length]!;
}

/**
 * Campaign level → segment + alphabet. `level` is 1-based and excludes teaching.
 */
export function levelInfo(
  level: number,
  segLens: readonly number[] = SEG_LENS,
  segPeaks: readonly number[] = SEG_PEAKS
): LevelInfo {
  const n = Math.max(1, Math.floor(level));
  let remaining = n - 1;
  let segment = 0;
  for (;;) {
    const segmentLen = cycleAt(segLens, segment);
    if (remaining < segmentLen) {
      const posInSegment = remaining;
      const segmentPeak = cycleAt(segPeaks, segment);
      const t = segmentLen <= 1 ? 1 : posInSegment / (segmentLen - 1);
      const alphabet = Math.round(
        ALPHA_EASY + (segmentPeak - ALPHA_EASY) * smoothstep(t)
      );
      const band: DifficultyBand =
        posInSegment === 0
          ? 'ease'
          : posInSegment === segmentLen - 1
            ? 'peak'
            : 'ramp';
      return {
        level: n,
        segment,
        posInSegment,
        segmentLen,
        segmentPeak,
        t,
        alphabet,
        band
      };
    }
    remaining -= segmentLen;
    segment += 1;
  }
}

/** Deal knobs derived from alphabet (design §3.2). */
export function campaignDealOpts(alphabet: number) {
  return {
    alphabet,
    includeBonus: alphabet >= 18,
    avoidLookalikes: alphabet < 18,
    forceFlowerPairs: alphabet >= 18
  };
}

export function campaignSeed(
  level: number,
  seedBase = DEFAULT_CATALOG_SEED,
  candidate = 0
): number {
  return (seedBase + Math.imul(level, 1_000_003) + candidate * 997) >>> 0;
}

function mixSeed(seed: number, rotate: number): number {
  return (Math.imul(seed ^ rotate, 1664525) + 1013904223) >>> 0;
}

/**
 * Offline catalog: each row is replay-proven. Soft-smooths opening branch
 * within a segment (prefer not easier than previous). New segment resets.
 */
export function buildSeedCatalog(
  totalLevels: number,
  seedBase = DEFAULT_CATALOG_SEED,
  layout: SolitaireLayout = 'classic',
  opts?: { candidatesPerLevel?: number; profile?: boolean }
): CatalogEntry[] {
  const candidatesPerLevel = opts?.candidatesPerLevel ?? 6;
  const doProfile = opts?.profile ?? false;
  const out: CatalogEntry[] = [];
  let prevBranch = Infinity;
  let prevSegment = -1;

  for (let level = 1; level <= totalLevels; level += 1) {
    const info = levelInfo(level);
    if (info.segment !== prevSegment) {
      prevBranch = Infinity;
      prevSegment = info.segment;
    }

    const deal = campaignDealOpts(info.alphabet);
    const viable: CatalogEntry[] = [];

    for (let c = 0; c < candidatesPerLevel; c += 1) {
      const seed = campaignSeed(level, seedBase, c);
      const gen = generateSolvable({
        layout,
        seed,
        ...deal
      });
      if (!gen) continue;
      const openBranch = measureDifficulty(gen.board).branchWidth;
      const entry: CatalogEntry = {
        level,
        seed: gen.seed,
        alphabet: info.alphabet,
        layout,
        band: info.band,
        segment: info.segment,
        openBranch
      };
      if (doProfile) {
        entry.avgBranch = profileDifficulty(gen.board).avgBranch;
      }
      viable.push(entry);
    }

    if (viable.length === 0) {
      throw new Error(`no solvable catalog seed for level ${level} (${layout})`);
    }

    const metric = (e: CatalogEntry) => e.avgBranch ?? e.openBranch;
    const fitting = viable.filter((e) => metric(e) <= prevBranch);
    const chosen = (fitting.length > 0 ? fitting : viable).reduce((best, e) =>
      metric(e) <= metric(best) ? e : best
    );
    out.push(chosen);
    prevBranch = metric(chosen);
  }

  return out;
}

export function pickLevel(
  catalog: CatalogEntry[],
  level: number,
  rotateSeed?: number
): CatalogEntry | null {
  const entry = catalog.find((e) => e.level === level) ?? null;
  if (!entry) return null;
  if (rotateSeed == null) return entry;
  return { ...entry, seed: mixSeed(entry.seed, rotateSeed) };
}

/** UTC calendar day → daily challenge deal (independent of campaign segments). */
export function dailyChallengeSpec(
  utcDay: string,
  alphabet = DAILY_ALPHABET
): { seed: number; alphabet: number; layout: 'classic' } {
  let h = 2166136261;
  for (let i = 0; i < utcDay.length; i += 1) {
    h = Math.imul(h ^ utcDay.charCodeAt(i), 16777619);
  }
  return { seed: h >>> 0, alphabet, layout: 'classic' };
}
