import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  getMergedFeaturedGames,
  getMergedGames,
  getMergedLocalizedGames,
  getMergedNativeGames
} from '@/lib/games-db';
import GameCard from '@/components/GameCard';
import FeaturedGroup from '@/components/FeaturedGroup';
import GameCategoryRow from '@/components/GameCategoryRow';
import DailyChallengeCard from '@/components/DailyChallengeCard';
import DailyCheckIn from '@/components/DailyCheckIn';
import type { GameCategory, GameConfig } from '@/data/games';
import { homeSeo } from '@/lib/home-seo';
import { homeJsonLd } from '@/lib/home-jsonld';
import { brandName, getSiteSettings } from '@/lib/site-settings';
import { alternatesFor, socialShareMeta } from '@/lib/seo';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';

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

function byCategory(games: GameConfig[], category: GameCategory) {
  return games.filter((g) => g.category === category);
}

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const tp = await getTranslations('portal');
  const site = await getSiteSettings();
  const home = await homeSeo(locale);
  const featured = getMergedLocalizedGames(await getMergedFeaturedGames(), locale);
  const native = getMergedLocalizedGames(await getMergedNativeGames(), locale);
  const all = getMergedLocalizedGames(await getMergedGames(), locale);

  // English CMS may override H1; other locales always use translated heroTitle.
  const heroTitle =
    locale === 'en' ? site.homeH1 || t('heroTitle') : t('heroTitle');
  const heroSubtitle =
    locale === 'en' ? site.homeSubtitle || t('heroSubtitle') : t('heroSubtitle');

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale,
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Mahjong Hub?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mahjong Hub is a free online collection of mahjong games, including mahjong solitaire, connect puzzles and tile-matching modes. Play instantly in your browser with no download required.'
        }
      },
      {
        '@type': 'Question',
        name: 'Do I need to sign up or log in?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Every game is free to play without an account. You only sign in if you want to save progress, earn daily check-in points, or sync your play across devices.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is Mahjong Hub really free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. All games are completely free with no paywalls, and gameplay is never blocked by forced advertisements.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I play on my phone?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Mahjong Hub works on phones, tablets and desktop browsers — no app to install.'
        }
      },
      {
        '@type': 'Question',
        name: 'How do you play mahjong solitaire?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Match two free tiles that share the same symbol to remove them. A tile is free when nothing is on top of it and at least one side is open. Clear the entire board to win.'
        }
      },
      {
        '@type': 'Question',
        name: 'Which mahjong game types are available?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We offer mahjong solitaire layouts, connect/match puzzles and classic tile-matching modes, with new game types added over time.'
        }
      }
    ]
  };

  const jsonLd = homeJsonLd({
    site,
    locale,
    description: home.description,
    faq: locale === 'en' ? faqPage : undefined
  });

  const featuredPack = [...native, ...featured]
    .filter((g, i, arr) => arr.findIndex((x) => x.slug === g.slug) === i)
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-portal-text sm:text-3xl">
            {heroTitle}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-portal-muted">{heroSubtitle}</p>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
        <DailyChallengeCard />
        <DailyCheckIn compact />
      </div>

      <FeaturedGroup title={t('featuredTitle')} href="/games" games={featuredPack} />

      <section className="rounded-2xl border border-portal-border bg-portal-panel/70 p-5 shadow-portal sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-portal-accent">{tp('connect')}</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-portal-text">{t('seasonalTitle')}</h2>
          <p className="mt-1 max-w-2xl text-sm text-portal-muted">{t('seasonalBody')}</p>
        </div>
        <Link href="/wardrobe" className="mt-4 inline-flex shrink-0 rounded-xl bg-portal-accent px-4 py-2.5 text-sm font-bold text-slate-950 hover:brightness-110 sm:mt-0">{t('openWardrobe')}</Link>
      </section>

      <GameCategoryRow
        title={tp('solitaire')}
        href="/games/solitaire"
        games={byCategory(all, 'solitaire').slice(0, 12)}
      />
      <GameCategoryRow
        title={tp('classic')}
        href="/games/classic"
        games={byCategory(all, 'four-player').slice(0, 12)}
      />
      <GameCategoryRow
        title={tp('connect')}
        href="/games"
        games={byCategory(all, 'connect').slice(0, 12)}
      />
      <GameCategoryRow
        title={tp('tileMatch')}
        href="/games"
        games={byCategory(all, 'tile-match').slice(0, 12)}
      />

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-portal-text sm:text-xl">
          {t('collectionTitle')}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {all.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      </section>

      <details className="rounded-xl border border-portal-border bg-portal-panel/60 p-4 text-sm text-portal-muted">
        <summary className="cursor-pointer font-semibold text-portal-text">
          FAQ
        </summary>
        <p className="mt-2">{t('heroSubtitle')}</p>
      </details>
    </div>
  );
}
