import { describe, expect, it } from 'vitest';
import {
  CHECKIN_REWARDS,
  addUtcDays,
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

  it('adds utc days across month bounds', () => {
    expect(addUtcDays('2026-08-31', 1)).toBe('2026-09-01');
    expect(utcDateString(new Date('2026-08-14T22:00:00.000Z'))).toBe('2026-08-14');
  });
});
