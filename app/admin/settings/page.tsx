export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">站点设置</h1>
        <p className="mt-1 text-sm text-gray-500">
          全局配置 — SEO 元数据、社交链接、分析追踪、站点外观
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* SEO */}
        <SettingsCard
          title="🔍 SEO 元数据"
          desc="站点标题、描述、默认 OG 图片、robots 策略、canonical URL"
          fields={[
            { label: '站点标题', value: 'Mahjong Hub · Rainbow Mahjong Games' },
            { label: '站点描述', value: 'A rainbow-themed collection of relaxing mahjong games...' },
            { label: '默认语言', value: 'en' },
            { label: '默认 OG 图片', value: '/og-default.png' }
          ]}
        />

        {/* Social */}
        <SettingsCard
          title="🔗 社交链接"
          desc="Facebook / X / Instagram / TikTok / YouTube 官方账号"
          fields={[
            { label: 'Facebook', value: '' },
            { label: 'X (Twitter)', value: '' },
            { label: 'Instagram', value: '' },
            { label: 'TikTok', value: '' }
          ]}
        />

        {/* Analytics */}
        <SettingsCard
          title="📊 分析追踪"
          desc="Google Analytics / GTM / Facebook Pixel / Bing 等追踪代码"
          fields={[
            { label: 'Google Analytics ID', value: '' },
            { label: 'GTM Container ID', value: '' },
            { label: 'Facebook Pixel ID', value: '' }
          ]}
        />

        {/* Appearance */}
        <SettingsCard
          title="🎨 外观"
          desc="主题色、字体、布局偏好 — 对标 FaWeb 主题预设"
          fields={[
            { label: '当前主题', value: 'default' },
            { label: '主色', value: '#6366f1' },
            { label: '强调色', value: '#f59e0b' }
          ]}
        />
      </div>

      {/* DB note */}
      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        ⚠️ 数据库连接后，站点设置将持久化保存并可实时编辑。
      </div>
    </div>
  );
}

function SettingsCard({
  title,
  desc,
  fields
}: {
  title: string;
  desc: string;
  fields: { label: string; value: string }[];
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-gray-800">{title}</h3>
      <p className="mb-4 mt-1 text-xs text-gray-400">{desc}</p>
      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.label}>
            <label className="mb-0.5 block text-xs font-medium text-gray-500">
              {f.label}
            </label>
            <input
              type="text"
              readOnly
              defaultValue={f.value}
              placeholder="（待配置）"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 read-only:bg-gray-50"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
