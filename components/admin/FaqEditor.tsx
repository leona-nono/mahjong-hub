'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export interface FaqRow {
  id: string;
  locale: string;
  question: string;
  answer: string;
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

interface Props {
  slug: string;
  initial: FaqRow[];
}

export default function FaqEditor({ slug, initial }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [faqs, setFaqs] = useState<FaqRow[]>(initial);
  const [locale, setLocale] = useState<string>(
    initial[0]?.locale ?? 'en'
  );
  const [status, setStatus] = useState<{ kind: 'idle' | 'saving' | 'error'; msg?: string }>({
    kind: 'idle'
  });
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');

  const filtered = faqs
    .filter((f) => f.locale === locale)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const create = async () => {
    if (!newQ.trim() || !newA.trim()) return;
    setStatus({ kind: 'saving' });
    try {
      const res = await fetch(`/api/admin/games/${slug}/faqs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          question: newQ.trim(),
          answer: newA.trim(),
          sortOrder: filtered.length
        })
      });
      if (!res.ok) throw new Error((await res.json()).error || `HTTP ${res.status}`);
      const { faq } = await res.json();
      setFaqs((f) => [...f, faq]);
      setNewQ('');
      setNewA('');
      setStatus({ kind: 'idle' });
      startTransition(() => router.refresh());
    } catch (err) {
      setStatus({ kind: 'error', msg: (err as Error).message });
    }
  };

  const update = async (id: string, patch: Partial<FaqRow>) => {
    setStatus({ kind: 'saving' });
    try {
      const res = await fetch(`/api/admin/games/${slug}/faqs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      if (!res.ok) throw new Error((await res.json()).error || `HTTP ${res.status}`);
      const { faq } = await res.json();
      setFaqs((f) => f.map((x) => (x.id === id ? faq : x)));
      setStatus({ kind: 'idle' });
    } catch (err) {
      setStatus({ kind: 'error', msg: (err as Error).message });
    }
  };

  const remove = async (id: string) => {
    if (!confirm('确认删除这个 FAQ？')) return;
    setStatus({ kind: 'saving' });
    try {
      const res = await fetch(`/api/admin/games/${slug}/faqs/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error((await res.json()).error || `HTTP ${res.status}`);
      setFaqs((f) => f.filter((x) => x.id !== id));
      setStatus({ kind: 'idle' });
      startTransition(() => router.refresh());
    } catch (err) {
      setStatus({ kind: 'error', msg: (err as Error).message });
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b bg-gray-50 px-4 pt-3">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLocale(l.code)}
            className={`rounded-t-lg px-3 py-2 text-xs font-medium transition ${
              locale === l.code
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:bg-white hover:text-gray-800'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Add new */}
        <div className="mb-6 rounded-lg border-2 border-dashed border-gray-200 p-4">
          <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
            ➕ {locale} 新问答
          </p>
          <input
            type="text"
            placeholder="问题"
            value={newQ}
            onChange={(e) => setNewQ(e.target.value)}
            className="mb-2 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="答案"
            value={newA}
            onChange={(e) => setNewA(e.target.value)}
            rows={2}
            className="mb-2 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={create}
            disabled={status.kind === 'saving'}
            className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:bg-gray-300"
          >
            添加
          </button>
        </div>

        {/* Existing */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 italic">该语言暂无 FAQ</p>
          )}
          {filtered.map((f) => (
            <FaqRowEditor
              key={f.id}
              faq={f}
              onUpdate={update}
              onDelete={remove}
            />
          ))}
        </div>

        {status.kind === 'error' && (
          <p className="mt-4 text-sm text-red-600">❌ {status.msg}</p>
        )}
      </div>
    </div>
  );
}

function FaqRowEditor({
  faq,
  onUpdate,
  onDelete
}: {
  faq: FaqRow;
  onUpdate: (id: string, patch: Partial<FaqRow>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [q, setQ] = useState(faq.question);
  const [a, setA] = useState(faq.answer);
  const [ord, setOrd] = useState(faq.sortOrder);
  const [dirty, setDirty] = useState(false);

  const onChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setter(e.target.value);
    setDirty(true);
  };

  const save = () => {
    onUpdate(faq.id, {
      question: q,
      answer: a,
      sortOrder: typeof ord === 'number' ? ord : Number(ord)
    });
    setDirty(false);
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-mono text-gray-400">#{faq.sortOrder}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={!dirty}
            className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white disabled:bg-gray-300"
          >
            {dirty ? '保存' : '已保存'}
          </button>
          <button
            type="button"
            onClick={() => onDelete(faq.id)}
            className="rounded border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
          >
            删除
          </button>
        </div>
      </div>
      <input
        type="text"
        value={q}
        onChange={onChange(setQ)}
        className="mb-2 w-full rounded border border-gray-300 px-3 py-2 text-sm"
      />
      <textarea
        value={a}
        onChange={onChange(setA)}
        rows={2}
        className="mb-2 w-full rounded border border-gray-300 px-3 py-2 text-sm"
      />
      <div className="flex items-center gap-2 text-xs">
        <label className="text-gray-500">排序</label>
        <input
          type="number"
          value={ord}
          onChange={(e) => {
            setOrd(Number(e.target.value));
            setDirty(true);
          }}
          className="w-20 rounded border border-gray-300 px-2 py-1 text-xs"
        />
      </div>
    </div>
  );
}
