/**
 * Light client-side coach feedback budget (Phase B2).
 * Pure helpers — React state lives in the table components.
 */

import type { CoachGrade, CoachVerdict } from '@/lib/mahjong/coach/contract';

export type CoachOutputLevel = 0 | 1 | 2 | 3 | 4;

export interface CoachBudgetState {
  /** Automatic expands this hand (live mode). Cap 2. */
  expands: number;
  /** Times the coach "spoke" (L2+). Cap 4. */
  speaks: number;
  /** Consecutive best grades (for praise L2). */
  bestStreak: number;
}

export const EMPTY_COACH_BUDGET: CoachBudgetState = {
  expands: 0,
  speaks: 0,
  bestStreak: 0
};

const MAX_EXPANDS = 2;
const MAX_SPEAKS = 4;

/**
 * Decide output level for a verdict.
 * Review P1-11: when tenpai (shanten <= 0), do not praise consecutive best,
 * but still escalate on `better`.
 */
export function resolveCoachLevel(
  verdict: CoachVerdict,
  budget: CoachBudgetState,
  opts: { intensity: 'silent' | 'ask' | 'live'; asked: boolean; tenpai: boolean }
): CoachOutputLevel {
  if (opts.intensity === 'silent') return 0;
  if (verdict.capability === 'unsupported') return 1; // watching blink only
  if (opts.intensity === 'ask' && !opts.asked) return 0;

  const grade = verdict.grade;

  // L3: better always (including tenpai mistakes)
  if (grade === 'better') {
    if (budget.speaks >= MAX_SPEAKS) return 1;
    return 3;
  }

  // partial / no grade: L1 marker only
  if (grade === null) return 1;

  // best / acceptable
  if (grade === 'acceptable') return 1;

  // best
  if (opts.tenpai) return 1; // no praise streak while tenpai
  if (budget.bestStreak + 1 >= 3 && budget.speaks < MAX_SPEAKS && budget.expands < MAX_EXPANDS) {
    return 2; // praise
  }
  return 1;
}

export function advanceCoachBudget(
  budget: CoachBudgetState,
  level: CoachOutputLevel,
  grade: CoachGrade | null
): CoachBudgetState {
  let { expands, speaks, bestStreak } = budget;
  if (level >= 2) {
    speaks += 1;
    if (level === 2) expands += 1;
  }
  if (grade === 'best') bestStreak += 1;
  else bestStreak = 0;
  return { expands, speaks, bestStreak };
}

/** Whether the panel should render a full card (vs tiny marker). */
export function shouldExpandPanel(level: CoachOutputLevel): boolean {
  return level >= 2;
}
