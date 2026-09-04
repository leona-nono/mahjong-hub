import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getGames, getLocalizedGames } from '@/data/games';
import GameCard from '@/components/GameCard';
import HomeCategoryCards from '@/components/HomeCategoryCards';
import { hubPageMeta } from '@/lib/hub-seo';

export const dynamic = 'force-static';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  const th = await getTranslations({ locale, namespace: 'home' });
  return hubPageMeta({
    locale,
    path: '/games',
    titleKey: 'gamesTitle',
    pageLabel: t('gameHall'),
    description: th('seoBody')
  });
}

/** Game Hall — aggregation catalog (SEO path). Full play lives on category/game pages. */
export default async function GamesHallPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('nav');
  const th = await getTranslations('home');
  const all = getLocalizedGames(getGames(), locale);
  const wall = all.filter((g) => g.gameType === 'iframe');

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="font-display text-3xl font-semibold text-portal-text">
          {t('gameHall')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-portal-muted">{th('seoBody')}</p>
      </header>

      <HomeCategoryCards />

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold text-portal-text">
          {th('featuredHall')}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {wall.map((g) => (
            <GameCard key={g.slug} game={g} size="sm" />
          ))}
        </div>
      </section>
    </div>
  );
}
