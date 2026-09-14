/**
 * Solitaire campaign/daily scoring + streak (isomorphic, no Prisma).
 * Design: mahjong-solitaire-design.md A1/A2/A4, difficulty v0.3 §6.
 */

export { isoWeekKey, planDailyStreak } from '@/lib/daily/streak';
export type { DailyStreakInput, DailyStreakPlan } from '@/lib/daily/streak';
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
