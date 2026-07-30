import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import {
  ALL_LOCALES,
  MAX_KEY,
  MAX_VALUE,
  validateEnum,
  validateString
} from '@/lib/admin-validators';

export const dynamic = 'force-dynamic';

/** GET /api/admin/i18n — list MessageI18n with optional locale filter. */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const locale = req.nextUrl.searchParams.get('locale') ?? undefined;
  if (locale && !ALL_LOCALES.includes(locale as typeof ALL_LOCALES[number])) {
    return NextResponse.json({ error: 'locale 无效' }, { status: 400 });
  }
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

  const err =
    validateString('key', key, { max: MAX_KEY, required: true }) ??
    validateEnum('locale', locale, ALL_LOCALES) ??
    validateString('value', value, { max: MAX_VALUE, required: true });
  if (err) return err;

  const row = await prisma.messageI18n.upsert({
    where: { key_locale: { key, locale } },
    create: { key, locale, value },
    update: { value }
  });
  return NextResponse.json({ message: row });
}
