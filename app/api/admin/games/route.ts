import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { getGame } from '@/data/games';
import { prisma } from '@/lib/db';
import { revalidateGamePaths } from '@/lib/revalidate-games';
import {
  GAME_CATEGORIES,
  MAX_DESC,
  MAX_TITLE,
  MAX_URL,
  validateBool,
  validateEnum,
  validateInt,
  validateSlug,
  validateString
} from '@/lib/admin-validators';

export const dynamic = 'force-dynamic';

/** GET /api/admin/games — list all games (used by game list page). */
export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  const games = await prisma.game.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: {
      _count: { select: { faqs: true, features: true } }
    }
  });
  return NextResponse.json({ games });
}

/** POST /api/admin/games — create a new iframe / CMS game. */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const body = await req.json();
  const { slug, title, description, iframeUrl, category, featured, sortOrder } =
    body;

  // Validation — first failure wins.
  const v =
    validateSlug(slug) ??
    validateString('title', title, { max: MAX_TITLE, required: true }) ??
    validateString('description', description, { max: MAX_DESC }) ??
    validateString('iframeUrl', iframeUrl, { max: MAX_URL }) ??
    validateEnum('category', category, GAME_CATEGORIES) ??
    validateBool('featured', featured) ??
    validateInt('sortOrder', sortOrder);
  if (v) return v;

  const staticGame = getGame(slug);
  if (staticGame && staticGame.gameType !== 'iframe') {
    return NextResponse.json(
      { error: '自研游戏请在「自研 SEO」中管理，不可在此创建' },
      { status: 400 }
    );
  }

  const existing = await prisma.game.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: 'Slug 已存在' }, { status: 409 });
  }

  const game = await prisma.game.create({
    data: {
      slug,
      title,
      description: description ?? null,
      iframeUrl: iframeUrl ?? null,
      category: category ?? null,
      isFeatured: !!featured,
      sortOrder: sortOrder ?? 0
    }
  });
  revalidateGamePaths();
  return NextResponse.json({ game }, { status: 201 });
}
