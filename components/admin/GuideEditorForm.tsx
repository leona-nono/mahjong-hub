'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownContent from '@/components/MarkdownContent';
import MediaUploadField from '@/components/admin/MediaUploadField';

export interface GuideFormData {
  slug: string;
  title: string;
  description: string;
  content: string;
  cover: string;
  ctaLabel: string;
  ctaHref: string;
  readMinutes: number;
  sortOrder: number;
  isPublished: boolean;
}

const PLACEHOLDER = `## 麻将是什么？

麻将是四人轮流摸打的牌类游戏。

[去玩香港麻将](/games/hong-kong-mahjong)

![配图](/uploads/what-is-mahjong/example.png)

[video](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
`;

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function toInternalPath(raw: string): string {
  let href = raw.trim();
  try {
    const u = new URL(href);
    if (u.hostname.replace(/^www\./, '') === 'mahjonggame.org') {
      href = `${u.pathname}${u.search}`;
    }
  } catch {
    /* relative */
  }
  if (!href.startsWith('/')) href = `/${href}`;
  return href;
}

export default function GuideEditorForm({
  mode,
  initial
}: {
  mode: 'create' | 'edit';
  initial: GuideFormData;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [, startTransition] = useTransition();
  const [form, setForm] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(mode === 'edit' || Boolean(initial.slug));
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [status, setStatus] = useState<{
    kind: 'idle' | 'saving' | 'saved' | 'error';
    msg?: string;
  }>({ kind: 'idle' });

  const insertAtCursor = (snippet: string) => {
    const el = textareaRef.current;
    if (!el) {
      setForm((f) => ({
        ...f,
        content: f.content ? `${f.content.trimEnd()}\n\n${snippet}` : snippet
      }));
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = form.content.slice(0, start);
    const after = form.content.slice(end);
    const pad =
      before && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
    const next = `${before}${pad}${snippet}${after.startsWith('\n') ? after : `\n${after}`}`;
    setForm((f) => ({ ...f, content: next }));
    requestAnimationFrame(() => {
      const pos = (before + pad + snippet).length;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  const uploadKey = form.slug.trim() || 'guide-draft';

  const uploadInlineImage = async (file: File) => {
    setUploading(true);
    try {
      const body = new FormData();
      body.append('slug', uploadKey);
      body.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      insertAtCursor(`![配图](${json.url})`);
    } catch (err) {
      setStatus({ kind: 'error', msg: (err as Error).message });
    } finally {
      setUploading(false);
    }
  };

  const insertInternalLink = () => {
    const raw = window.prompt(
      '站内路径，例如 /games/hong-kong-mahjong 或 /blog/what-is-mahjong',
      '/games/hong-kong-mahjong'
    );
    if (!raw?.trim()) return;
    const href = toInternalPath(raw);
    const label = window.prompt('链接文字', '去玩游戏') || '去玩游戏';
    insertAtCursor(`[${label}](${href})`);
  };

  const insertVideo = () => {
    const url = window.prompt('粘贴 YouTube / Vimeo 视频链接');
    if (!url?.trim()) return;
    insertAtCursor(`[video](${url.trim()})`);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ kind: 'saving' });
    try {
      const payload = {
        slug: form.slug,
        title: form.title,
        description: form.description,
        content: form.content,
        cover: form.cover,
        ctaLabel: form.ctaLabel,
        ctaHref: form.ctaHref,
        readMinutes: form.readMinutes,
        sortOrder: form.sortOrder,
        published: form.isPublished
      };
      const res = await fetch(
        mode === 'create' ? '/api/admin/guides' : `/api/admin/guides/${initial.slug}`,
        {
          method: mode === 'create' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      setStatus({ kind: 'saved', msg: '已保存' });
      startTransition(() => router.push('/admin/beginners'));
      router.refresh();
    } catch (err) {
      setStatus({ kind: 'error', msg: (err as Error).message });
    }
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="grid gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Slug</label>
          <input
            required
            value={form.slug}
            disabled={mode === 'edit'}
            onChange={(e) => {
              setSlugTouched(true);
              setForm((f) => ({ ...f, slug: e.target.value }));
            }}
            placeholder="what-is-mahjong"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm disabled:bg-gray-50"
          />
          <p className="mt-1 text-xs text-gray-400">小写字母、数字、连字符；前台地址 /blog/slug</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">标题</label>
          <input
            required
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((f) => ({
                ...f,
                title,
                slug: mode === 'create' && !slugTouched ? slugify(title) : f.slug
              }));
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">排序</label>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">阅读时长（分钟）</label>
          <input
            type="number"
            value={form.readMinutes}
            onChange={(e) => setForm((f) => ({ ...f, readMinutes: Number(e.target.value) }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">摘要</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">文末按钮文字</label>
          <input
            value={form.ctaLabel}
            onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
            placeholder="去玩香港麻将"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">文末按钮站内链接</label>
          <input
            value={form.ctaHref}
            onChange={(e) => setForm((f) => ({ ...f, ctaHref: e.target.value }))}
            placeholder="/games/hong-kong-mahjong"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
          />
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
          />
          已发布（前台可见）
        </label>
        <div className="sm:col-span-2">
          <MediaUploadField
            slug={uploadKey}
            label="封面图"
            value={form.cover}
            onChange={(cover) => setForm((f) => ({ ...f, cover }))}
          />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium"
          >
            {uploading ? '上传中…' : '插入图片'}
          </button>
          <button
            type="button"
            onClick={insertVideo}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium"
          >
            插入视频
          </button>
          <button
            type="button"
            onClick={insertInternalLink}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium"
          >
            插入站内链接
          </button>
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="ml-auto rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium"
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
              if (file) void uploadInlineImage(file);
              e.target.value = '';
            }}
          />
        </div>
        <div className={`grid gap-4 ${showPreview ? 'lg:grid-cols-2' : ''}`}>
          <textarea
            ref={textareaRef}
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            placeholder={PLACEHOLDER}
            rows={22}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm text-black"
          />
          {showPreview ? (
            <div className="min-h-[28rem] rounded-lg border border-gray-200 bg-white p-4 text-black">
              {form.content.trim() ? (
                <MarkdownContent markdown={form.content} />
              ) : (
                <p className="text-sm text-gray-500">开始编辑后会在这里预览。</p>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status.kind === 'saving' || !form.slug.trim()}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
        >
          {status.kind === 'saving' ? '保存中…' : mode === 'create' ? '创建指南' : '保存修改'}
        </button>
        {status.kind === 'saved' && <span className="text-sm text-green-600">✅ {status.msg}</span>}
        {status.kind === 'error' && <span className="text-sm text-red-600">❌ {status.msg}</span>}
      </div>
    </form>
  );
}
