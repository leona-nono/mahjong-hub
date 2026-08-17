import { Link } from '@/i18n/navigation';
import { isDbConnected } from '@/lib/db-health';
import { getAdminGuides } from '@/lib/guides';
import GuideListActions from '@/components/admin/GuideListActions';

export const dynamic = 'force-dynamic';

export default async function AdminBeginnersPage() {
  const dbConnected = await isDbConnected();
  const guides = await getAdminGuides();
  const orderedSlugs = guides.map((g) => g.slug);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mahjong for Beginners</h1>
          <p className="mt-1 text-sm text-gray-500">
            新手指南：新增、编辑、删除、排序；正文可插入站内链接、图片和视频
          </p>
        </div>
        <Link
          href="/admin/beginners/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          ＋ 新建指南
        </Link>
      </div>

      {!dbConnected && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          数据库未连接时只能预览静态指南，无法保存修改。
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">排序</th>
              <th className="px-4 py-3">标题</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {guides.map((g) => (
              <tr key={g.slug} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{g.sortOrder}</td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {g.title}
                  {g.source === 'cms' ? (
                    <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                      CMS
                    </span>
                  ) : (
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                      静态
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{g.slug}</td>
                <td className="px-4 py-3">{g.isPublished ? '已发布' : '草稿'}</td>
                <td className="px-4 py-3 space-x-3">
                  <Link href={`/admin/beginners/${g.slug}`} className="text-blue-600 hover:text-blue-800">
                    编辑
                  </Link>
                  <GuideListActions
                    slug={g.slug}
                    slugs={orderedSlugs}
                    canDelete={g.source === 'cms'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
