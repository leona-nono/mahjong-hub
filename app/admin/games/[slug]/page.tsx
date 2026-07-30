import { notFound } from 'next/navigation';
import { getGame, type GameCategory } from '@/data/games';
import { prisma } from '@/lib/db';

const CATEGORY_OPTIONS: { value: GameCategory | string; label: string }[] = [
  { value: 'mahjong', label: '🀄️ 麻将 (mahjong)' },
  { value: 'connect', label: '🔗 连连看 (connect)' },
  { value: 'solitaire', label: '♠️ 单人 (solitaire)' },
  { value: 'tile-match', label: '🧩 配对 (tile-match)' }
];

async function getEditorData(slug: string) {
  const staticGame = getGame(slug);
  if (!staticGame) notFound();

  let dbRecord: { id: string; title: string } | null = null;
  try {
    dbRecord = await prisma.game.findUnique({
      where: { slug },
      select: { id: true, title: true }
    });
  } catch {
    // DB not available
  }

  return {
    game: staticGame,
    dbId: dbRecord?.id ?? null,
    dbConnected: !!dbRecord
  };
}

export default async function GameEditorPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { game, dbId, dbConnected } = await getEditorData(slug);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <a
          href="/admin/games"
          className="mb-2 inline-block text-sm text-blue-600 hover:text-blue-800"
        >
          ← 返回游戏列表
        </a>
        <h1 className="text-2xl font-bold text-gray-800">
          编辑游戏: {game.title}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Slug: <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">{slug}</code>
          {dbId && (
            <>
              {' · '}DB ID: <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">{dbId}</code>
            </>
          )}
        </p>
      </div>

      {/* DB warning */}
      {!dbConnected && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          ⚠️ 数据库未连接，当前显示只读预览。配置 DATABASE_URL 后方可保存修改。
        </div>
      )}

      {/* Editor form */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Slug (read-only) */}
          <Field label="Slug" readonly value={game.slug} />

          {/* Title */}
          <Field label="标题 (Title)" readonly={!dbConnected} value={game.title} />

          {/* Category */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
              分类 (Category)
            </label>
            <select
              disabled={!dbConnected}
              defaultValue={game.category}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Featured */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
              推荐 (Featured)
            </label>
            <select
              disabled={!dbConnected}
              defaultValue={game.featured ? 'true' : 'false'}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="true">✅ 是</option>
              <option value="false">— 否</option>
            </select>
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
              描述 (Description)
            </label>
            <textarea
              readOnly={!dbConnected}
              defaultValue={game.description}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm read-only:bg-gray-100 read-only:text-gray-400"
            />
          </div>

          {/* iframe URL */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
              iframe 嵌入 URL
            </label>
            <input
              type="url"
              readOnly={!dbConnected}
              defaultValue={game.gameIframeUrl}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono read-only:bg-gray-100 read-only:text-gray-400"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex gap-3 border-t pt-6">
          <button
            disabled={!dbConnected}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
          >
            保存修改
          </button>
          <a
            href={`/games/${slug}`}
            target="_blank"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
          >
            预览游戏页 ↗
          </a>
        </div>
      </div>

      {/* Placeholder for FAQ/Features sections (wired in later) */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-gray-800">多语言内容</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href={`/admin/games/${slug}/faqs`}
            className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <h3 className="font-bold text-gray-800">❓ FAQ 问答</h3>
            <p className="mt-1 text-sm text-gray-500">
              按语言编辑 FAQ（生成 FAQPage JSON-LD，提升 SEO/GEO 排名）
            </p>
          </a>
          <a
            href={`/admin/games/${slug}/features`}
            className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <h3 className="font-bold text-gray-800">📝 Features 详情</h3>
            <p className="mt-1 text-sm text-gray-500">
              按语言编辑游戏详情（MDX 富文本，含直接问答段 + GEO 增强）
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  readonly
}: {
  label: string;
  value: string;
  readonly: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
        {label}
      </label>
      <input
        type="text"
        readOnly={readonly}
        defaultValue={value}
        className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm read-only:bg-gray-100 read-only:text-gray-400 ${readonly ? '' : ''}`}
      />
    </div>
  );
}
