import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getMergedGamesByNavGroup, getMergedLocalizedGames } from '@/lib/games-db';
import CatalogGameCard from '@/components/CatalogGameCard';
import { pageMeta } from '@/lib/seo';
import { brandName, getSiteSettings } from '@/lib/site-settings';

export const revalidate = 86_400;

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  const site = await getSiteSettings();
  return pageMeta({
    locale,
    path: '/games/solitaire',
    title: t('solitaire'),
    description: t('solitaireSubtitle'),
    ogImage: site.ogImage,
    siteName: brandName(site)
  });
}

export default async function SolitaireGamesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('nav');
  const games = getMergedLocalizedGames(
    await getMergedGamesByNavGroup('solitaire'),
    locale
  );

  return (
    <div className="catalog-page catalog-page--solitaire mx-auto max-w-[1400px] px-5 py-8 sm:px-10 sm:py-10">
      <h1 className="catalog-page__title">{t('solitaire')}</h1>
      <p className="catalog-page__subtitle">{t('solitaireSubtitle')}</p>

      <div className="catalog-page__grid catalog-page__grid--solitaire">
        {games.map((g) => (
          <CatalogGameCard key={g.slug} game={g} kind="solitaire" />
        ))}
      </div>
    </div>
  );
}
