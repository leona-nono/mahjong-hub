import { connection } from 'next/server';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getBlogPost, getBlogPosts } from '@/data/blog';
import GuideEditorForm from '@/components/admin/GuideEditorForm';
import { getPublicGuide } from '@/lib/guides';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditGuidePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const staticPosts = getBlogPosts();
  const staticPost = getBlogPost(slug);
  let row = null;
  try {
    row = await prisma.guide.findUnique({ where: { slug } });
  } catch {
    row = null;
  }
  if (!row && !staticPost) notFound();

  const merged = row
    ? {
        slug: row.slug,
        title: row.title,
        description: row.description ?? '',
        content: row.content,
        cover: row.cover ?? '',
        ctaLabel: row.ctaLabel ?? '',
        ctaHref: row.ctaHref ?? '',
        readMinutes: row.readMinutes,
        sortOrder: row.sortOrder,
        isPublished: row.isPublished
      }
    : {
        slug,
        title: staticPost!.title,
        description: staticPost!.description,
        content: (await getPublicGuide(slug))?.content ?? '',
        cover: '',
        ctaLabel: staticPost!.cta?.label ?? '',
        ctaHref: staticPost!.cta?.href ?? '',
        readMinutes: staticPost!.readMinutes,
        sortOrder: Math.max(0, staticPosts.findIndex((p) => p.slug === slug)),
        isPublished: true
      };

  return (
    <div>
      <Link href="/admin/beginners" className="mb-2 inline-block text-sm text-blue-600">
        ← 返回指南列表
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">编辑指南: {merged.title}</h1>
      <GuideEditorForm mode={row ? 'edit' : 'create'} initial={merged} />
    </div>
  );
}
