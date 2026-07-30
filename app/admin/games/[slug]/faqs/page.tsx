import { notFound } from 'next/navigation';
import { getGame } from '@/data/games';

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'zh-TW', label: '中文 (台灣)' },
  { code: 'zh-CN', label: '中文 (简体)' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'it', label: 'Italiano' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pl', label: 'Polski' },
  { code: 'ru', label: 'Русский' },
  { code: 'ar', label: 'العربية' },
  { code: 'th', label: 'ไทย' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'ms', label: 'Bahasa Melayu' }
];

export async function generateStaticParams() {
  // Not pre-rendering — dynamic for admin
  return [];
}

export default async function GameFaqsPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <a
          href={`/admin/games/${slug}`}
          className="mb-2 inline-block text-sm text-blue-600 hover:text-blue-800"
        >
          ← 返回游戏编辑
        </a>
        <h1 className="text-2xl font-bold text-gray-800">
          FAQ 问答 — {game.title}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          为每种语言编辑 FAQ 条目（FAQPage JSON-LD → SEO 富媒体 + GEO 直接问答）
        </p>
      </div>

      {/* Language tabs + FAQ per locale */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 border-b bg-gray-50 px-4 pt-3">
          {LOCALES.map((loc) => (
            <button
              key={loc.code}
              className="rounded-t-lg px-3 py-2 text-xs font-medium text-gray-500 transition hover:bg-white hover:text-gray-800 data-[active]:bg-white data-[active]:text-blue-600 data-[active]:shadow-sm"
              data-active={loc.code === 'en' ? '' : undefined}
              data-locale={loc.code}
            >
              {loc.label}
            </button>
          ))}
        </div>

        {/* FAQ Editor placeholder */}
        <div className="p-6">
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
            <p className="text-lg mb-2">❓ FAQ 问答行编辑器</p>
            <p>DB 连接后将在此处展示每语言 FAQ 问答列表</p>
            <p className="mt-1">
              每个问答行包含：问题 (question) + 答案 (answer) + 排序 (sortOrder)
            </p>
            <p className="mt-4 text-xs text-gray-300">
              每个语言独立存储，支持添加、编辑、删除、拖拽排序
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
