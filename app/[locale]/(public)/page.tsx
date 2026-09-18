import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  getGames,
  getLocalizedGames
} from '@/data/games';
import GameCard from '@/components/GameCard';
import HomeDailyHand from '@/components/HomeDailyHand';
import HomeFaq, { homeFaqJsonLd } from '@/components/HomeFaq';
import HomeLearnCards from '@/components/HomeLearnCards';
import HomeSeoBlock from '@/components/HomeSeoBlock';
import { homeSeo } from '@/lib/home-seo';
import { homeJsonLd } from '@/lib/home-jsonld';
import { brandName, getPublicSiteSettings } from '@/lib/site-settings';
import { alternatesFor, socialShareMeta } from '@/lib/seo';

/** Pure SSG — no Prisma / ISR. Redeploy to refresh copy. */
export const dynamic = 'force-static';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const site = getPublicSiteSettings();
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
  const site = getPublicSiteSettings();
  const home = await homeSeo(locale);
  const all = getLocalizedGames(getGames(), locale);
  const wall = all.filter((g) => g.gameType === 'native').slice(0, 6);
  const faq = await homeFaqJsonLd();

  const jsonLd = homeJsonLd({
    site,
    locale,
    description: home.description,
    faq
  });

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* SITE_RULES R1: first block = Hong Kong practice table (instant play).
          R2: sole <h1> = site-positioning keywords; DailyHand titles stay <h2>. */}
      <section aria-labelledby="home-hero-title" className="space-y-4">
        <div>
          <h1
            id="home-hero-title"
            className="font-display text-3xl font-semibold tracking-tight text-portal-text sm:text-4xl"
          >
            {t('heroTitle')}
          </h1>
          <p className="mt-2 text-sm font-medium text-portal-accent sm:text-base">{t('brandLine')}</p>
          <p className="mt-1 text-sm text-portal-muted">{t('instantPlay')}</p>
        </div>
        <HomeDailyHand />
      </section>

      <HomeSeoBlock locale={locale} />

      <HomeLearnCards locale={locale} />
      <HomeFaq />

      <section aria-labelledby="home-game-wall">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2
            id="home-game-wall"
            className="font-display text-xl font-semibold text-portal-text sm:text-2xl"
          >
            {t('featuredHall')}
          </h2>
        </div>
        {wall.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {wall.map((g, i) => (
              <GameCard key={g.slug} game={g} locale={locale} size="sm" priority={i < 2} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
