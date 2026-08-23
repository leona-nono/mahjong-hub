import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getMergedGamesByNavGroup, getMergedLocalizedGames } from '@/lib/games-db';
import CatalogGameCard from '@/components/CatalogGameCard';
import { alternatesFor } from '@/lib/seo';
import { getSiteSettings } from '@/lib/site-settings';

export const revalidate = 86_400;

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  const site = await getSiteSettings();
  return {
    title: t('classic'),
    description: t('classicSubtitle'),
    alternates: alternatesFor(locale, '/games/classic'),
    openGraph: {
      title: t('classic'),
      description: t('classicSubtitle'),
      images: site.ogImage ? [site.ogImage] : undefined
    }
  };
}

export default async function ClassicGamesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('nav');
  const priority = ['american-mahjong', 'riichi-mahjong', 'chinese-official-mahjong', 'hong-kong-mahjong', 'taiwan-mahjong', 'sichuan-mahjong'];
  const index = new Map(priority.map((slug, order) => [slug, order]));
  const games = getMergedLocalizedGames(await getMergedGamesByNavGroup('classic'), locale)
    .filter((game) => index.has(game.slug))
    .sort((a, b) => (index.get(a.slug) ?? 99) - (index.get(b.slug) ?? 99));

  return (
    <div className="catalog-page catalog-page--classic mx-auto max-w-[1400px] px-5 py-8 sm:px-10 sm:py-10">
      <h1 className="catalog-page__title">
        {t('classic')}
      </h1>
      <p className="catalog-page__subtitle">{t('classicSubtitle')}</p>
      <div className="catalog-page__grid catalog-page__grid--classic">
        {games.map((game) => (
          <CatalogGameCard key={game.slug} game={game} kind="classic" />
        ))}
      </div>
    </div>
  );
}
