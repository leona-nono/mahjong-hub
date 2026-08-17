'use client';

import { useState } from 'react';
import { applySeoTemplate, clipSeo } from '@/lib/seo-templates';

export interface SettingsForm {
  siteTitle: string;
  siteDescription: string;
  defaultLocale: string;
  ogImage: string;
  titleTemplate: string;
  homeH1: string;
  homeSubtitle: string;
  gameTitleTemplate: string;
  gameDescriptionTemplate: string;
  facebook: string;
  x: string;
  instagram: string;
  tiktok: string;
  ga: string;
  gtm: string;
}

const DEFAULTS: SettingsForm = {
  siteTitle: 'Mahjong Hub · Free Mahjong Games',
  siteDescription:
    'Play free mahjong solitaire, connect and classic tile games online. Instant play in your browser — no download.',
  defaultLocale: 'en',
  ogImage: '/og-default.png',
  titleTemplate: '{page} | {brand}',
  homeH1: 'Play free mahjong games',
  homeSubtitle:
    'Solitaire, connect, and classic tile games — instant play, no download.',
  gameTitleTemplate: '{game} - Free Online | {brand}',
  gameDescriptionTemplate:
    'Play {game} free online at {brand}. Instant play in your browser — no download required. {summary}',
  facebook: '',
  x: '',
  instagram: '',
  tiktok: '',
  ga: 'G-61V8MK15S6',
  gtm: ''
};

function brandFrom(title: string) {
  return title.split('·')[0].trim() || title;
}

export default function SettingsForm({
  initial
}: {
  initial?: Partial<SettingsForm>;
}) {
  const [form, setForm] = useState<SettingsForm>(() => ({
    ...DEFAULTS,
    ...(initial ?? {})
  }));
  const [status, setStatus] = useState<{
    kind: 'idle' | 'saving' | 'saved' | 'error';
    msg?: string;
  }>({ kind: 'idle' });

  const onChange =
    (k: keyof SettingsForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
    };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ kind: 'saving' });
    try {
      const payload = {
        site: {
          siteTitle: form.siteTitle,
          siteDescription: form.siteDescription,
          defaultLocale: form.defaultLocale,
          ogImage: form.ogImage
        },
        seo: {
          titleTemplate: form.titleTemplate,
          homeH1: form.homeH1,
          homeSubtitle: form.homeSubtitle,
          gameTitleTemplate: form.gameTitleTemplate,
          gameDescriptionTemplate: form.gameDescriptionTemplate
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
      const keys = ['site', 'seo', 'social', 'analytics'] as const;
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

  const brand = brandFrom(form.siteTitle);
  const homeTitlePreview = clipSeo(form.siteTitle, 70);
  const homeDescPreview = clipSeo(form.siteDescription, 160);
  const gameTitlePreview = clipSeo(
    applySeoTemplate(form.gameTitleTemplate, {
      game: 'Hong Kong Mahjong',
      brand,
      siteTitle: form.siteTitle
    }),
    70
  );
  const gameDescPreview = clipSeo(
    applySeoTemplate(form.gameDescriptionTemplate, {
      game: 'Hong Kong Mahjong',
      brand,
      siteTitle: form.siteTitle,
      summary: 'Play real four-player mahjong against three opponents.'
    }),
    160
  );
  const innerTitlePreview = clipSeo(
    applySeoTemplate(form.titleTemplate, {
      page: 'Mahjong Solitaire',
      brand,
      siteTitle: form.siteTitle
    }),
    70
  );

  return (
    <form onSubmit={save} className="grid gap-6 sm:grid-cols-2">
      <Card
        title="🔍 站点 SEO"
        desc="首页 <title> 与 Meta Description。建议 Title 50–60 字，Description 120–160 字。"
      >
        <Field
          label="站点 Title"
          value={form.siteTitle}
          onChange={onChange('siteTitle')}
          hint={`${form.siteTitle.trim().length} 字符 · 预览：${homeTitlePreview}`}
        />
        <Field
          label="Meta Description"
          value={form.siteDescription}
          onChange={onChange('siteDescription')}
          multiline
          hint={`${form.siteDescription.trim().length} 字符 · 预览：${homeDescPreview}`}
        />
        <Field label="默认语言" value={form.defaultLocale} onChange={onChange('defaultLocale')} />
        <Field label="OG 图片路径" value={form.ogImage} onChange={onChange('ogImage')} />
      </Card>

      <Card
        title="🌐 多语言 Title 模板"
        desc="所有语言共用同一模板。占位符：{page} 页面名，{brand} 品牌名。"
      >
        <Field
          label="内页 Title 模板"
          value={form.titleTemplate}
          onChange={onChange('titleTemplate')}
          placeholder="{page} | {brand}"
          hint={`预览：${innerTitlePreview}`}
        />
        <p className="text-xs text-gray-400">
          英文、简体、繁体、日文、韩文都套这套模板，避免每种语言各写一套后缀。
        </p>
      </Card>

      <Card
        title="🏠 首页 H1 与副标题"
        desc="只改首页可见文案，不影响游戏页。留空则回退到默认文案。"
      >
        <Field
          label="首页 H1"
          value={form.homeH1}
          onChange={onChange('homeH1')}
          hint={`${form.homeH1.trim().length} 字符`}
        />
        <Field
          label="首页副标题"
          value={form.homeSubtitle}
          onChange={onChange('homeSubtitle')}
          multiline
          hint={`${form.homeSubtitle.trim().length} 字符`}
        />
      </Card>

      <Card
        title="🎮 游戏独立页 SEO"
        desc="每款游戏用自己的名称套入统一格式。占位符：{game} {brand} {summary}。"
      >
        <Field
          label="游戏 Title 格式"
          value={form.gameTitleTemplate}
          onChange={onChange('gameTitleTemplate')}
          placeholder="{game} - Free Online | {brand}"
          hint={`预览：${gameTitlePreview}`}
        />
        <Field
          label="游戏 Description 格式"
          value={form.gameDescriptionTemplate}
          onChange={onChange('gameDescriptionTemplate')}
          multiline
          placeholder="Play {game} free online at {brand}. {summary}"
          hint={`预览：${gameDescPreview}`}
        />
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

function Card({
  title,
  desc,
  children
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
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
  multiline,
  hint
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  multiline?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-0.5 block text-xs font-medium text-gray-500">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
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
      {hint ? <p className="mt-1 text-[11px] leading-snug text-gray-400">{hint}</p> : null}
    </div>
  );
}
