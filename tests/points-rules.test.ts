import { describe, expect, it } from 'vitest';
import {
  CHECKIN_REWARDS,
  FIRST_LOGIN_BONUS,
  addUtcDays,
  checkinPlan,
  checkinRewardForStreak,
  utcDateString
} from '@/lib/points-rules';

describe('points-rules', () => {
  it('cycles check-in rewards', () => {
    expect(checkinRewardForStreak(1)).toBe(50);
    expect(checkinRewardForStreak(7)).toBe(300);
    expect(checkinRewardForStreak(8)).toBe(50);
    expect(CHECKIN_REWARDS).toHaveLength(7);
  });

  it('plans first claim and consecutive days', () => {
    expect(checkinPlan(null, 1, '2026-08-14')).toMatchObject({
      claimedToday: false,
      streak: 1,
      todayReward: 50
    });
    expect(checkinPlan('2026-08-14', 1, '2026-08-14')).toMatchObject({
      claimedToday: true,
      streak: 1,
      todayReward: 50
    });
    expect(checkinPlan('2026-08-14', 1, '2026-08-15')).toMatchObject({
      claimedToday: false,
      streak: 2,
      todayReward: 80
    });
    expect(checkinPlan('2026-08-13', 3, '2026-08-15')).toMatchObject({
      claimedToday: false,
      streak: 1,
      todayReward: 50
    });
  });

  it('adds utc days across month bounds', () => {
    expect(addUtcDays('2026-08-31', 1)).toBe('2026-09-01');
    expect(utcDateString(new Date('2026-08-14T22:00:00.000Z'))).toBe('2026-08-14');
  });

  it('defines a first-login bonus recorded as first_login', () => {
    expect(FIRST_LOGIN_BONUS).toBe(500);
  });
});
