/**
 * Difficulty metrics for a live board (design: smooth curve, not cliff).
 */

import { type Board, isCleared, removePair } from './board';
import { rescue } from './generator';
import { findPairs, isDead } from './solver';

export interface DifficultyMetrics {
  /** Current open matching pairs. */
  branchWidth: number;
  remaining: number;
  /** Higher = fewer branches relative to tiles left. */
  hardnessScore: number;
  /** Distinct face ids still on board (diversity proxy). */
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

export interface ClearSimResult {
  /** Greedy match steps taken (excluding rescues). */
  greedyMoves: number;
  /** Times the board went dead and needed a simulated rescue. */
  deadEnds: number;
  cleared: boolean;
}

/**
 * Greedy clear simulation: always take the first available pair.
 * Counts dead-ends (proxy for “shuffles needed” under naive play).
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

/** True when the opening position already has no moves (should be rare). */
export function opensDead(board: Board): boolean {
  return isDead(board);
}
