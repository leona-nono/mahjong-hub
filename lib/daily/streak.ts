import { addUtcDays } from '@/lib/points-rules';

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
 * Consecutive UTC days. One missed day per ISO week is filled by freeze grace.
 * Freeze does not increment for the skipped day; the clear still +1 vs last real clear.
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
