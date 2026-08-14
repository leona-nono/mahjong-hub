/** Server-authoritative check-in cycle. Client must not invent these amounts. */
export const CHECKIN_REWARDS = [50, 80, 120, 100, 150, 200, 300] as const;

export const FIRST_LOGIN_BONUS = 500;
export const START_GAME_POINTS = 10;
export const GAME_WIN_MAX = 50;

export function utcDateString(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function addUtcDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return utcDateString(d);
}

export function checkinRewardForStreak(streak: number): number {
  const cycle = ((Math.max(1, streak) - 1) % CHECKIN_REWARDS.length);
  return CHECKIN_REWARDS[cycle];
}

export function nextCheckinReward(streak: number): number {
  return checkinRewardForStreak(streak + 1);
}
