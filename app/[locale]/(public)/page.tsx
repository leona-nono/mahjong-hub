import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  getMergedGames,
  getMergedLocalizedGames
} from '@/lib/games-db';
import GameCard from '@/components/GameCard';
import HomeDailyChallenge from '@/components/HomeDailyChallenge';
import HomeCategoryCards from '@/components/HomeCategoryCards';
import HomeSeoBlock from '@/components/HomeSeoBlock';
import { homeSeo } from '@/lib/home-seo';
import { homeJsonLd } from '@/lib/home-jsonld';
import { brandName, getSiteSettings } from '@/lib/site-settings';
import { alternatesFor, socialShareMeta } from '@/lib/seo';
import { utcDateString } from '@/lib/points-rules';
import { dailyLevelId } from '@/lib/mahjong-solitaire/progress-rules';

export const revalidate = 86_400;

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const site = await getSiteSettings();
  const home = await homeSeo(locale);
  return {
    title: { absolute: home.title },
    description: home.description,
    alternates: alternatesFor(locale, ''),
    ...socialShareMeta({
      title: home.title,
      description: home.description,
      locale,
      ogImage: site.ogImage,
      siteName: brandName(site)
    })
  };
}

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const site = await getSiteSettings();
  const home = await homeSeo(locale);
  const all = getMergedLocalizedGames(await getMergedGames(), locale);
  const wall = all.filter((g) => g.gameType === 'iframe');
  const todayLevel = dailyLevelId(utcDateString());

  const jsonLd = homeJsonLd({
    site,
    locale,
    description: home.description
  });

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HomeDailyChallenge dailyLevelId={todayLevel} />

      <HomeSeoBlock locale={locale} />

      <HomeCategoryCards />

      <section aria-labelledby="home-game-wall">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2
            id="home-game-wall"
            className="font-display text-xl font-semibold text-portal-text sm:text-2xl"
          >
            {t('featuredHall')}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {wall.map((g, i) => (
            <GameCard key={g.slug} game={g} size="sm" priority={i < 2} />
          ))}
        </div>
      </section>

    </div>
  );
}
