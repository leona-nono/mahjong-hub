import { describe, expect, it } from 'vitest';

import {
  campaignClearPoints,
  dailyLevelId,
  isoWeekKey,
  minClearMs,
  parseDailyLevelId,
  planDailyStreak,
  streakCycleBonus,
  validateSolitaireComplete,
  DAILY_CLEAR_POINTS
} from '@/lib/mahjong-solitaire/progress-rules';
import { dailyChallengeSpec } from '@/lib/mahjong-solitaire/difficulty';
import { getLevel, nextLevelId } from '@/lib/mahjong-solitaire/levels';
import { resolveDeal } from '@/lib/solitaire-catalog';
import catalogJson from '@/lib/mahjong-solitaire/seed-catalog.json';

describe('daily streak + freeze grace', () => {
  it('increments on consecutive UTC days', () => {
    expect(
      planDailyStreak({
        lastClearDate: '2026-08-13',
        streak: 4,
        freezeWeekKey: null,
        today: '2026-08-14'
      })
    ).toMatchObject({ alreadyClearedToday: false, streak: 5, consumeFreeze: false });
  });

  it('fills one missed day per ISO week with freeze', () => {
    const plan = planDailyStreak({
      lastClearDate: '2026-08-12',
      streak: 4,
      freezeWeekKey: null,
      today: '2026-08-14'
    });
    expect(plan.consumeFreeze).toBe(true);
    expect(plan.streak).toBe(5);
    expect(plan.freezeWeekKey).toBe(isoWeekKey('2026-08-14'));
  });

  it('resets when freeze already used this week', () => {
    const week = isoWeekKey('2026-08-14');
    const plan = planDailyStreak({
      lastClearDate: '2026-08-12',
      streak: 4,
      freezeWeekKey: week,
      today: '2026-08-14'
    });
    expect(plan.streak).toBe(1);
    expect(plan.consumeFreeze).toBe(false);
  });

  it('does not double-count a second clear the same day', () => {
    expect(
      planDailyStreak({
        lastClearDate: '2026-08-14',
        streak: 5,
        freezeWeekKey: null,
        today: '2026-08-14'
      }).alreadyClearedToday
    ).toBe(true);
  });

  it('pays week-cycle bonus on 7/14/21', () => {
    expect(streakCycleBonus(6)).toBe(0);
    expect(streakCycleBonus(7)).toBe(500);
    expect(streakCycleBonus(14)).toBe(500);
  });
});

describe('complete validation', () => {
  const expected = {
    id: 'lv-1',
    seed: 42,
    layout: 'classic' as const,
    alphabet: 12
  };

  it('rejects seed mismatch and instant clears', () => {
    expect(
      validateSolitaireComplete(
        { levelId: 'lv-1', seed: 1, score: 10, itemUses: 0, durationMs: 20_000 },
        expected,
        '2026-08-14'
      )
    ).toMatchObject({ ok: false, error: 'seed_mismatch' });

    expect(
      validateSolitaireComplete(
        { levelId: 'lv-1', seed: 42, score: 10, itemUses: 0, durationMs: 100 },
        expected,
        '2026-08-14'
      )
    ).toMatchObject({ ok: false, error: 'too_fast' });
  });

  it('accepts a human-paced classic clear and scores by stars', () => {
    const ok = validateSolitaireComplete(
      {
        levelId: 'lv-1',
        seed: 42,
        score: 100,
        itemUses: 0,
        durationMs: minClearMs(144)
      },
      expected,
      '2026-08-14'
    );
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.stars).toBe(3);
      expect(ok.points).toBe(campaignClearPoints(3));
    }
  });

  it('rejects yesterday’s daily id', () => {
    const daily = {
      id: dailyLevelId('2026-08-13'),
      seed: 9,
      layout: 'classic' as const,
      alphabet: 30
    };
    expect(
      validateSolitaireComplete(
        {
          levelId: daily.id,
          seed: 9,
          score: 10,
          itemUses: 1,
          durationMs: 20_000
        },
        daily,
        '2026-08-14'
      )
    ).toMatchObject({ ok: false, error: 'daily_expired' });
  });

  it('daily clear awards the daily purse', () => {
    const id = dailyLevelId('2026-08-14');
    const ok = validateSolitaireComplete(
      { levelId: id, seed: 9, score: 10, itemUses: 3, durationMs: 20_000 },
      { id, seed: 9, layout: 'classic', alphabet: 30 },
      '2026-08-14'
    );
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.points).toBe(DAILY_CLEAR_POINTS);
  });
});

describe('server catalog + daily deal', () => {
  it('serves frozen catalog seed for lv-1', () => {
    const deal = resolveDeal('lv-1', '2026-08-14');
    expect(deal).not.toBeNull();
    const row = catalogJson.entries.find((e) => e.level === 1);
    expect(deal?.seed).toBe(row?.seed);
    expect(deal?.alphabet).toBe(12);
    expect(deal?.layout).toBe('classic');
  });

  it('keeps teaching on fixed seeds outside the catalog', () => {
    const d = resolveDeal('teach-1', '2026-08-14');
    expect(d?.seed).toBe(1001);
    expect(d?.layout).toBe('flat36');
  });

  it('hashes the same UTC day to the same daily spec', () => {
    expect(dailyChallengeSpec('2026-08-14')).toEqual(dailyChallengeSpec('2026-08-14'));
    expect(dailyChallengeSpec('2026-08-14').seed).not.toBe(
      dailyChallengeSpec('2026-08-15').seed
    );
    expect(parseDailyLevelId('daily:2026-08-14')).toBe('2026-08-14');
    expect(getLevel('daily:2026-08-14')?.deal.alphabet).toBe(30);
    expect(nextLevelId('daily:2026-08-14')).toBeNull();
  });

  it('does not invent tomorrow’s daily deal', () => {
    expect(resolveDeal('daily:2099-01-01', '2026-08-14')).toBeNull();
  });
});
