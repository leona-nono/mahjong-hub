import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { getBlogPost } from '@/data/blog';
import { getAdminGuides, markdownFromBlogPost } from '@/lib/guides';
import { revalidateGuidePaths } from '@/lib/revalidate-guides';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === 'string' ? body.slug : '';
  const direction = body?.direction === 'down' ? 1 : body?.direction === 'up' ? -1 : 0;
  if (!slug || !direction) {
    return NextResponse.json({ error: '需要 slug 和 direction（up/down）' }, { status: 400 });
  }

  const guides = await getAdminGuides();
  const index = guides.findIndex((g) => g.slug === slug);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= guides.length) {
    return NextResponse.json({ error: '无法移动' }, { status: 400 });
  }

  const a = guides[index];
  const b = guides[nextIndex];

  try {
    const sameOrder = a.sortOrder === b.sortOrder;
    await prisma.$transaction([
      upsertSort(a.slug, sameOrder ? nextIndex : b.sortOrder),
      upsertSort(b.slug, sameOrder ? index : a.sortOrder)
    ]);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const missing =
      (typeof err === 'object' && err && 'code' in err && err.code === 'P2021') ||
      /does not exist/i.test(msg);
    return NextResponse.json(
      {
        error: missing
          ? '数据库还没有 Guide 表，请先执行 npx prisma db push'
          : msg || '排序保存失败'
      },
      { status: 500 }
    );
  }

  revalidateGuidePaths();
  return NextResponse.json({ ok: true });
}

function upsertSort(slug: string, sortOrder: number) {
  const post = getBlogPost(slug);
  return prisma.guide.upsert({
    where: { slug },
    update: { sortOrder },
    create: {
      slug,
      title: post?.title ?? slug,
      description: post?.description ?? null,
      content: post ? markdownFromBlogPost(post) : '',
      ctaLabel: post?.cta?.label ?? null,
      ctaHref: post?.cta?.href ?? null,
      readMinutes: post?.readMinutes ?? 5,
      isPublished: true,
      sortOrder
    }
  });
}
