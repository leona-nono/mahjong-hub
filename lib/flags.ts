/**
 * Light feature flags (P0-E4). Hard-coded / env, no third-party flag service.
 */

export function adsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ADS_ENABLED === 'true';
}

/** P0-M1: first calendar day after first visit stays ad-quiet. */
export function adsQuietForFirstVisit(firstSeenAt: number, now = Date.now()): boolean {
  if (!Number.isFinite(firstSeenAt) || firstSeenAt <= 0) return true;
  return now - firstSeenAt < 24 * 60 * 60 * 1000;
}

export const FIRST_SEEN_KEY = 'mh.first-seen.v1';
