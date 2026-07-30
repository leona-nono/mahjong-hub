import SettingsForm from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">站点设置</h1>
        <p className="mt-1 text-sm text-gray-500">
          全局配置 — SEO 元数据、社交链接、分析追踪、站点外观
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}
