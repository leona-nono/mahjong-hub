import { dailySeed } from '@/lib/daily/seed';
import { utcDateString } from '@/lib/points-rules';

/** Encode a numeric seed for `?c=` (short, URL-safe). */
export function encodeChallengeSeed(seed: number): string {
  return (seed >>> 0).toString(36);
}

/** Parse `?c=` back to a seed, or null if missing/invalid. */
export function parseChallengeSeed(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();
  if (!/^[0-9a-z]{1,10}$/.test(trimmed)) return null;
  const n = Number.parseInt(trimmed, 36);
  if (!Number.isFinite(n) || n < 0) return null;
  return n >>> 0;
}

/** UTC daily seed used when visiting `/challenge` without `?c=`. */
export function todayChallengeSeed(date = new Date()): number {
  return dailySeed(utcDateString(date));
}

export function isSharedChallenge(raw: string | null | undefined): boolean {
  return parseChallengeSeed(raw) !== null;
}
