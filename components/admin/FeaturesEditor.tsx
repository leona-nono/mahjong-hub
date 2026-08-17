'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownContent from '@/components/MarkdownContent';
import { CMS_FEATURE_LOCALE_LABELS, CMS_FEATURE_LOCALES } from '@/lib/cms-locale';

export interface FeatureEntry {
  locale: string;
  content: string;
  sortOrder: number;
}

const PLACEHOLDER = `## 简介

直接回答一段（首段 40-60 字，含目标关键词）。

![游戏截图](/uploads/games/your-slug/example.png)

## 玩法 / 特点

- 特点 1
- 特点 2

## 视频演示

[video](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

或使用：

@video https://www.youtube.com/watch?v=dQw4w9WgXcQ

## 常见问题

> 这里直接用问答式行文，可被 AI 抓取为直接答案。
`;

interface Props {
  slug: string;
  initial: FeatureEntry[];
}

export default function FeaturesEditor({ slug, initial }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();
  const [map, setMap] = useState<Record<string, FeatureEntry>>(() => {
    const m: Record<string, FeatureEntry> = {};
    for (const f of initial) m[f.locale] = f;
    return m;
  });
  const [active, setActive] = useState<string>(initial[0]?.locale ?? 'en');
  const [content, setContent] = useState<string>(initial[0]?.content ?? '');
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [status, setStatus] = useState<{ kind: 'idle' | 'saving' | 'saved' | 'error'; msg?: string }>({
    kind: 'idle'
  });

  const switchLocale = (l: string) => {
    setActive(l);
    setContent(map[l]?.content ?? '');
    setStatus({ kind: 'idle' });
  };

  const insertAtCursor = (snippet: string) => {
    setContent((prev) => (prev ? `${prev.trimEnd()}\n\n${snippet}` : snippet));
    setStatus({ kind: 'idle' });
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const body = new FormData();
      body.append('slug', slug);
      body.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      insertAtCursor(`![游戏截图](${json.url})`);
    } catch (err) {
      setStatus({ kind: 'error', msg: (err as Error).message });
    } finally {
      setUploading(false);
    }
  };

  const insertVideo = () => {
    const url = window.prompt('粘贴 YouTube / Vimeo 视频链接');
    if (!url?.trim()) return;
    insertAtCursor(`[video](${url.trim()})`);
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
        {CMS_FEATURE_LOCALES.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => switchLocale(code)}
            className={`rounded-t-lg px-3 py-2 text-xs font-medium transition ${
              active === code
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:bg-white hover:text-gray-800'
            }`}
          >
            {CMS_FEATURE_LOCALE_LABELS[code]}
            {map[code] ? ' ✓' : ''}
          </button>
        ))}
      </div>

      <div className="p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {uploading ? '上传中…' : '插入图片'}
          </button>
          <button
            type="button"
            onClick={insertVideo}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            插入视频链接
          </button>
          <button
            type="button"
            onClick={() => insertAtCursor('## 新章节\n\n在这里写内容。')}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            插入标题
          </button>
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="ml-auto rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            {showPreview ? '隐藏预览' : '显示预览'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadImage(file);
              e.target.value = '';
            }}
          />
        </div>

        <div className={`grid gap-4 ${showPreview ? 'lg:grid-cols-2' : ''}`}>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
              📝 {active} Markdown 内容
            </p>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setStatus({ kind: 'idle' });
              }}
              placeholder={PLACEHOLDER}
              rows={22}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {showPreview ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
                👁 前台预览
              </p>
              <div className="min-h-[28rem] rounded-lg border border-gray-200 bg-slate-900/95 p-4">
                {content.trim() ? (
                  <MarkdownContent markdown={content} />
                ) : (
                  <p className="text-sm text-portal-muted">开始编辑后会在这里预览。</p>
                )}
              </div>
            </div>
          ) : null}
        </div>

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
          支持 Markdown 标题、列表、图片 `![说明](url)`、视频 `[video](YouTube链接)` 或 `@video 链接`。
        </p>
      </div>
    </div>
  );
}
