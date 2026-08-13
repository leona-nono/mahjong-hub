import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { revalidateGamePaths } from '@/lib/revalidate-games';
import {
  ALL_LOCALES,
  MAX_ANSWER,
  MAX_QUESTION,
  validateInt,
  validateRequiredEnum,
  validateString
} from '@/lib/admin-validators';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

/** GET /api/admin/games/[slug]/faqs — list all FAQs for a game (grouped by locale). */
export async function GET(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const { slug } = await params;

  const game = await prisma.game.findUnique({
    where: { slug },
    select: { id: true }
  });
  if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });

  const locale = req.nextUrl.searchParams.get('locale') ?? undefined;
  if (locale && !ALL_LOCALES.includes(locale as typeof ALL_LOCALES[number])) {
    return NextResponse.json({ error: 'locale 无效' }, { status: 400 });
  }
  const faqs = await prisma.gameFaq.findMany({
    where: { gameId: game.id, ...(locale ? { locale } : {}) },
    orderBy: [{ locale: 'asc' }, { sortOrder: 'asc' }]
  });
  return NextResponse.json({ faqs });
}

/** POST /api/admin/games/[slug]/faqs — create a new FAQ entry. */
export async function POST(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const { slug } = await params;
  const body = await req.json();

  const game = await prisma.game.findUnique({
    where: { slug },
    select: { id: true }
  });
  if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });

  const { locale, question, answer, sortOrder } = body;

  const err =
    validateRequiredEnum('locale', locale, ALL_LOCALES) ??
    validateString('question', question, {
      max: MAX_QUESTION,
      required: true
    }) ??
    validateString('answer', answer, {
      max: MAX_ANSWER,
      required: true
    }) ??
    validateInt('sortOrder', sortOrder);
  if (err) return err;

  const faq = await prisma.gameFaq.create({
    data: {
      gameId: game.id,
      locale,
      question,
      answer,
      sortOrder: sortOrder ?? 0
    }
  });
  revalidateGamePaths(slug);
  return NextResponse.json({ faq }, { status: 201 });
}
