/**
 * Solitaire scoring — base points + 5s combo window (design E9).
 */

export const COMBO_WINDOW_MS = 5000;
export const BASE_MATCH_SCORE = 10;
export const MAX_COMBO = 5;

export interface ScoreState {
  score: number;
  combo: number;
  lastMatchAt: number;
}

export function nextCombo(
  prevCombo: number,
  lastMatchAt: number,
  now: number
): number {
  if (lastMatchAt > 0 && now - lastMatchAt < COMBO_WINDOW_MS) {
    return Math.min(prevCombo + 1, MAX_COMBO);
  }
  return 1;
}

export function scoreForCombo(combo: number): number {
  const c = Math.max(1, Math.min(combo, MAX_COMBO));
  return BASE_MATCH_SCORE * c;
}

/** Apply one successful match to the score state. */
export function applyMatchScore(state: ScoreState, now: number): ScoreState & {
  gained: number;
} {
  const combo = nextCombo(state.combo, state.lastMatchAt, now);
  const gained = scoreForCombo(combo);
  return {
    score: state.score + gained,
    combo,
    lastMatchAt: now,
    gained
  };
}

/** Theoretical max score for `pairCount` matches (always max combo). */
export function theoreticalMaxScore(pairCount: number): number {
  if (pairCount <= 0) return 0;
  let total = 0;
  for (let i = 1; i <= pairCount; i += 1) {
    total += scoreForCombo(Math.min(i, MAX_COMBO));
  }
  return total;
}
