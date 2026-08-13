import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { getGame } from '@/data/games';
import { prisma } from '@/lib/db';
import FeaturesEditor, { type FeatureEntry } from '@/components/admin/FeaturesEditor';

export const dynamic = 'force-dynamic';

export default async function GameFeaturesPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const staticGame = getGame(slug);

  let title = staticGame?.title ?? slug;
  let dbGameId: string | null = null;
  try {
    const dbGame = await prisma.game.findUnique({
      where: { slug },
      select: { id: true, title: true }
    });
    if (dbGame) {
      dbGameId = dbGame.id;
      title = dbGame.title;
    }
  } catch {
    // DB not available
  }
  // CMS-only games are editable too; refuse only when the game exists nowhere.
  if (!staticGame && !dbGameId) notFound();

  let initial: FeatureEntry[] = [];
  if (dbGameId) {
    try {
      const features = await prisma.gameFeature.findMany({
        where: { gameId: dbGameId },
        orderBy: { locale: 'asc' }
      });
      initial = features.map((f) => ({
        locale: f.locale,
        content: f.content,
        sortOrder: f.sortOrder
      }));
    } catch {
      // DB not available
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/admin/games/${slug}`}
          className="mb-2 inline-block text-sm text-blue-600 hover:text-blue-800"
        >
          ← 返回游戏编辑
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">
          Features 详情 — {title}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          为每种语言编辑游戏详情（Markdown 富文本 → 长文内容 + GEO 直接问答）
        </p>
      </div>

      <FeaturesEditor slug={slug} initial={initial} />
    </div>
  );
}
