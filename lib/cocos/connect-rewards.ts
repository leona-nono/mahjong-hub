/**
 * Connect rewarded placements ↔ ledger itemType strings.
 * Used by /api/reward/verify when a real ad network mints a signed grant.
 */

export const CONNECT_REWARD_ITEMS = ['hint', 'shuffle', 'extra_time'] as const;

export type ConnectRewardItem = (typeof CONNECT_REWARD_ITEMS)[number];

export function isConnectRewardItem(value: string): value is ConnectRewardItem {
  return (CONNECT_REWARD_ITEMS as readonly string[]).includes(value);
}
