import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** GET /api/admin/i18n — list MessageI18n with optional locale filter. */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const locale = req.nextUrl.searchParams.get('locale') ?? undefined;
  const messages = await prisma.messageI18n.findMany({
    where: locale ? { locale } : undefined,
    orderBy: [{ key: 'asc' }, { locale: 'asc' }],
    take: 1000
  });
  return NextResponse.json({ messages });
}

/** PUT /api/admin/i18n — upsert a single translation by (key, locale). */
export async function PUT(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const body = await req.json();
  const { key, locale, value } = body;

  if (!key || !locale || typeof value !== 'string') {
    return NextResponse.json(
      { error: 'key / locale / value 是必填项' },
      { status: 400 }
    );
  }

  const row = await prisma.messageI18n.upsert({
    where: { key_locale: { key, locale } },
    create: { key, locale, value },
    update: { value }
  });
  return NextResponse.json({ message: row });
}
