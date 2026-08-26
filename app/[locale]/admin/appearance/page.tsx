import { APPEARANCES, appearanceOf, appearanceWindowState, type AppearanceId } from '@/lib/appearance';

const TIER_LABELS = {
  foundation: 'Foundation',
  seasonal: 'Seasonal',
  premium: 'Premium',
  limited: 'Limited'
} as const;

const UNLOCK_LABELS = {
  free: 'Free',
  seasonal_checkin: 'Check-in',
  points: 'Points',
  fragments: 'Fragments'
} as const;

export default function AdminAppearancePage() {
  const entries = Object.entries(APPEARANCES) as [AppearanceId, (typeof APPEARANCES)[AppearanceId]][];
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">外观与赛季素材</h1>
        <p className="mt-1 text-sm text-gray-500">
          目录来源：<code>lib/appearance.ts</code> — Foundation / Seasonal / Premium / Limited。
        </p>
      </div>
      <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        Foundation 免费；Seasonal 签到解锁；Premium 积分兑换；Limited 周签到碎片合成。Premium
        详情页含实体套装外链（Amazon/Shopify）。
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">层级</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">解锁</th>
              <th className="px-4 py-3">价格/碎片</th>
              <th className="px-4 py-3">窗口</th>
              <th className="px-4 py-3">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map(([id]) => {
              const item = appearanceOf(id);
              return (
              <tr key={id}>
                <td className="px-4 py-3 text-gray-600">{TIER_LABELS[item.tier]}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{id}</td>
                <td className="px-4 py-3 text-gray-600">{UNLOCK_LABELS[item.unlock]}</td>
                <td className="px-4 py-3 text-gray-600">
                  {item.price
                    ? `${item.price} pts`
                    : item.fragmentsRequired
                      ? `${item.fragmentsRequired} fragments`
                      : '—'}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {item.availableFrom
                    ? `${item.availableFrom} ~ ${item.availableUntil}`
                    : '长期'}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                    {appearanceWindowState(id)}
                  </span>
                </td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
    </div>
  );
}
