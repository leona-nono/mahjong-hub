/**
 * Guest daily-challenge streak (localStorage). Logged-in users use the server.
 */

import { utcDateString } from '../points-rules';
import { planDailyStreak } from './progress-rules';

const KEY = 'mh.solitaire.daily.v1';

export interface GuestDaily {
  lastClearDate: string | null;
  streak: number;
  freezeWeekKey: string | null;
}

function empty(): GuestDaily {
  return { lastClearDate: null, streak: 0, freezeWeekKey: null };
}

export function readGuestDaily(): GuestDaily {
  if (typeof window === 'undefined') return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const p = JSON.parse(raw) as GuestDaily;
    return {
      lastClearDate: typeof p.lastClearDate === 'string' ? p.lastClearDate : null,
      streak: Number(p.streak) || 0,
      freezeWeekKey: typeof p.freezeWeekKey === 'string' ? p.freezeWeekKey : null
    };
  } catch {
    return empty();
  }
}

export function recordGuestDailyClear(today = utcDateString()): GuestDaily {
  const cur = readGuestDaily();
  const plan = planDailyStreak({
    lastClearDate: cur.lastClearDate,
    streak: cur.streak,
    freezeWeekKey: cur.freezeWeekKey,
    today
  });
  if (plan.alreadyClearedToday) return cur;
  const next: GuestDaily = {
    lastClearDate: today,
    streak: plan.streak,
    freezeWeekKey: plan.freezeWeekKey
  };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
