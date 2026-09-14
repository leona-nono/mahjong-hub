/** Deterministic 31-bit seed from a UTC date key. Never uses Date.now(). */
export function dailySeed(dateKey: string): number {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash ^= dateKey.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash % 2147483647;
}

export const DAILY_MODE = 'seeded-game' as const;
export type DailyMode = 'seeded-game' | 'puzzle';
