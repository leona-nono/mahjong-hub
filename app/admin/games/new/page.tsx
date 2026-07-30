import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function checkDb() {
  try {
    await prisma.$connect();
    await prisma.$disconnect();
    return true;
  } catch {
    return false;
  }
}

export default async function NewGamePage() {
  const dbConnected = await checkDb();

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
            ? '数据库已连接，可新建游戏记录'
            : '数据库未连接，暂无法保存'}
        </p>
      </div>

      {!dbConnected && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          ⚠️ 数据库未连接。请配置 DATABASE_URL 后再添加游戏。
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-2">
          <NewField label="Slug（唯一标识）" placeholder="e.g. my-new-game" />
          <NewField label="标题" placeholder="e.g. My New Game" />
          <NewField
            label="分类"
            placeholder="mahjong / connect / solitaire / tile-match"
          />
          <NewField label="推荐排序 (0-999)" placeholder="0" type="number" />
          <div className="sm:col-span-2">
            <NewField
              label="描述"
              placeholder="A short description of the game..."
              multiline
            />
          </div>
          <div className="sm:col-span-2">
            <NewField
              label="iframe URL"
              placeholder="https://example.com/embed/game"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3 border-t pt-6">
          <button
            disabled={!dbConnected}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
          >
            创建游戏
          </button>
        </div>
      </div>
    </div>
  );
}

function NewField({
  label,
  placeholder,
  type,
  multiline
}: {
  label: string;
  placeholder: string;
  type?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
        {label}
      </label>
      {multiline ? (
        <textarea
          placeholder={placeholder}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      ) : (
        <input
          type={type || 'text'}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      )}
    </div>
  );
}
