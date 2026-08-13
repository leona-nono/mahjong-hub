import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { getGame } from '@/data/games';
import { prisma } from '@/lib/db';
import FaqEditor, { type FaqRow } from '@/components/admin/FaqEditor';

export const dynamic = 'force-dynamic';

export default async function GameFaqsPage({
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

  let initial: FaqRow[] = [];
  if (dbGameId) {
    try {
      const faqs = await prisma.gameFaq.findMany({
        where: { gameId: dbGameId },
        orderBy: [{ locale: 'asc' }, { sortOrder: 'asc' }]
      });
      initial = faqs.map((f) => ({
        id: f.id,
        locale: f.locale,
        question: f.question,
        answer: f.answer,
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
          FAQ 问答 — {title}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          为每种语言编辑 FAQ 条目（自动生成 FAQPage JSON-LD → SEO 富媒体 + GEO 直接问答）
        </p>
      </div>

      <FaqEditor slug={slug} initial={initial} />
    </div>
  );
}
