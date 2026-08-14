/**
 * Difficulty metrics — live snapshot + lookahead profile (curve tuning).
 */

import { type Board, isCleared, removePair } from './board';
import { rescue } from './generator';
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
