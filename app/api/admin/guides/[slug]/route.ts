import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { revalidateGuidePaths } from '@/lib/revalidate-guides';
import {
  MAX_DESC,
  MAX_FEATURE_CONTENT,
  MAX_TITLE,
  MAX_URL,
  validateBool,
  validateInt,
  validateString
} from '@/lib/admin-validators';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const { slug } = await params;

  const guide = await prisma.guide.findUnique({ where: { slug } });
  if (!guide) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ guide });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const { slug } = await params;
  const body = await req.json();

  const err =
    ('title' in body
      ? validateString('title', body.title, { max: MAX_TITLE, required: true })
      : null) ??
    ('description' in body
      ? validateString('description', body.description, { max: MAX_DESC })
      : null) ??
    ('content' in body
      ? validateString('content', body.content, { max: MAX_FEATURE_CONTENT })
      : null) ??
    ('cover' in body ? validateString('cover', body.cover, { max: MAX_URL }) : null) ??
    ('ctaLabel' in body
      ? validateString('ctaLabel', body.ctaLabel, { max: MAX_TITLE })
      : null) ??
    ('ctaHref' in body
      ? validateString('ctaHref', body.ctaHref, { max: MAX_URL })
      : null) ??
    ('readMinutes' in body ? validateInt('readMinutes', body.readMinutes) : null) ??
    ('sortOrder' in body ? validateInt('sortOrder', body.sortOrder) : null) ??
    ('published' in body ? validateBool('published', body.published) : null);
  if (err) return err;

  const data: Record<string, unknown> = {};
  if ('title' in body) data.title = body.title;
  if ('description' in body) data.description = body.description || null;
  if ('content' in body) data.content = body.content ?? '';
  if ('cover' in body) data.cover = body.cover || null;
  if ('ctaLabel' in body) data.ctaLabel = body.ctaLabel || null;
  if ('ctaHref' in body) data.ctaHref = body.ctaHref || null;
  if ('readMinutes' in body) data.readMinutes = body.readMinutes ?? 5;
  if ('sortOrder' in body) data.sortOrder = body.sortOrder ?? 0;
  if ('published' in body) data.isPublished = !!body.published;

  try {
    const guide = await prisma.guide.upsert({
      where: { slug },
      update: data,
      create: {
        slug,
        title: String(body.title ?? slug),
        description: body.description || null,
        content: body.content ?? '',
        cover: body.cover || null,
        ctaLabel: body.ctaLabel || null,
        ctaHref: body.ctaHref || null,
        readMinutes: body.readMinutes ?? 5,
        isPublished: body.published !== false,
        sortOrder: body.sortOrder ?? 0
      }
    });
    revalidateGuidePaths(slug);
    return NextResponse.json({ guide });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const missing =
      (typeof err === 'object' && err && 'code' in err && err.code === 'P2021') ||
      /does not exist/i.test(msg);
    return NextResponse.json(
      {
        error: missing
          ? '数据库还没有 Guide 表，请先执行 npx prisma db push'
          : msg || '保存失败'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const { slug } = await params;
  await prisma.guide.delete({ where: { slug } });
  revalidateGuidePaths(slug);
  return NextResponse.json({ ok: true });
}
