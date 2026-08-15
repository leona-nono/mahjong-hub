/**
 * Solitaire campaign/daily scoring + streak (isomorphic, no Prisma).
 * Design: mahjong-solitaire-design.md A1/A2/A4, difficulty v0.3 §6.
 */

import { addUtcDays } from '../points-rules';
import { layoutTileCount, type SolitaireLayout } from './layouts';
import { theoreticalMaxScore } from './scoring';
import { starsForLevel } from './items';
import type { DifficultyBand } from './difficulty';

export const CAMPAIGN_CLEAR_BASE = 40;
export const STAR_BONUS: Record<1 | 2 | 3, number> = { 1: 0, 2: 20, 3: 40 };
export const DAILY_CLEAR_POINTS = 300;
export const STREAK_CYCLE_BONUS = 500;
export const STREAK_CYCLE = 7;
export const DAILY_ID_PREFIX = 'daily:';

export type LevelKind = 'teach' | 'campaign' | 'daily' | 'unknown';

export interface SolitaireDeal {
  id: string;
  seed: number;
  layout: SolitaireLayout;
  alphabet?: number;
  includeBonus?: boolean;
  avoidLookalikes?: boolean;
  forceFlowerPairs?: boolean;
  band?: DifficultyBand;
  segment?: number;
}

export function parseDailyLevelId(id: string): string | null {
  if (!id.startsWith(DAILY_ID_PREFIX)) return null;
  const day = id.slice(DAILY_ID_PREFIX.length);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}

export function dailyLevelId(utcDay: string): string {
  return `${DAILY_ID_PREFIX}${utcDay}`;
}

export function levelKind(id: string): LevelKind {
  if (id.startsWith('teach-')) return 'teach';
  if (parseDailyLevelId(id)) return 'daily';
  if (/^lv-\d+$/.test(id)) return 'campaign';
  return 'unknown';
}

export function campaignClearPoints(stars: 1 | 2 | 3): number {
  return CAMPAIGN_CLEAR_BASE + STAR_BONUS[stars];
}

export function streakCycleBonus(streak: number): number {
  if (streak > 0 && streak % STREAK_CYCLE === 0) return STREAK_CYCLE_BONUS;
  return 0;
}

export function minClearMs(tileCount: number): number {
  const pairs = Math.max(0, Math.floor(tileCount / 2));
  return Math.max(1500, pairs * 80);
}

/** ISO week key (UTC) for weekly freeze quota. */
export function isoWeekKey(utcDay: string): string {
  const date = new Date(`${utcDay}T12:00:00.000Z`);
  const target = new Date(date.valueOf());
  const dayNr = (date.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7
    );
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export interface DailyStreakInput {
  lastClearDate: string | null;
  streak: number;
  freezeWeekKey: string | null;
  today: string;
}

export interface DailyStreakPlan {
  alreadyClearedToday: boolean;
  streak: number;
  consumeFreeze: boolean;
  freezeWeekKey: string | null;
  freezeAvailable: boolean;
}

/**
 * Consecutive UTC days. One missed day per ISO week is filled by freeze grace
 * (silver-hair streak). Freeze does not increment for the skipped day; the
 * clear still +1 vs last real clear.
 */
export function planDailyStreak(input: DailyStreakInput): DailyStreakPlan {
  const week = isoWeekKey(input.today);
  const freezeAvailable = input.freezeWeekKey !== week;
  const stored = Math.max(0, input.streak);

  if (input.lastClearDate === input.today) {
    return {
      alreadyClearedToday: true,
      streak: Math.max(1, stored),
      consumeFreeze: false,
      freezeWeekKey: input.freezeWeekKey,
      freezeAvailable
    };
  }

  const yesterday = addUtcDays(input.today, -1);
  const twoAgo = addUtcDays(input.today, -2);

  if (input.lastClearDate === yesterday) {
    return {
      alreadyClearedToday: false,
      streak: stored + 1,
      consumeFreeze: false,
      freezeWeekKey: input.freezeWeekKey,
      freezeAvailable
    };
  }

  if (input.lastClearDate === twoAgo && freezeAvailable) {
    return {
      alreadyClearedToday: false,
      streak: stored + 1,
      consumeFreeze: true,
      freezeWeekKey: week,
      freezeAvailable: true
    };
  }

  return {
    alreadyClearedToday: false,
    streak: 1,
    consumeFreeze: false,
    freezeWeekKey: input.freezeWeekKey,
    freezeAvailable
  };
}

export interface CompleteInput {
  levelId: string;
  seed: number;
  score: number;
  itemUses: number;
  durationMs: number;
}

export type CompleteOk = {
  ok: true;
  stars: 1 | 2 | 3;
  kind: Exclude<LevelKind, 'unknown'>;
  points: number;
};

export type CompleteErr = { ok: false; error: string };

export function validateSolitaireComplete(
  input: CompleteInput,
  expected: SolitaireDeal,
  nowUtcDay: string
): CompleteOk | CompleteErr {
  if (input.levelId !== expected.id) {
    return { ok: false, error: 'level_mismatch' };
  }
  if (!Number.isInteger(input.seed) || input.seed !== expected.seed) {
    return { ok: false, error: 'seed_mismatch' };
  }

  const kind = levelKind(input.levelId);
  if (kind === 'unknown') return { ok: false, error: 'invalid_level' };

  const dailyDay = parseDailyLevelId(input.levelId);
  if (kind === 'daily') {
    if (dailyDay !== nowUtcDay) return { ok: false, error: 'daily_expired' };
  }

  if (!Number.isFinite(input.durationMs) || input.durationMs < minClearMs(layoutTileCount(expected.layout))) {
    return { ok: false, error: 'too_fast' };
  }

  const pairs = layoutTileCount(expected.layout) / 2;
  const maxScore = theoreticalMaxScore(pairs);
  if (!Number.isInteger(input.score) || input.score < 0 || input.score > maxScore) {
    return { ok: false, error: 'score_invalid' };
  }

  if (!Number.isInteger(input.itemUses) || input.itemUses < 0 || input.itemUses > 500) {
    return { ok: false, error: 'item_uses_invalid' };
  }

  const stars = starsForLevel({ cleared: true, itemUses: input.itemUses });
  if (stars === 0) return { ok: false, error: 'not_cleared' };

  const points =
    kind === 'daily' ? DAILY_CLEAR_POINTS : campaignClearPoints(stars);

  return { ok: true, stars, kind, points };
}
