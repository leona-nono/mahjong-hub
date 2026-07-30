'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export interface GameFormData {
  slug: string;
  title: string;
  description: string;
  iframeUrl: string;
  category: string;
  isFeatured: boolean;
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
  { value: 'tile-match', label: '🧩 配对' }
];

export default function GameEditorForm({ slug, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<GameFormData>(initial);
  const [status, setStatus] = useState<{
    kind: 'idle' | 'saving' | 'saved' | 'error';
    msg?: string;
  }>({ kind: 'idle' });

  const onChange = (k: keyof GameFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      const res = await fetch(`/api/admin/games/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          iframeUrl: form.iframeUrl,
          category: form.category,
          featured: form.isFeatured,
          sortOrder: form.sortOrder
        })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      setStatus({ kind: 'saved', msg: '已保存' });
      startTransition(() => router.refresh());
    } catch (err) {
      setStatus({ kind: 'error', msg: (err as Error).message });
    }
  };

  return (
    <form onSubmit={onSave} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Slug */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Slug</label>
          <input
            type="text"
            value={form.slug}
            readOnly
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-500"
          />
        </div>

        {/* Title */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">标题 (Title)</label>
          <input
            type="text"
            value={form.title}
            onChange={onChange('title')}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">分类</label>
          <select
            value={form.category}
            onChange={onChange('category')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Featured */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">推荐</label>
          <label className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={onChange('isFeatured')}
              className="h-4 w-4"
            />
            <span>首页推荐</span>
          </label>
        </div>

        {/* Sort order */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">排序</label>
          <input
            type="number"
            value={form.sortOrder}
            onChange={onChange('sortOrder')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">描述</label>
          <textarea
            value={form.description}
            onChange={onChange('description')}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {/* iframe URL */}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">iframe URL</label>
          <input
            type="url"
            value={form.iframeUrl}
            onChange={onChange('iframeUrl')}
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
