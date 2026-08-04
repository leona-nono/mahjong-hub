import { prisma } from '@/lib/db';
import SettingsForm, {
  type SettingsForm as SettingsFormData
} from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

async function getInitialSettings(): Promise<{
  initial: Partial<SettingsFormData>;
  dbConnected: boolean;
}> {
  try {
    const rows = await prisma.siteSetting.findMany();
    const byKey: Record<string, Record<string, unknown>> = {};
    for (const r of rows) {
      byKey[r.key] = (r.value ?? {}) as Record<string, unknown>;
    }
    // Flatten the three stored keys (site / social / analytics) back into the
    // flat form shape — field names are intentionally aligned across both.
    return {
      initial: {
        ...(byKey.site ?? {}),
        ...(byKey.social ?? {}),
        ...(byKey.analytics ?? {})
      },
      // Reaching here means the DB answered — connected even if no rows yet.
      dbConnected: true
    };
  } catch {
    // DB not available — fall back to component DEFAULTS.
    return { initial: {}, dbConnected: false };
  }
}

export default async function AdminSettingsPage() {
  const { initial, dbConnected } = await getInitialSettings();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">站点设置</h1>
        <p className="mt-1 text-sm text-gray-500">
          全局配置 — SEO 元数据、社交链接、分析追踪、站点外观
        </p>
      </div>

      {!dbConnected && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          ⚠️ 数据库未连接。下方修改无法保存（按钮会显示错误）。配置 DATABASE_URL 后可生效。
        </div>
      )}

      <SettingsForm initial={initial} />
    </div>
  );
}
