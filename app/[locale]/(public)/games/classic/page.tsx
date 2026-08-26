import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  getMergedGamesByNavGroup,
  getMergedLocalizedGames
} from '@/lib/games-db';
import CatalogGameCard from '@/components/CatalogGameCard';
import { pageMeta } from '@/lib/seo';
import { brandName, getSiteSettings } from '@/lib/site-settings';

export const revalidate = 86_400;

const CLASSIC_ORDER = [
  'hong-kong-mahjong',
  'riichi-mahjong',
  'chinese-official-mahjong',
  'sichuan-mahjong',
  'taiwan-mahjong',
  'american-mahjong'
] as const;

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  const site = await getSiteSettings();
  const title = `${t('classic')} | ${brandName(site)}`;
  return pageMeta({
    locale,
    path: '/games/classic',
    title,
    description: t('classicSubtitle'),
    ogImage: site.ogImage,
    siteName: brandName(site)
  });
}

export default async function ClassicCatalogPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('nav');
  const list = getMergedLocalizedGames(
    await getMergedGamesByNavGroup('classic'),
    locale
  );
  const order = new Map<string, number>(CLASSIC_ORDER.map((slug, i) => [slug, i]));
  const games = [...list].sort(
    (a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99)
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-portal-text">
          {t('classic')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-portal-muted">{t('classicSubtitle')}</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((g) => (
          <CatalogGameCard key={g.slug} game={g} kind="classic" />
        ))}
      </div>
    </div>
  );
}
