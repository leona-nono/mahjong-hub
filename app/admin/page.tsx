import { getGames } from '@/data/games';
import { prisma } from '@/lib/db';

/**
 * Admin dashboard — shows site KPIs.
 * Falls back to static data when DB is not available.
 */
async function getStats() {
  const games = getGames();
  const categories = new Set(games.map((g) => g.category));

  let dbUserCount = 0;
  let dbGameCount = 0;
  try {
    // Quick connectivity check — will throw if DATABASE_URL is not set
    dbUserCount = await prisma.user.count();
    dbGameCount = await prisma.game.count();
  } catch {
    // DB not available yet; stats stay at 0
  }

  return {
    totalGames: games.length,
    categories: categories.size,
    featured: games.filter((g) => g.featured).length,
    dbUserCount,
    dbGameCount
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">运营概览</h1>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard title="静态游戏" value={stats.totalGames} color="blue" />
        <KpiCard title="分类数" value={stats.categories} color="green" />
        <KpiCard title="推荐游戏" value={stats.featured} color="purple" />
        <KpiCard
          title="数据库用户"
          value={stats.dbUserCount}
          color={stats.dbUserCount > 0 ? 'amber' : 'gray'}
          note={stats.dbUserCount === 0 ? '待连接' : undefined}
        />
      </div>

      {/* DB status */}
      <div
        className={`rounded-lg border p-4 ${
          stats.dbGameCount > 0
            ? 'border-green-200 bg-green-50 text-green-800'
            : 'border-amber-200 bg-amber-50 text-amber-800'
        }`}
      >
        <p className="text-sm font-medium">
          {stats.dbGameCount > 0
            ? `✅ 数据库已连接 — ${stats.dbGameCount} 个游戏记录可编辑`
            : '⚠️ 数据库尚未连接 — 当前数据来自静态源，编辑功能需配置 DATABASE_URL'}
        </p>
        <p className="mt-1 text-xs opacity-75">
          {stats.dbGameCount === 0
            ? '请在 Neon 创建数据库并在 Vercel / .env.local 填入 DATABASE_URL'
            : '游戏/FAQ/Features 数据现可通过后台直接编辑'}
        </p>
      </div>

      {/* Quick links */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <QuickLink
          href="/admin/games"
          title="🎮 游戏管理"
          desc="查看、新增、编辑游戏，管理 iframe 链接与分类"
        />
        <QuickLink
          href="/admin/settings"
          title="⚙️ 站点设置"
          desc="SEO 元数据、社交链接、分析追踪等全局配置"
        />
      </div>
    </div>
  );
}

/* ── helper components ── */

function KpiCard({
  title,
  value,
  color,
  note
}: {
  title: string;
  value: string | number;
  color: string;
  note?: string;
}) {
  const colors: Record<string, string> = {
    blue: 'border-blue-200 bg-blue-50 text-blue-800',
    green: 'border-green-200 bg-green-50 text-green-800',
    purple: 'border-purple-200 bg-purple-50 text-purple-800',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    gray: 'border-gray-200 bg-gray-50 text-gray-600'
  };
  return (
    <div className={`rounded-lg border p-4 ${colors[color] || colors.gray}`}>
      <p className="text-xs font-medium opacity-75">{title}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
      {note && <p className="mt-0.5 text-xs opacity-60">{note}</p>}
    </div>
  );
}

function QuickLink({
  href,
  title,
  desc
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
    </a>
  );
}
