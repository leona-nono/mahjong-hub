import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

/** PUT /api/admin/games/[slug]/faqs/[id] — update a FAQ entry. */
export async function PUT(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  for (const k of ['locale', 'question', 'answer', 'sortOrder']) {
    if (k in body) data[k] = body[k];
  }

  const faq = await prisma.gameFaq.update({ where: { id }, data });
  return NextResponse.json({ faq });
}

/** DELETE /api/admin/games/[slug]/faqs/[id] — delete a FAQ entry. */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const { id } = await params;

  await prisma.gameFaq.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
