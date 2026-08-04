import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { getGame } from '@/data/games';
import { prisma } from '@/lib/db';
import { isDbConnected } from '@/lib/db-health';
import type { Game } from '@/lib/generated/prisma';
import GameEditorForm from '@/components/admin/GameEditorForm';

export const dynamic = 'force-dynamic';

async function getEditorData(slug: string) {
  const staticGame = getGame(slug);
  if (!staticGame) notFound();

  // Use a real connectivity probe so the warning banner is accurate even
  // when the DB is reachable but this particular game is still static-only.
  const dbConnected = await isDbConnected();
  let dbGame: Game | null = null;
  if (dbConnected) {
    try {
      dbGame = await prisma.game.findUnique({ where: { slug } });
    } catch {
      // Connectivity dropped between probe and query.
    }
  }

  // Prefer DB row when available; fall back to static
  const initial = dbGame
    ? {
        slug: dbGame.slug,
        title: dbGame.title,
        description: dbGame.description ?? '',
        iframeUrl: dbGame.iframeUrl ?? '',
        thumbnail: dbGame.thumbnail ?? '',
        downloadUrl: dbGame.downloadUrl ?? '',
        category: dbGame.category ?? 'mahjong',
        tags: dbGame.tags ?? [],
        isFeatured: dbGame.isFeatured,
        isActive: dbGame.isActive,
        sortOrder: dbGame.sortOrder
      }
    : {
        slug: staticGame.slug,
        title: staticGame.title,
        description: staticGame.description,
        iframeUrl: staticGame.gameIframeUrl ?? '',
        thumbnail: '',
        downloadUrl: '',
        category: staticGame.category,
        tags: [],
        isFeatured: !!staticGame.featured,
        isActive: true,
        sortOrder: 0
      };

  return {
    initial,
    dbConnected,
    dbId: dbGame?.id ?? null
  };
}

export default async function GameEditorPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { initial, dbConnected, dbId } = await getEditorData(slug);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/games"
          className="mb-2 inline-block text-sm text-blue-600 hover:text-blue-800"
        >
          ← 返回游戏列表
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">
          编辑游戏: {initial.title}
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
          ⚠️ 数据库未连接。下方修改无法保存（按钮会显示错误）。配置 DATABASE_URL 后可生效。
        </div>
      )}

      {/* Editor form (client) */}
      <GameEditorForm slug={slug} initial={initial} />

      {/* Multi-language content shortcuts */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-gray-800">多语言内容</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href={`/admin/games/${slug}/faqs`}
            className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <h3 className="font-bold text-gray-800">❓ FAQ 问答</h3>
            <p className="mt-1 text-sm text-gray-500">
              按语言编辑 FAQ（生成 FAQPage JSON-LD，提升 SEO/GEO 排名）
            </p>
          </Link>
          <Link
            href={`/admin/games/${slug}/features`}
            className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <h3 className="font-bold text-gray-800">📝 Features 详情</h3>
            <p className="mt-1 text-sm text-gray-500">
              按语言编辑游戏详情（Markdown 富文本，含直接问答段 + GEO 增强）
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
