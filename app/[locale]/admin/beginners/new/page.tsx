import { Link } from '@/i18n/navigation';
import GuideEditorForm from '@/components/admin/GuideEditorForm';
import { prisma } from '@/lib/db';
import { getBlogPosts } from '@/data/blog';

export const dynamic = 'force-dynamic';

export default async function NewGuidePage() {
  let sortOrder = getBlogPosts().length;
  try {
    const last = await prisma.guide.findFirst({ orderBy: { sortOrder: 'desc' } });
    if (last) sortOrder = Math.max(sortOrder, last.sortOrder + 1);
  } catch {
    /* keep length-based default */
  }

  return (
    <div>
      <Link href="/admin/beginners" className="mb-2 inline-block text-sm text-blue-600">
        ← 返回指南列表
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">新建新手指南</h1>
      <GuideEditorForm
        mode="create"
        initial={{
          slug: '',
          title: '',
          description: '',
          content: '',
          cover: '',
          ctaLabel: '',
          ctaHref: '',
          readMinutes: 5,
          sortOrder,
          isPublished: true
        }}
      />
    </div>
  );
}
