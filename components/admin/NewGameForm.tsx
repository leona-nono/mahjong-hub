'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface NewGameFormData {
  slug: string;
  title: string;
  description: string;
  iframeUrl: string;
  category: string;
  isFeatured: boolean;
  sortOrder: number;
}

const CATEGORIES = [
  { value: 'mahjong', label: '🀄️ 麻将' },
  { value: 'connect', label: '🔗 连连看' },
  { value: 'solitaire', label: '♠️ 单人' },
  { value: 'tile-match', label: '🧩 配对' },
  { value: 'four-player', label: '👥 四人麻将' }
];

export default function NewGameForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<NewGameFormData>({
    slug: '',
    title: '',
    description: '',
    iframeUrl: '',
    category: 'mahjong',
    isFeatured: false,
    sortOrder: 0
  });
  const [status, setStatus] = useState<{
    kind: 'idle' | 'saving' | 'error';
    msg?: string;
  }>({ kind: 'idle' });

  const onChange =
    (k: keyof NewGameFormData) =>
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug.trim() || !form.title.trim()) {
      setStatus({ kind: 'error', msg: 'Slug 和标题是必填项' });
      return;
    }
    setStatus({ kind: 'saving' });
    try {
      const res = await fetch('/api/admin/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: form.slug.trim(),
          title: form.title.trim(),
          description: form.description.trim(),
          iframeUrl: form.iframeUrl.trim(),
          category: form.category,
          featured: form.isFeatured,
          sortOrder: form.sortOrder
        })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const targetSlug = form.slug.trim();
      // Jump to the edit page so the user can immediately fill FAQs/Features.
      startTransition(() => {
        router.push(`/admin/games/${targetSlug}`);
        router.refresh();
      });
    } catch (err) {
      setStatus({ kind: 'error', msg: (err as Error).message });
    }
  };

  const canSubmit =
    form.slug.trim().length >= 2 &&
    form.title.trim().length > 0 &&
    status.kind !== 'saving';

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Slug */}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
            Slug（URL 标识，保存后不可改）
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={onChange('slug')}
            required
            minLength={2}
            maxLength={64}
            pattern="^[a-z0-9][a-z0-9-]*[a-z0-9]$"
            placeholder="my-new-game"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-400">
            只能包含小写字母、数字、连字符；首尾必须是字母或数字（如
            <code className="rounded bg-gray-100 px-1 py-0.5">aloha-mahjong</code>）。
          </p>
        </div>

        {/* Title */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
            标题（默认语言）
          </label>
          <input
            type="text"
            value={form.title}
            onChange={onChange('title')}
            required
            maxLength={200}
            placeholder="Aloha Mahjong"
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
            推荐
          </label>
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
            placeholder="A short description of the game..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* iframe URL */}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
            iframe URL（可选）
          </label>
          <input
            type="url"
            value={form.iframeUrl}
            onChange={onChange('iframeUrl')}
            maxLength={2048}
            placeholder="https://example.com/embed/game"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Status + actions */}
      <div className="mt-6 flex items-center gap-3 border-t pt-6">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-300"
        >
          {status.kind === 'saving' ? '创建中…' : '创建游戏'}
        </button>
        {status.kind === 'error' && (
          <span className="text-sm text-red-600">❌ {status.msg}</span>
        )}
        {pending && (
          <span className="text-xs text-gray-400">跳转中…</span>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-400">
        💡 创建后可继续填 FAQ 多语言问答、Features 详情与站点设置。
      </p>
    </form>
  );
}
