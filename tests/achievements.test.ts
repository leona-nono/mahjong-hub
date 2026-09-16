import { describe, expect, it } from 'vitest';
import {
  ACHIEVEMENT_IDS,
  ACHIEVEMENT_REWARDS,
  ACHIEVEMENT_TIERS,
  checkInAchievementTargets,
  rewardsMap
} from '@/lib/achievements';

describe('achievement catalog', () => {
  it('has exactly 32 stable ids', () => {
    expect(ACHIEVEMENT_IDS).toHaveLength(32);
    expect(new Set(ACHIEVEMENT_IDS).size).toBe(32);
  });

  it('assigns every id a tier and counts match B/S/G/P', () => {
    const counts = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    for (const id of ACHIEVEMENT_IDS) {
      counts[ACHIEVEMENT_TIERS[id]] += 1;
    }
    expect(counts).toEqual({ bronze: 10, silver: 12, gold: 7, platinum: 3 });
  });

  it('maps B3 reward skins', () => {
    expect(ACHIEVEMENT_REWARDS).toEqual({
      'clean-hand': 'deep-sea-blue',
      'all-sequences': 'sakura-pink',
      'half-flush': 'bamboo-green',
      'big-dragons': 'gold-dynasty',
      'daily-thirty': 'ink-wash'
    });
    expect(rewardsMap()['daily-thirty']).toBe('ink-wash');
  });
});

describe('check-in achievement thresholds', () => {
  it('unlocks nothing below day 7', () => {
    expect(checkInAchievementTargets(0)).toEqual([]);
    expect(checkInAchievementTargets(6)).toEqual([]);
  });

  it('unlocks daily-seven at day 7', () => {
    expect(checkInAchievementTargets(7)).toEqual(['daily-seven']);
    expect(checkInAchievementTargets(29)).toEqual(['daily-seven']);
  });

  it('unlocks both at day 30', () => {
    expect(checkInAchievementTargets(30)).toEqual(['daily-seven', 'daily-thirty']);
    expect(checkInAchievementTargets(100)).toEqual(['daily-seven', 'daily-thirty']);
  });
});
