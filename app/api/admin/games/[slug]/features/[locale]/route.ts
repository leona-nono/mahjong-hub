import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string; locale: string }> };

/** PUT /api/admin/games/[slug]/features/[locale] — upsert per-locale Features. */
export async function PUT(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const { slug, locale } = await params;
  const body = await req.json();

  const game = await prisma.game.findUnique({
    where: { slug },
    select: { id: true }
  });
  if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });

  const { content, sortOrder } = body;
  if (typeof content !== 'string') {
    return NextResponse.json({ error: 'content 是必填项' }, { status: 400 });
  }

  const feature = await prisma.gameFeature.upsert({
    where: { gameId_locale: { gameId: game.id, locale } },
    create: { gameId: game.id, locale, content, sortOrder: sortOrder ?? 0 },
    update: { content, sortOrder: sortOrder ?? 0 }
  });
  return NextResponse.json({ feature });
}

/** DELETE /api/admin/games/[slug]/features/[locale] — delete per-locale Features. */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const { slug, locale } = await params;

  const game = await prisma.game.findUnique({
    where: { slug },
    select: { id: true }
  });
  if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });

  try {
    await prisma.gameFeature.delete({
      where: { gameId_locale: { gameId: game.id, locale } }
    });
  } catch {
    // already gone — idempotent
  }
  return NextResponse.json({ ok: true });
}
