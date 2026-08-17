'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import MediaUploadField, { ScreenshotGallery } from '@/components/admin/MediaUploadField';

export interface GameFormData {
  slug: string;
  title: string;
  description: string;
  iframeUrl: string;
  thumbnail: string;
  screenshots: string[];
  downloadUrl: string;
  category: string;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface Props {
  slug: string;
  initial: GameFormData;
}

const CATEGORIES = [
  { value: 'mahjong', label: '🀄️ 麻将' },
  { value: 'connect', label: '🔗 连连看' },
  { value: 'solitaire', label: '♠️ 单人' },
  { value: 'tile-match', label: '🧩 配对' },
  { value: 'four-player', label: '👥 四人麻将' }
];

/** Convert comma-separated input into a clean string array. */
function parseTagsInput(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

export default function GameEditorForm({ slug, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<GameFormData>(initial);
  const [tagsInput, setTagsInput] = useState(initial.tags.join(', '));
  const [status, setStatus] = useState<{
    kind: 'idle' | 'saving' | 'saved' | 'error';
    msg?: string;
  }>({ kind: 'idle' });

  const onChange =
    (k: keyof GameFormData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const target = e.target;
      const v =
        target instanceof HTMLInputElement && target.type === 'checkbox'
          ? target.checked
          : target.value;
      setForm((f) => ({
        ...f,
        [k]: k === 'sortOrder' ? Number(v) : (v as any)
      }));
    };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ kind: 'saving' });
    try {
      const tags = parseTagsInput(tagsInput);
      const res = await fetch(`/api/admin/games/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          iframeUrl: form.iframeUrl,
          thumbnail: form.thumbnail,
          screenshots: form.screenshots,
          downloadUrl: form.downloadUrl,
          category: form.category,
          tags,
          featured: form.isFeatured,
          active: form.isActive,
          sortOrder: form.sortOrder
        })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      // Sync local state to the parsed tags so the input reflects what was sent.
      setForm((f) => ({ ...f, tags }));
      setStatus({ kind: 'saved', msg: '已保存' });
      startTransition(() => router.refresh());
    } catch (err) {
      setStatus({ kind: 'error', msg: (err as Error).message });
    }
  };

  return (
    <form
      onSubmit={onSave}
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Slug */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
            Slug
          </label>
          <input
            type="text"
            value={form.slug}
            readOnly
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-500"
          />
        </div>

        {/* Title */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
            标题 (Title)
          </label>
          <input
            type="text"
            value={form.title}
            onChange={onChange('title')}
            required
            maxLength={200}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
            分类
          </label>
          <select
            value={form.category}
            onChange={onChange('category')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort order */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
            排序
          </label>
          <input
            type="number"
            value={form.sortOrder}
            onChange={onChange('sortOrder')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {/* Featured */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
            推荐 / 上线
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={onChange('isFeatured')}
                className="h-4 w-4"
              />
              <span>首页推荐</span>
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={onChange('isActive')}
                className="h-4 w-4"
              />
              <span>已上线（未勾选则前台隐藏）</span>
            </label>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
            标签（逗号分隔，最多 32 项）
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="classic, relax, no-time-limit"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
          />
          <p className="mt-1 text-xs text-gray-400">
            例：<code className="rounded bg-gray-100 px-1">classic</code>,
            <code className="rounded bg-gray-100 px-1"> no-time-limit</code>。
            当前 {parseTagsInput(tagsInput).length} 项
          </p>
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
            描述
          </label>
          <textarea
            value={form.description}
            onChange={onChange('description')}
            rows={3}
            maxLength={1000}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-400">
            会作为 {'{summary}'} 套进站点设置里的「游戏 Description 格式」。游戏 Title 会套进「游戏 Title 格式」。
          </p>
        </div>

        {/* iframe URL */}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
            iframe URL
          </label>
          <input
            type="url"
            value={form.iframeUrl}
            onChange={onChange('iframeUrl')}
            maxLength={2048}
            placeholder="https://example.com/embed/game"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
          />
        </div>

        {/* Thumbnail */}
        <div className="sm:col-span-2">
          <MediaUploadField
            slug={slug}
            label="封面图（卡片 / 列表）"
            value={form.thumbnail}
            onChange={(url) => setForm((f) => ({ ...f, thumbnail: url }))}
            hint="上传后会显示在首页卡片和游戏页顶部。也可直接粘贴 CDN 链接。"
          />
        </div>

        <div className="sm:col-span-2">
          <ScreenshotGallery
            slug={slug}
            items={form.screenshots}
            onChange={(screenshots) => setForm((f) => ({ ...f, screenshots }))}
            onSetCover={(url) => setForm((f) => ({ ...f, thumbnail: url }))}
          />
        </div>

        {/* Download URL */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
            下载链接（可选）
          </label>
          <input
            type="url"
            value={form.downloadUrl}
            onChange={onChange('downloadUrl')}
            maxLength={2048}
            placeholder="https://apps.apple.com/..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
          />
        </div>
      </div>

      {/* Status + actions */}
      <div className="mt-6 flex items-center gap-3 border-t pt-6">
        <button
          type="submit"
          disabled={status.kind === 'saving'}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-300"
        >
          {status.kind === 'saving' ? '保存中…' : '保存修改'}
        </button>
        {status.kind === 'saved' && (
          <span className="text-sm text-green-600">✅ {status.msg}</span>
        )}
        {status.kind === 'error' && (
          <span className="text-sm text-red-600">❌ {status.msg}</span>
        )}
        {pending && <span className="text-xs text-gray-400">刷新中…</span>}
      </div>
    </form>
  );
}
