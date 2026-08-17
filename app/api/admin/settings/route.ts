import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { SETTINGS_KEYS, validateRequiredEnum } from '@/lib/admin-validators';
import { revalidateSiteSettings } from '@/lib/revalidate-site';

export const dynamic = 'force-dynamic';

/** GET /api/admin/settings — read all SiteSetting rows. */
export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  const settings = await prisma.siteSetting.findMany({
    orderBy: { key: 'asc' }
  });
  return NextResponse.json({ settings });
}

/** PUT /api/admin/settings — upsert a single SiteSetting by key. */
export async function PUT(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const body = await req.json();
  const { key, value } = body;

  // `key` is restricted to the SiteSetting allow-list (site / social / analytics).
  // `value` is a Json object — Prisma accepts any serializable JSON and
  // rejects on type errors at the driver boundary.
  const err =
    validateRequiredEnum('key', key, SETTINGS_KEYS) ??
    (value === undefined
      ? NextResponse.json(
          { error: 'value 是必填项' },
          { status: 400 }
        )
      : null);
  if (err) return err;

  const row = await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value }
  });
  revalidateSiteSettings();
  return NextResponse.json({ setting: row });
}
