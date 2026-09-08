/**
 * Rewarded-video facade for the Cocos Connect player.
 * Mock path for local pathway testing; real networks plug in behind the same API.
 *
 * Wiring when a network is ready:
 * 1. Set NEXT_PUBLIC_ADS_ENABLED=true
 * 2. Implement showNetworkRewarded() below (AdMob / mediation web SDK)
 * 3. Server mints grant via issueGrant() after S2S callback
 * 4. Client POSTs token to /api/reward/verify, then MahjongHub.grantReward({ ok: true, ... })
 */

import { adsEnabled } from '@/lib/flags';

export type RewardedPlacement = 'hint' | 'shuffle' | 'extra_time' | string;

export type RewardedAdResult =
  | { ok: true; provider: 'mock' | 'network'; token?: string }
  | { ok: false; reason: string };

const MOCK_MS = 700;

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Replace with real web rewarded SDK when contracted. */
async function showNetworkRewarded(
  _placement: RewardedPlacement
): Promise<RewardedAdResult> {
  return { ok: false, reason: 'ads_sdk_not_wired' };
}

/**
 * Play a rewarded ad for a placement.
 * - When ads are off (default): mock success after a short delay (pathway test).
 * - When ads are on: delegates to showNetworkRewarded(); verify via /api/reward/verify.
 */
export async function playRewardedAd(
  placement: RewardedPlacement
): Promise<RewardedAdResult> {
  if (!adsEnabled()) {
    await delay(MOCK_MS);
    return { ok: true, provider: 'mock' };
  }

  return showNetworkRewarded(placement);
}

/** Global cooldown between any two rewarded offers (client hint; server re-checks). */
let lastRewardAt = 0;
const COOLDOWN_MS = 60_000;

export function rewardedCooldownRemaining(now = Date.now()): number {
  return Math.max(0, COOLDOWN_MS - (now - lastRewardAt));
}

export function markRewardedShown(now = Date.now()) {
  lastRewardAt = now;
}

/**
 * After a network ad: verify S2S token then return whether the parent may grant.
 */
export async function verifyRewardedToken(token: string): Promise<{
  ok: boolean;
  itemType?: string;
  error?: string;
}> {
  const res = await fetch('/api/reward/verify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token })
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: body.error || `http_${res.status}` };
  }
  const body = (await res.json()) as { ok?: boolean; itemType?: string };
  return { ok: body.ok === true, itemType: body.itemType };
}
