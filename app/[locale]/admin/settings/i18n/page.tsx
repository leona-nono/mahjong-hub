import { Link } from '@/i18n/navigation';
import { prisma } from '@/lib/db';
import { isDbConnected } from '@/lib/db-health';
import I18nEditor, { type I18nRow } from '@/components/admin/I18nEditor';

export const dynamic = 'force-dynamic';

async function loadI18n(): Promise<{
  rows: I18nRow[];
  dbConnected: boolean;
}> {
  const dbConnected = await isDbConnected();
  if (!dbConnected) return { rows: [], dbConnected: false };
  try {
    const messages = await prisma.messageI18n.findMany({
      orderBy: [{ key: 'asc' }, { locale: 'asc' }],
      take: 1000
    });
    return {
      rows: messages.map((m) => ({
        id: m.id,
        key: m.key,
        locale: m.locale,
        value: m.value
      })),
      dbConnected: true
    };
  } catch {
    return { rows: [], dbConnected: false };
  }
}

export default async function I18nPage() {
  const { rows, dbConnected } = await loadI18n();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/settings"
          className="mb-2 inline-block text-sm text-blue-600 hover:text-blue-800"
        >
          ← 返回站点设置
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">🌐 i18n 多语言文案管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          管理 UI 界面文案（对应{' '}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
            messages/&lt;lang&gt;.json
          </code>
          ）：导航、按钮标签、页脚、占位文本等
        </p>
      </div>

      {!dbConnected ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          ⚠️ 数据库未连接。请先配置{' '}
          <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs">
            DATABASE_URL
          </code>
          ，i18n 编辑器将自动加载并启用。
        </div>
      ) : (
        <I18nEditor initial={rows} />
      )}

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-2 text-sm font-bold text-gray-800">📦 数据流向</h3>
        <ul className="ml-5 list-disc space-y-1 text-xs text-gray-500">
          <li>此处保存的翻译在数据库 MessageI18n 表里。</li>
          <li>
            首次部署 / 切换语言时，仍以
            <code className="rounded bg-gray-100 px-1"> messages/&lt;lang&gt;.json </code>
            作为 seed 灌进 DB（PR 阶段可加 <code>prisma:i18n-seed</code> 脚本）。
          </li>
          <li>前台 next-intl 调用顺序：DB row → 静态 JSON → key 原文（fallback）。</li>
          <li>当前限制：单次取 ≤ 1000 条；超过需分页（已在 API 预留 take 参数）。</li>
        </ul>
      </div>
    </div>
  );
}
