/** Server-authoritative check-in cycle. Client must not invent these amounts. */
// Points currency removed — check-in only continues the streak (see progression redesign).
export const CHECKIN_CYCLE_DAYS = 7;

export function utcDateString(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function addUtcDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return utcDateString(d);
}

/** Which day of the 7-day cycle a streak lands on. 1-based. */
export function checkinDayForStreak(streak: number): number {
  return ((Math.max(1, streak) - 1) % CHECKIN_CYCLE_DAYS) + 1;
}

/** Noon UTC for a YYYY-MM-DD so the calendar day survives Date round-trips. */
export function utcNoon(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00.000Z`);
}

export function checkinPlan(
  lastClaimDate: string | null,
  storedStreak: number,
  today = utcDateString()
): {
  claimedToday: boolean;
  streak: number;
  cycleDay: number;
} {
  const safeStored = Math.max(1, storedStreak);
  if (lastClaimDate === today) {
    return {
      claimedToday: true,
      streak: safeStored,
      cycleDay: checkinDayForStreak(safeStored)
    };
  }
  const streak = lastClaimDate === addUtcDays(today, -1) ? safeStored + 1 : 1;
  return { claimedToday: false, streak, cycleDay: checkinDayForStreak(streak) };
}
