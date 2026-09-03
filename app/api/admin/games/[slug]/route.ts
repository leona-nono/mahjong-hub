import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
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
  validateString,
  validateTags,
  validateUrlList
} from '@/lib/admin-validators';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

/** GET /api/admin/games/[slug] — fetch single game with FAQs/Features. */
export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const { slug } = await params;

  const game = await prisma.game.findUnique({
    where: { slug },
    include: {
      faqs: { orderBy: { sortOrder: 'asc' } },
      features: { orderBy: { locale: 'asc' } }
    }
  });
  if (!game) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ game });
}

/** PUT /api/admin/games/[slug] — update a game. */
export async function PUT(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const { slug } = await params;
  const body = await req.json();

  // Field-level validation — only validate fields the client sent.
  const err =
    ('title' in body
      ? validateString('title', body.title, { max: MAX_TITLE, required: true })
      : null) ??
    ('description' in body
      ? validateString('description', body.description, { max: MAX_DESC })
      : null) ??
    ('iframeUrl' in body
      ? validateString('iframeUrl', body.iframeUrl, { max: MAX_URL })
      : null) ??
    ('downloadUrl' in body
      ? validateString('downloadUrl', body.downloadUrl, { max: MAX_URL })
      : null) ??
    ('thumbnail' in body
      ? validateString('thumbnail', body.thumbnail, { max: MAX_URL })
      : null) ??
    ('category' in body
      ? validateEnum('category', body.category, GAME_CATEGORIES)
      : null) ??
    ('tags' in body
      ? validateTags(body.tags)
      : null) ??
    ('screenshots' in body ? validateUrlList('screenshots', body.screenshots) : null) ??
    ('sortOrder' in body ? validateInt('sortOrder', body.sortOrder) : null) ??
    ('featured' in body ? validateBool('featured', body.featured) : null) ??
    ('active' in body ? validateBool('active', body.active) : null);
  if (err) return err;

  const data: Record<string, unknown> = {};
  for (const k of [
    'title',
    'description',
    'iframeUrl',
    'downloadUrl',
    'thumbnail',
    'category',
    'tags',
    'sortOrder',
    'screenshots'
  ]) {
    if (k in body) data[k] = body[k];
  }
  if ('featured' in body) data.isFeatured = !!body.featured;
  if ('active' in body) data.isActive = !!body.active;

  const game = await prisma.game.update({ where: { slug }, data });
  revalidateGamePaths(slug);
  return NextResponse.json({ game });
}

/** DELETE /api/admin/games/[slug] — delete a game (cascades FAQs/Features). */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const { slug } = await params;

  await prisma.game.delete({ where: { slug } });
  revalidateGamePaths(slug);
  return NextResponse.json({ ok: true });
}
