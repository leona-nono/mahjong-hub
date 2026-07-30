import NewGameForm from '@/components/admin/NewGameForm';
import { isDbConnected } from '@/lib/db-health';

export const dynamic = 'force-dynamic';

export default async function NewGamePage() {
  const dbConnected = await isDbConnected();

  return (
    <div>
      <div className="mb-6">
        <a
          href="/admin/games"
          className="mb-2 inline-block text-sm text-blue-600 hover:text-blue-800"
        >
          ← 返回游戏列表
        </a>
        <h1 className="text-2xl font-bold text-gray-800">新建游戏</h1>
        <p className="mt-1 text-sm text-gray-500">
          {dbConnected
            ? '数据库已连接，填写后点击创建'
            : '数据库未连接，暂无法保存'}
        </p>
      </div>

      {!dbConnected && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          ⚠️ 数据库未连接。请配置 DATABASE_URL 后再添加游戏。
        </div>
      )}

      {dbConnected ? (
        <NewGameForm />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-400">
          数据库未就绪，无法渲染新建表单。
        </div>
      )}
    </div>
  );
}
