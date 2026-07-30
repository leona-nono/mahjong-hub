export default function I18nPage() {
  return (
    <div>
      <div className="mb-6">
        <a
          href="/admin/settings"
          className="mb-2 inline-block text-sm text-blue-600 hover:text-blue-800"
        >
          ← 返回站点设置
        </a>
        <h1 className="text-2xl font-bold text-gray-800">🌐 i18n 多语言文案管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          管理 UI 界面文案（messages/），如导航、按钮标签、页脚、占位文本
        </p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        ⚠️ 数据库连接后，此页面将提供按语言/按 key 的文案表格编辑功能，支持搜索、批量编辑、自动填充缺失翻译。
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-400 text-center py-8">
          i18n 文案编辑器待后续版本实现
          <br />
          当前 18 种语言的翻译文件位于 <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">messages/</code>
        </p>
      </div>
    </div>
  );
}
