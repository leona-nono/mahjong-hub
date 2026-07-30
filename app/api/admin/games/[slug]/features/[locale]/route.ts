import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import {
  FEATURE_LOCALES,
  MAX_FEATURE_CONTENT,
  validateInt,
  validateRequiredEnum,
  validateString
} from '@/lib/admin-validators';

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

  const err =
    validateRequiredEnum('locale', locale, FEATURE_LOCALES) ??
    validateString('content', body.content, {
      max: MAX_FEATURE_CONTENT,
      required: true
    }) ??
    validateInt('sortOrder', body.sortOrder);
  if (err) return err;

  const feature = await prisma.gameFeature.upsert({
    where: { gameId_locale: { gameId: game.id, locale } },
    create: {
      gameId: game.id,
      locale,
      content: body.content,
      sortOrder: body.sortOrder ?? 0
    },
    update: {
      content: body.content,
      sortOrder: body.sortOrder ?? 0
    }
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

  // Locale is part of the URL path, still validate it stays in our allow-list.
  if (!FEATURE_LOCALES.includes(locale as typeof FEATURE_LOCALES[number])) {
    return NextResponse.json({ error: 'locale 无效' }, { status: 400 });
  }

  try {
    await prisma.gameFeature.delete({
      where: { gameId_locale: { gameId: game.id, locale } }
    });
  } catch {
    // already gone — idempotent
  }
  return NextResponse.json({ ok: true });
}
