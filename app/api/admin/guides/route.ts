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
  validateSlug,
  validateString
} from '@/lib/admin-validators';

export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  const guides = await prisma.guide.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }]
  });
  return NextResponse.json({ guides });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const body = await req.json();
  const err =
    validateSlug(body.slug) ??
    validateString('title', body.title, { max: MAX_TITLE, required: true }) ??
    validateString('description', body.description, { max: MAX_DESC }) ??
    validateString('content', body.content, { max: MAX_FEATURE_CONTENT }) ??
    validateString('cover', body.cover, { max: MAX_URL }) ??
    validateString('ctaLabel', body.ctaLabel, { max: MAX_TITLE }) ??
    validateString('ctaHref', body.ctaHref, { max: MAX_URL }) ??
    validateInt('readMinutes', body.readMinutes) ??
    validateInt('sortOrder', body.sortOrder) ??
    validateBool('published', body.published);
  if (err) return err;

  try {
    const existing = await prisma.guide.findUnique({ where: { slug: body.slug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug 已存在' }, { status: 409 });
    }

    const guide = await prisma.guide.create({
      data: {
        slug: body.slug,
        title: body.title,
        description: body.description ?? null,
        content: body.content ?? '',
        cover: body.cover || null,
        ctaLabel: body.ctaLabel || null,
        ctaHref: body.ctaHref || null,
        readMinutes: body.readMinutes ?? 5,
        isPublished: body.published !== false,
        sortOrder: body.sortOrder ?? 0
      }
    });
    revalidateGuidePaths(guide.slug);
    return NextResponse.json({ guide }, { status: 201 });
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
