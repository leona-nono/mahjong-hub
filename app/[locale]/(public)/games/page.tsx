import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { getMergedGames, getMergedLocalizedGames } from '@/lib/games-db';
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
  const t = await getTranslations({ locale, namespace: 'collection' });
  const site = await getSiteSettings();
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: alternatesFor(locale, '/games'),
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      images: site.ogImage ? [site.ogImage] : undefined
    }
  };
}

export default async function GamesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('collection');
  const games = getMergedLocalizedGames(await getMergedGames(), locale);

  return (
    <div className="catalog-page catalog-page--solitaire mx-auto max-w-[1400px] px-5 py-8 sm:px-10 sm:py-10">
      <h1 className="catalog-page__title">
        {t('title')}
      </h1>
      <p className="catalog-page__subtitle">{t('subtitle')}</p>

      <div className="catalog-page__grid catalog-page__grid--solitaire">
        {games.map((g) => (
          <CatalogGameCard
            key={g.slug}
            game={g}
            kind={g.navGroup === 'classic' ? 'classic' : 'solitaire'}
          />
        ))}
      </div>
    </div>
  );
}
