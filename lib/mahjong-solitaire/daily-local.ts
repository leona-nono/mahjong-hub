/**
 * Pure guest daily types + streak apply helper (engine-safe).
 * Persistence: features/guest/guest-store.
 */

import { planDailyStreak } from './progress-rules';

export interface GuestDaily {
  lastClearDate: string | null;
  streak: number;
  freezeWeekKey: string | null;
}

export function emptyGuestDaily(): GuestDaily {
  return { lastClearDate: null, streak: 0, freezeWeekKey: null };
}

/** Pure: next daily state after a clear, or null if already cleared today. */
export function nextGuestDailyClear(
  cur: GuestDaily,
  today: string
): GuestDaily | null {
  const plan = planDailyStreak({
    lastClearDate: cur.lastClearDate,
    streak: cur.streak,
    freezeWeekKey: cur.freezeWeekKey,
    today
  });
  if (plan.alreadyClearedToday) return null;
  return {
    lastClearDate: today,
    streak: plan.streak,
    freezeWeekKey: plan.freezeWeekKey
  };
}
