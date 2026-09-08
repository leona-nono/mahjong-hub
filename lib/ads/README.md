# Cocos Connect 激励广告接入（网站侧）

## 现状

- Cocos 通过 `emit('request_reward')` 请求道具广告。
- `CocosConnectPlayer` 调用 `lib/ads/rewarded.ts` 的 `playRewardedAd`。
- `NEXT_PUBLIC_ADS_ENABLED` 未开：mock 完播 → 直接 `grantReward`（本地通路测试）。
- 已开启：实现 `showNetworkRewarded`，完播拿 token → `POST /api/reward/verify` → 再 `grantReward`。

## Connect placements

`hint` | `shuffle` | `extra_time`
