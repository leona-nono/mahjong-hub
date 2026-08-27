import { Link } from '@/i18n/navigation';
import { getNativeGames } from '@/data/games';
import { getNativeLocaleCoverage } from '@/lib/native-seo';
import {
  NATIVE_SEO_LOCALES,
  NATIVE_SEO_LOCALE_LABELS
} from '@/lib/native-seo-locales';
import { isDbConnected } from '@/lib/db-health';

export const dynamic = 'force-dynamic';

const STYLE: Record<'ok' | 'partial' | 'missing', string> = {
  ok: 'bg-green-50 text-green-700',
  partial: 'bg-amber-50 text-amber-700',
  missing: 'bg-red-50 text-red-700'
};

export default async function AdminNativeSeoListPage() {
  const natives = getNativeGames();
  const dbConnected = await isDbConnected();

  const rows = await Promise.all(
    natives.map(async (game) => ({
      slug: game.slug,
      title: game.title,
      coverage: await getNativeLocaleCoverage(
        game.slug,
        Boolean(game.content?.intro)
      )
    }))
  );

  const gapCount = rows.filter((r) =>
    NATIVE_SEO_LOCALES.some((l) => r.coverage[l] === 'missing')
  ).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">自研游戏 SEO</h1>
        <p className="mt-1 text-sm text-gray-500">
          管理自研（native）游戏页标题、简介、玩法、技巧、FAQ 与 SEO 元数据。
          共 {natives.length} 款
          {gapCount > 0 ? ` · ${gapCount} 款存在多语缺失` : ' · 多语内容齐全'}
          {dbConnected ? '' : '（数据库未连接时仅可预览静态底稿）'}
        </p>
      </div>

      {!dbConnected && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          ⚠️ 数据库未连接。可查看静态底稿与覆盖度，保存需配置 DATABASE_URL 并执行
          NativeGameSeo 迁移。
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">游戏</th>
              <th className="px-4 py-3">多语覆盖</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.slug} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">
                  {row.title}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {NATIVE_SEO_LOCALES.map((locale) => (
                      <span
                        key={locale}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STYLE[row.coverage[locale]]}`}
                        title={NATIVE_SEO_LOCALE_LABELS[locale]}
                      >
                        {locale}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                  {row.slug}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/native-seo/${row.slug}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    编辑 SEO →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
