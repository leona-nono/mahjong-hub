'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { NativeSeoPayload } from '@/lib/native-seo';
import {
  NATIVE_SEO_LOCALES,
  NATIVE_SEO_LOCALE_LABELS,
  type NativeSeoLocale
} from '@/lib/native-seo-locales';
import AdminContentLocaleSwitcher from '@/components/admin/AdminContentLocaleSwitcher';

type FaqDraft = { question: string; answer: string };

interface Props {
  slug: string;
  locale: NativeSeoLocale;
  initial: NativeSeoPayload;
  /** Static baseline shown as reference (read-only hint). */
  baseline: NativeSeoPayload;
  coverage: Record<NativeSeoLocale, 'ok' | 'partial' | 'missing'>;
}

function linesToList(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function listToLines(list: string[]): string {
  return list.join('\n');
}

const COVERAGE_STYLE: Record<
  'ok' | 'partial' | 'missing',
  string
> = {
  ok: 'bg-green-50 text-green-700',
  partial: 'bg-amber-50 text-amber-700',
  missing: 'bg-red-50 text-red-700'
};

const COVERAGE_LABEL: Record<'ok' | 'partial' | 'missing', string> = {
  ok: '齐全',
  partial: '部分',
  missing: '缺失'
};

export default function NativeSeoEditorForm({
  slug,
  locale,
  initial,
  baseline,
  coverage
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [form, setForm] = useState<NativeSeoPayload>(initial);
  const [howToRaw, setHowToRaw] = useState(listToLines(initial.howToPlay));
  const [tipsRaw, setTipsRaw] = useState(listToLines(initial.tips));
  const [faqs, setFaqs] = useState<FaqDraft[]>(
    initial.faq.length ? initial.faq : [{ question: '', answer: '' }]
  );
  const [status, setStatus] = useState<{
    kind: 'idle' | 'saving' | 'saved' | 'error';
    msg?: string;
  }>({ kind: 'idle' });

  const missingLocales = useMemo(
    () => NATIVE_SEO_LOCALES.filter((l) => coverage[l] === 'missing'),
    [coverage]
  );

  const save = async () => {
    setStatus({ kind: 'saving' });
    const payload: NativeSeoPayload = {
      ...form,
      howToPlay: linesToList(howToRaw),
      tips: linesToList(tipsRaw),
      faq: faqs
        .map((f) => ({
          question: f.question.trim(),
          answer: f.answer.trim()
        }))
        .filter((f) => f.question && f.answer)
    };
    try {
      const res = await fetch(
        `/api/admin/native-seo/${encodeURIComponent(slug)}?lang=${locale}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setStatus({ kind: 'saved', msg: '已保存' });
      startTransition(() => router.refresh());
    } catch (err) {
      setStatus({ kind: 'error', msg: (err as Error).message });
    }
  };

  const fillFromBaseline = () => {
    if (!window.confirm('用当前语言的静态底稿覆盖表单？（未保存）')) return;
    setForm(baseline);
    setHowToRaw(listToLines(baseline.howToPlay));
    setTipsRaw(listToLines(baseline.tips));
    setFaqs(
      baseline.faq.length ? baseline.faq : [{ question: '', answer: '' }]
    );
    setStatus({ kind: 'idle' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <AdminContentLocaleSwitcher current={locale} />
        <div className="flex flex-wrap gap-1.5">
          {NATIVE_SEO_LOCALES.map((l) => (
            <span
              key={l}
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${COVERAGE_STYLE[coverage[l]]}`}
              title={NATIVE_SEO_LOCALE_LABELS[l]}
            >
              {l}: {COVERAGE_LABEL[coverage[l]]}
            </span>
          ))}
        </div>
      </div>

      {missingLocales.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          多语缺失：{missingLocales.map((l) => NATIVE_SEO_LOCALE_LABELS[l]).join('、')}
          。切换上方语言可逐一补齐。
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-gray-800">
            编辑 · {NATIVE_SEO_LOCALE_LABELS[locale]}
          </h2>
          <button
            type="button"
            onClick={fillFromBaseline}
            className="text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            填入静态底稿
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">显示标题</span>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={baseline.title || '页面 H1 / 卡片标题'}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">
              SEO Title（可选）
            </span>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              value={form.seoTitle}
              onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
              placeholder="留空则用站点模板 + 显示标题"
            />
          </label>
        </div>

        <label className="mt-4 block text-sm">
          <span className="mb-1 block font-medium text-gray-700">短描述</span>
          <textarea
            className="min-h-[72px] w-full rounded-lg border border-gray-300 px-3 py-2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder={baseline.description || ''}
          />
        </label>

        <label className="mt-4 block text-sm">
          <span className="mb-1 block font-medium text-gray-700">
            SEO Description（可选）
          </span>
          <textarea
            className="min-h-[72px] w-full rounded-lg border border-gray-300 px-3 py-2"
            value={form.seoDescription}
            onChange={(e) =>
              setForm({ ...form, seoDescription: e.target.value })
            }
            placeholder="留空则用站点模板 + 短描述"
          />
        </label>

        <label className="mt-4 block text-sm">
          <span className="mb-1 block font-medium text-gray-700">页面简介 Intro</span>
          <textarea
            className="min-h-[100px] w-full rounded-lg border border-gray-300 px-3 py-2"
            value={form.intro}
            onChange={(e) => setForm({ ...form, intro: e.target.value })}
            placeholder={baseline.intro || ''}
          />
        </label>

        <label className="mt-4 block text-sm">
          <span className="mb-1 block font-medium text-gray-700">
            玩法步骤 How to play（每行一条）
          </span>
          <textarea
            className="min-h-[120px] w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs"
            value={howToRaw}
            onChange={(e) => setHowToRaw(e.target.value)}
          />
        </label>

        <label className="mt-4 block text-sm">
          <span className="mb-1 block font-medium text-gray-700">
            技巧 Tips（每行一条）
          </span>
          <textarea
            className="min-h-[100px] w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs"
            value={tipsRaw}
            onChange={(e) => setTipsRaw(e.target.value)}
          />
        </label>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">FAQ</span>
            <button
              type="button"
              className="text-xs text-blue-600"
              onClick={() =>
                setFaqs((prev) => [...prev, { question: '', answer: '' }])
              }
            >
              ＋ 添加
            </button>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3"
              >
                <input
                  className="mb-2 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  placeholder="问题"
                  value={faq.question}
                  onChange={(e) => {
                    const next = [...faqs];
                    next[idx] = { ...faq, question: e.target.value };
                    setFaqs(next);
                  }}
                />
                <textarea
                  className="min-h-[64px] w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  placeholder="回答"
                  value={faq.answer}
                  onChange={(e) => {
                    const next = [...faqs];
                    next[idx] = { ...faq, answer: e.target.value };
                    setFaqs(next);
                  }}
                />
                <button
                  type="button"
                  className="mt-1 text-xs text-red-600"
                  onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={status.kind === 'saving'}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {status.kind === 'saving' ? '保存中…' : '保存此语言'}
          </button>
          {status.kind === 'saved' && (
            <span className="text-sm text-green-600">{status.msg}</span>
          )}
          {status.kind === 'error' && (
            <span className="text-sm text-red-600">{status.msg}</span>
          )}
        </div>
      </div>
    </div>
  );
}
