'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export interface FeatureEntry {
  locale: string;
  content: string;
  sortOrder: number;
}

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'zh-TW', label: '中文(繁)' },
  { code: 'zh-CN', label: '中文(简)' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'pt-BR', label: 'Português (Brasil)' }
];

const PLACEHOLDER = `## 简介

直接回答一段（首段 40-60 字，含目标关键词）。

## 玩法 / 特点

- 特点 1
- 特点 2

## 常见问题

> 这里直接用问答式行文，可被 AI 抓取为直接答案。

## 适合谁

- 玩家类型 1
- 玩家类型 2
`;

interface Props {
  slug: string;
  initial: FeatureEntry[];
}

export default function FeaturesEditor({ slug, initial }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [map, setMap] = useState<Record<string, FeatureEntry>>(() => {
    const m: Record<string, FeatureEntry> = {};
    for (const f of initial) m[f.locale] = f;
    return m;
  });
  const [active, setActive] = useState<string>(initial[0]?.locale ?? 'en');
  const [content, setContent] = useState<string>(initial[0]?.content ?? '');
  const [status, setStatus] = useState<{ kind: 'idle' | 'saving' | 'saved' | 'error'; msg?: string }>({
    kind: 'idle'
  });

  const switchLocale = (l: string) => {
    setActive(l);
    setContent(map[l]?.content ?? '');
    setStatus({ kind: 'idle' });
  };

  const save = async () => {
    setStatus({ kind: 'saving' });
    try {
      const res = await fetch(`/api/admin/games/${slug}/features/${active}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error((await res.json()).error || `HTTP ${res.status}`);
      const { feature } = await res.json();
      setMap((m) => ({ ...m, [active]: feature }));
      setStatus({ kind: 'saved', msg: '已保存' });
      startTransition(() => router.refresh());
    } catch (err) {
      setStatus({ kind: 'error', msg: (err as Error).message });
    }
  };

  const active_ = map[active];

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap gap-1 border-b bg-gray-50 px-4 pt-3">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => switchLocale(l.code)}
            className={`rounded-t-lg px-3 py-2 text-xs font-medium transition ${
              active === l.code
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:bg-white hover:text-gray-800'
            }`}
          >
            {l.label}
            {map[l.code] ? ' ✓' : ''}
          </button>
        ))}
      </div>

      <div className="p-6">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase text-gray-500">
            📝 {active} 富文本 (Markdown)
          </p>
          <span className="text-xs text-gray-400">
            当前已加载 {content.length} 字符
          </span>
        </div>

        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setStatus({ kind: 'idle' });
          }}
          placeholder={PLACEHOLDER}
          rows={20}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm focus:border-blue-500 focus:outline-none"
        />

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={status.kind === 'saving'}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-300"
          >
            {status.kind === 'saving' ? '保存中…' : '保存该语言版本'}
          </button>
          {status.kind === 'saved' && (
            <span className="text-sm text-green-600">✅ {status.msg}</span>
          )}
          {status.kind === 'error' && (
            <span className="text-sm text-red-600">❌ {status.msg}</span>
          )}
          {!active_ && (
            <span className="text-xs text-gray-400">（该语言未保存，新建）</span>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-400">
          💡 <strong>GEO 提示</strong>：首段 40-60 字直接回答"What is this game? / How to play?"，
          含核心关键词；使用 H2/H3 标题组织；末尾 FAQ 段落最有助被 AI 引用。
        </p>
      </div>
    </div>
  );
}
