import { getGames, type GameCategory } from '@/data/games';
import { prisma } from '@/lib/db';
import { isDbConnected } from '@/lib/db-health';

/**
 * Game list — shows all games in a table with search/filter.
 * Can switch between DB and static data view.
 */

const CATEGORY_LABELS: Record<GameCategory, string> = {
  mahjong: '🀄️ 麻将',
  connect: '🔗 连连看',
  solitaire: '♠️ 单人',
  'tile-match': '🧩 配对'
};

export const dynamic = 'force-dynamic';

async function getGameList() {
  const staticGames = getGames();

  // Probe connectivity first; only attempt the query when DB is reachable so
  // we never confuse "empty result" with "DB down" in the UI.
  const dbConnected = await isDbConnected();
  let dbGames: { slug: string; title: string }[] = [];
  if (dbConnected) {
    try {
      dbGames = await prisma.game.findMany({
        select: { slug: true, title: true },
        orderBy: { sortOrder: 'asc' }
      });
    } catch {
      // Connectivity dropped between probe and query — fall back to static.
    }
  }

  return { staticGames, dbGames, dbConnected };
}

export default async function AdminGamesPage() {
  const { staticGames, dbConnected } = await getGameList();

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">游戏管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            共 {staticGames.length} 个游戏
            {dbConnected ? '（数据库已连接，可编辑）' : '（静态源，DB 连接后可编辑）'}
          </p>
        </div>
        <a
          href="/admin/games/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
        >
          ＋ 新建游戏
        </a>
      </div>

      {/* Status banner */}
      {!dbConnected && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          ⚠️ 数据库未连接。下方列表数据来自静态源，仅供预览。
          <br />
          配置 DATABASE_URL 后可在此直接编辑游戏信息。
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">游戏名</th>
              <th className="px-4 py-3">分类</th>
              <th className="px-4 py-3">推荐</th>
              <th className="px-4 py-3">URL Slug</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staticGames.map((g) => (
              <tr key={g.slug} className="transition hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">
                  {g.title}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    {CATEGORY_LABELS[g.category] || g.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {g.featured ? (
                    <span className="text-green-600">✅</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                  {g.slug}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={`/admin/games/${g.slug}`}
                    className="text-blue-600 transition hover:text-blue-800"
                  >
                    编辑 →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
