import { notFound } from 'next/navigation';
import { getGame } from '@/data/games';

export async function generateStaticParams() {
  return [];
}

export default async function GameFeaturesPage({
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
          Features 详情 — {game.title}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          为每种语言编辑游戏详情（MDX 富文本 → 长文内容 + GEO 直接问答段）
        </p>
      </div>

      {/* Language tabs + editor */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 border-b bg-gray-50 px-4 pt-3">
          {['en', 'zh-TW', 'zh-CN', 'ja', 'ko'].map((code) => (
            <button
              key={code}
              className="rounded-t-lg px-3 py-2 text-xs font-medium text-gray-500 transition hover:bg-white hover:text-gray-800"
              data-locale={code}
            >
              {code}
            </button>
          ))}
        </div>

        {/* Editor placeholder */}
        <div className="p-6">
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
            <p className="text-lg mb-2">📝 MDX 富文本编辑器</p>
            <p>DB 连接后将提供每语言 Features 内容编辑</p>
            <p className="mt-1">
              支持 Markdown 排版 + 内嵌组件（标题/列表/图片/引用）
            </p>
            <p className="mt-4 text-xs text-gray-300">
              GEO 要求：每篇须包含一段直接问答（Direct Answer）段落和实体标注（Entity Annotation）
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
