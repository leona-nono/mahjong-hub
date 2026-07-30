'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export interface I18nRow {
  id: string;
  key: string;
  locale: string;
  value: string;
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
  initial: I18nRow[];
}

export default function I18nEditor({ initial }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [rows, setRows] = useState<I18nRow[]>(initial);
  const [locale, setLocale] = useState<string>(
    initial.find((r) => r.locale === 'en') ? 'en' : initial[0]?.locale ?? 'en'
  );
  const [query, setQuery] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [status, setStatus] = useState<{
    kind: 'idle' | 'saving' | 'error';
    msg?: string;
  }>({ kind: 'idle' });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => r.locale === locale)
      .filter((r) => !q || r.key.toLowerCase().includes(q))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [rows, locale, query]);

  const create = async () => {
    const k = newKey.trim();
    if (!k) {
      setStatus({ kind: 'error', msg: 'key 不能为空' });
      return;
    }
    setStatus({ kind: 'saving' });
    try {
      const res = await fetch('/api/admin/i18n', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: k, locale, value: newValue })
      });
      if (!res.ok) {
        throw new Error((await res.json()).error || `HTTP ${res.status}`);
      }
      const { message } = await res.json();
      // Replace if (key, locale) already existed, else append.
      setRows((cur) => {
        const i = cur.findIndex((r) => r.key === k && r.locale === locale);
        if (i >= 0) {
          const copy = cur.slice();
          copy[i] = message;
          return copy;
        }
        return [...cur, message];
      });
      setNewKey('');
      setNewValue('');
      setStatus({ kind: 'idle' });
      startTransition(() => router.refresh());
    } catch (err) {
      setStatus({ kind: 'error', msg: (err as Error).message });
    }
  };

  const update = async (id: string, patch: Partial<I18nRow>) => {
    setStatus({ kind: 'saving' });
    try {
      const res = await fetch('/api/admin/i18n', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      if (!res.ok) {
        throw new Error((await res.json()).error || `HTTP ${res.status}`);
      }
      const { message } = await res.json();
      setRows((cur) => cur.map((r) => (r.id === id ? message : r)));
      setStatus({ kind: 'idle' });
    } catch (err) {
      setStatus({ kind: 'error', msg: (err as Error).message });
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Locale tabs */}
      <div className="flex flex-wrap gap-1 border-b bg-gray-50 px-4 pt-3">
        {LOCALES.map((l) => {
          const count = rows.filter((r) => r.locale === l.code).length;
          const active = locale === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLocale(l.code);
                setStatus({ kind: 'idle' });
              }}
              className={`rounded-t-lg px-3 py-2 text-xs font-medium transition ${
                active
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:bg-white hover:text-gray-800'
              }`}
            >
              {l.label}
              <span className="ml-1 text-gray-400">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="p-6">
        {/* Toolbar: search + count */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <input
            type="text"
            placeholder="按 key 过滤…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <span className="text-xs text-gray-400">
            {filtered.length} 条 / {locale}
          </span>
        </div>

        {/* Add new */}
        <div className="mb-6 rounded-lg border-2 border-dashed border-gray-200 p-4">
          <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
            ➕ 新增 {locale} 翻译
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="text"
              placeholder="key（如 navbar.home）"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 font-mono text-sm"
            />
            <input
              type="text"
              placeholder="value（翻译文本）"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={create}
            disabled={status.kind === 'saving' || !newKey.trim()}
            className="mt-2 rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:bg-gray-300"
          >
            添加 / 更新
          </button>
        </div>

        {/* Existing rows */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 italic">
              该语言暂无翻译{query ? '（或被过滤）' : ''}
            </p>
          )}
          {filtered.map((row) => (
            <I18nRowEditor
              key={row.id}
              row={row}
              onUpdate={update}
              disabled={status.kind === 'saving'}
            />
          ))}
        </div>

        {status.kind === 'error' && (
          <p className="mt-4 text-sm text-red-600">❌ {status.msg}</p>
        )}

        <p className="mt-6 text-xs text-gray-400">
          💡 key 用点号命名空间（如 <code className="rounded bg-gray-100 px-1">navbar.home</code>），与
          <code className="rounded bg-gray-100 px-1"> messages/&lt;lang&gt;.json </code>
          对应。改完即时落库，前台语言切换生效需重新构建/部署 messages 文件（见 PRD）。
        </p>
      </div>
    </div>
  );
}

function I18nRowEditor({
  row,
  onUpdate,
  disabled
}: {
  row: I18nRow;
  onUpdate: (id: string, patch: Partial<I18nRow>) => Promise<void>;
  disabled?: boolean;
}) {
  const [v, setV] = useState(row.value);
  const [dirty, setDirty] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <code className="text-xs font-mono text-gray-500">{row.key}</code>
        <button
          type="button"
          onClick={() => onUpdate(row.id, { value: v })}
          disabled={!dirty || disabled}
          className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white disabled:bg-gray-300"
        >
          {dirty ? '保存' : '已保存'}
        </button>
      </div>
      <input
        type="text"
        value={v}
        onChange={(e) => {
          setV(e.target.value);
          setDirty(true);
        }}
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
      />
    </div>
  );
}
