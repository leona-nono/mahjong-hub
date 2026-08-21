import { APPEARANCES, type AppearanceId } from '@/lib/appearance';

const STATUS_LABELS = {
  permanent: '常驻',
  festival: '节日限定',
  spring: '春季',
  summer: '夏季',
  autumn: '秋季',
  winter: '冬季'
} as const;

const CHAPTER_LABELS = {
  foundation: '基础馆藏',
  solar: '四季章节',
  festival: '节日章节'
} as const;

export default function AdminAppearancePage() {
  const entries = Object.entries(APPEARANCES) as [AppearanceId, (typeof APPEARANCES)[AppearanceId]][];
  return <div>
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800">外观与赛季素材</h1>
      <p className="mt-1 text-sm text-gray-500">当前上线的免费桌布、牌背与赛季窗口。目录来源：<code>lib/appearance.ts</code>。</p>
    </div>
    <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
      所有外观均为免费活动赠送或常驻内容；不配置付费货币、抽取或赌博机制。
    </div>
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500"><tr><th className="px-4 py-3">章节</th><th className="px-4 py-3">主题</th><th className="px-4 py-3">桌布</th><th className="px-4 py-3">牌背</th><th className="px-4 py-3">赛季窗口</th><th className="px-4 py-3">状态</th></tr></thead>
        <tbody className="divide-y divide-gray-100">{entries.map(([id, item]) => <tr key={id}>
          <td className="px-4 py-3 text-gray-600">{CHAPTER_LABELS[item.chapter]}</td>
          <td className="px-4 py-3 font-medium text-gray-800">{id}</td>
          <td className="max-w-56 truncate px-4 py-3 text-gray-600" title={item.table}>{item.table}</td>
          <td className="max-w-56 truncate px-4 py-3 text-gray-600" title={item.back}>{item.back}</td>
          <td className="px-4 py-3 text-gray-600">{item.availableFrom ? `${item.availableFrom} ~ ${item.availableUntil}` : '长期'}</td>
          <td className="px-4 py-3"><span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{STATUS_LABELS[item.season]}</span></td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>;
}
