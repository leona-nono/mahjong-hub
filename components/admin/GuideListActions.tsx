'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function GuideListActions({
  slug,
  slugs,
  canDelete
}: {
  slug: string;
  slugs: string[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const index = slugs.indexOf(slug);

  const move = async (direction: 'up' | 'down') => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/guides/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, direction })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      router.refresh();
    } catch (err) {
      window.alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`确定删除指南 ${slug}？静态原文（如有）会重新显示。`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/guides/${slug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.refresh();
    } catch (err) {
      window.alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={() => void move('up')}
        disabled={busy || index <= 0}
        className="text-gray-500 hover:text-gray-800 disabled:opacity-30"
      >
        上移
      </button>
      <button
        type="button"
        onClick={() => void move('down')}
        disabled={busy || index < 0 || index >= slugs.length - 1}
        className="text-gray-500 hover:text-gray-800 disabled:opacity-30"
      >
        下移
      </button>
      {canDelete ? (
        <button
          type="button"
          onClick={() => void remove()}
          disabled={busy}
          className="text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          删除
        </button>
      ) : null}
    </span>
  );
}
