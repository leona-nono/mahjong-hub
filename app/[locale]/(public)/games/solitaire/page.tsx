import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getMergedGamesByNavGroup, getMergedLocalizedGames } from '@/lib/games-db';
import GameCard from '@/components/GameCard';
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
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="font-display text-2xl font-semibold text-portal-text sm:text-3xl">
        {t('solitaire')}
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-portal-muted">{t('solitaireSubtitle')}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {games.map((g) => (
          <GameCard key={g.slug} game={g} />
        ))}
      </div>
    </div>
  );
}
