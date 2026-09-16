import { describe, expect, it } from 'vitest';
import {
  CHECKIN_CYCLE_DAYS,
  addUtcDays,
  checkinDayForStreak,
  checkinPlan,
  utcDateString
} from '@/lib/points-rules';

describe('points-rules', () => {
  it('maps streak onto a 7-day cycle', () => {
    expect(CHECKIN_CYCLE_DAYS).toBe(7);
    expect(checkinDayForStreak(1)).toBe(1);
    expect(checkinDayForStreak(7)).toBe(7);
    expect(checkinDayForStreak(8)).toBe(1);
  });

  it('plans first claim and consecutive days', () => {
    expect(checkinPlan(null, 1, '2026-08-14')).toMatchObject({
      claimedToday: false,
      streak: 1,
      cycleDay: 1
    });
    expect(checkinPlan('2026-08-14', 1, '2026-08-14')).toMatchObject({
      claimedToday: true,
      streak: 1,
      cycleDay: 1
    });
    expect(checkinPlan('2026-08-14', 1, '2026-08-15')).toMatchObject({
      claimedToday: false,
      streak: 2,
      cycleDay: 2
    });
    expect(checkinPlan('2026-08-13', 3, '2026-08-15')).toMatchObject({
      claimedToday: false,
      streak: 1,
      cycleDay: 1
    });
  });

  it('adds utc days across month bounds', () => {
    expect(addUtcDays('2026-08-31', 1)).toBe('2026-09-01');
    expect(utcDateString(new Date('2026-08-14T22:00:00.000Z'))).toBe('2026-08-14');
  });
});
