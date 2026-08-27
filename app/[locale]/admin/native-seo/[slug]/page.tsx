import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { getGame, getLocalizedGame } from '@/data/games';
import NativeSeoEditorForm from '@/components/admin/NativeSeoEditorForm';
import {
  emptyNativeSeoPayload,
  getNativeLocaleCoverage,
  getNativeSeoRow,
  rowToPayload,
  type NativeSeoPayload
} from '@/lib/native-seo';
import {
  resolveAdminContentLocale,
  type NativeSeoLocale
} from '@/lib/native-seo-locales';
import { isDbConnected } from '@/lib/db-health';

export const dynamic = 'force-dynamic';

function baselineForLocale(
  slug: string,
  locale: NativeSeoLocale
): NativeSeoPayload {
  const localized = getLocalizedGame(slug, locale) ?? getGame(slug);
  if (!localized) return emptyNativeSeoPayload();
  return {
    title: localized.title,
    description: localized.description,
    seoTitle: '',
    seoDescription: '',
    intro: localized.content?.intro ?? '',
    howToPlay: localized.content?.howToPlay ?? [],
    tips: localized.content?.tips ?? [],
    faq: localized.content?.faq ?? []
  };
}

export default async function AdminNativeSeoEditPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const game = getGame(slug);
  if (!game || game.gameType !== 'native') notFound();

  const locale = resolveAdminContentLocale(lang);
  const dbConnected = await isDbConnected();
  const row = await getNativeSeoRow(slug, locale);
  const baseline = baselineForLocale(slug, locale);
  const cms = row ? rowToPayload(row) : emptyNativeSeoPayload();

  // Prefer CMS values; empty fields stay empty so editor sees what's stored,
  // but placeholders show baseline via the form.
  const initial: NativeSeoPayload = {
    title: cms.title || baseline.title,
    description: cms.description || baseline.description,
    seoTitle: cms.seoTitle,
    seoDescription: cms.seoDescription,
    intro: cms.intro || baseline.intro,
    howToPlay: cms.howToPlay.length ? cms.howToPlay : baseline.howToPlay,
    tips: cms.tips.length ? cms.tips : baseline.tips,
    faq: cms.faq.length ? cms.faq : baseline.faq
  };

  const coverage = await getNativeLocaleCoverage(
    slug,
    Boolean(game.content?.intro)
  );

  return (
    <div>
      <Link
        href="/admin/native-seo"
        className="mb-2 inline-block text-sm text-blue-600 hover:text-blue-800"
      >
        ← 返回自研 SEO 列表
      </Link>
      <h1 className="mb-1 text-2xl font-bold text-gray-800">
        自研页面 SEO: {game.title}
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Slug: <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">{slug}</code>
        {' · '}
        切换「内容语言」可快速检查各语种缺口
      </p>

      {!dbConnected && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          ⚠️ 数据库未连接，保存会失败。请配置 DATABASE_URL 并执行 NativeGameSeo 迁移。
        </div>
      )}

      <NativeSeoEditorForm
        key={locale}
        slug={slug}
        locale={locale}
        initial={initial}
        baseline={baseline}
        coverage={coverage}
      />
    </div>
  );
}
