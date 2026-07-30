import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

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

  if (!key || value === undefined) {
    return NextResponse.json({ error: 'key / value 是必填项' }, { status: 400 });
  }

  const row = await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value }
  });
  return NextResponse.json({ setting: row });
}
