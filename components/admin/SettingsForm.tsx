'use client';

import { useState } from 'react';

export interface SettingsForm {
  siteTitle: string;
  siteDescription: string;
  defaultLocale: string;
  ogImage: string;
  facebook: string;
  x: string;
  instagram: string;
  tiktok: string;
  ga: string;
  gtm: string;
}

const DEFAULTS: SettingsForm = {
  siteTitle: 'Mahjong Hub · Rainbow Mahjong Games',
  siteDescription: 'A rainbow-themed collection of relaxing mahjong games.',
  defaultLocale: 'en',
  ogImage: '/og-default.png',
  facebook: '',
  x: '',
  instagram: '',
  tiktok: '',
  ga: '',
  gtm: ''
};

export default function SettingsForm({
  initial
}: {
  initial?: Partial<SettingsForm>;
}) {
  const [form, setForm] = useState<SettingsForm>(() => ({
    ...DEFAULTS,
    ...(initial ?? {})
  }));
  const [status, setStatus] = useState<{ kind: 'idle' | 'saving' | 'saved' | 'error'; msg?: string }>({
    kind: 'idle'
  });

  const onChange = (k: keyof SettingsForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ kind: 'saving' });
    try {
      const payload = {
        // NOTE: `site` fields MUST read from the live form, never from the
        // DEFAULTS constant — otherwise user edits are overwritten on save.
        site: {
          siteTitle: form.siteTitle,
          siteDescription: form.siteDescription,
          defaultLocale: form.defaultLocale,
          ogImage: form.ogImage
        },
        social: {
          facebook: form.facebook,
          x: form.x,
          instagram: form.instagram,
          tiktok: form.tiktok
        },
        analytics: {
          ga: form.ga,
          gtm: form.gtm
        }
      };
      // Save 3 keys in parallel
      const keys = ['site', 'social', 'analytics'] as const;
      const results = await Promise.all(
        keys.map((k) =>
          fetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: k, value: payload[k] })
          })
        )
      );
      const failed = results.find((res) => !res.ok);
      if (failed) {
        const body = await failed.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${failed.status}`);
      }
      setStatus({ kind: 'saved', msg: '已保存' });
    } catch (err) {
      setStatus({ kind: 'error', msg: (err as Error).message });
    }
  };

  return (
    <form onSubmit={save} className="grid gap-6 sm:grid-cols-2">
      <Card title="🔍 SEO 元数据" desc="站点标题、描述、默认 OG 图片">
        <Field label="站点标题" value={form.siteTitle} onChange={onChange('siteTitle')} />
        <Field label="站点描述" value={form.siteDescription} onChange={onChange('siteDescription')} multiline />
        <Field label="默认语言" value={form.defaultLocale} onChange={onChange('defaultLocale')} />
        <Field label="OG 图片路径" value={form.ogImage} onChange={onChange('ogImage')} />
      </Card>

      <Card title="🔗 社交链接" desc="Facebook / X / Instagram / TikTok">
        <Field label="Facebook" value={form.facebook} onChange={onChange('facebook')} placeholder="https://" />
        <Field label="X (Twitter)" value={form.x} onChange={onChange('x')} placeholder="https://" />
        <Field label="Instagram" value={form.instagram} onChange={onChange('instagram')} placeholder="https://" />
        <Field label="TikTok" value={form.tiktok} onChange={onChange('tiktok')} placeholder="https://" />
      </Card>

      <Card title="📊 分析追踪" desc="Google Analytics / GTM">
        <Field label="Google Analytics ID" value={form.ga} onChange={onChange('ga')} placeholder="G-XXXX" />
        <Field label="GTM Container ID" value={form.gtm} onChange={onChange('gtm')} placeholder="GTM-XXXX" />
      </Card>

      <div className="sm:col-span-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={status.kind === 'saving'}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-300"
        >
          {status.kind === 'saving' ? '保存中…' : '保存设置'}
        </button>
        {status.kind === 'saved' && <span className="text-sm text-green-600">✅ {status.msg}</span>}
        {status.kind === 'error' && <span className="text-sm text-red-600">❌ {status.msg}</span>}
      </div>
    </form>
  );
}

function Card({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-gray-800">{title}</h3>
      <p className="mb-4 mt-1 text-xs text-gray-400">{desc}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="mb-0.5 block text-xs font-medium text-gray-500">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={2}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      )}
    </div>
  );
}
