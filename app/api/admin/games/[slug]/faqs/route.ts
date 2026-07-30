import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

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
  if (!locale || !question || !answer) {
    return NextResponse.json(
      { error: 'locale / question / answer 是必填项' },
      { status: 400 }
    );
  }

  const faq = await prisma.gameFaq.create({
    data: {
      gameId: game.id,
      locale,
      question,
      answer,
      sortOrder: sortOrder ?? 0
    }
  });
  return NextResponse.json({ faq }, { status: 201 });
}
