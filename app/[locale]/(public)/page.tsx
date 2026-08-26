import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  getMergedGames,
  getMergedLocalizedGames
} from '@/lib/games-db';
import GameCard from '@/components/GameCard';
import FeaturedGroup from '@/components/FeaturedGroup';
import HomeHero from '@/components/HomeHero';
import type { GameConfig } from '@/data/games';
import { homeSeo } from '@/lib/home-seo';
import { homeJsonLd } from '@/lib/home-jsonld';
import { brandName, getSiteSettings } from '@/lib/site-settings';
import { alternatesFor, socialShareMeta } from '@/lib/seo';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';

export const revalidate = 86_400;

/** Live classic tables featured above the fold. */
const LIVE_CLASSIC_SLUGS = [
  'hong-kong-mahjong',
  'riichi-mahjong',
  'chinese-official-mahjong'
] as const;

/** Playable but not first-screen — keep off the primary Featured strip. */
const COMING_RULESET_SLUGS = [
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

function pickBySlug(games: GameConfig[], slugs: readonly string[]) {
  const index = new Map(slugs.map((slug, order) => [slug, order]));
  return games
    .filter((g) => index.has(g.slug))
    .sort((a, b) => (index.get(a.slug) ?? 99) - (index.get(b.slug) ?? 99));
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
  const liveClassic = pickBySlug(all, LIVE_CLASSIC_SLUGS);
  const comingRulesets = pickBySlug(all, COMING_RULESET_SLUGS);

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

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HomeHero />

      <FeaturedGroup title={t('featuredClassic')} href="/games/classic" games={liveClassic} />

      {comingRulesets.length > 0 && (
        <details className="rounded-2xl border border-dashed border-portal-border bg-portal-panel/40 p-4">
          <summary className="cursor-pointer font-display text-base font-semibold text-portal-muted">
            {t('moreRulesets')}
          </summary>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {comingRulesets.map((g) => (
              <GameCard key={g.slug} game={g} size="sm" />
            ))}
          </div>
        </details>
      )}

      <section className="rounded-2xl border border-portal-border bg-portal-panel/70 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <h2 className="font-display text-xl font-semibold text-portal-text">{t('seasonalTitle')}</h2>
          <p className="mt-1 max-w-2xl text-sm text-portal-muted">{t('seasonalBody')}</p>
        </div>
        <Link
          href="/wardrobe"
          className="mt-4 inline-flex shrink-0 rounded-xl bg-portal-accent px-4 py-2.5 text-sm font-bold text-slate-950 hover:brightness-110 sm:mt-0"
        >
          {t('openWardrobe')}
        </Link>
      </section>

      <details className="rounded-xl border border-portal-border bg-portal-panel/60 p-4 text-sm text-portal-muted">
        <summary className="cursor-pointer font-semibold text-portal-text">FAQ</summary>
        <p className="mt-2">{t('heroSubtitle')}</p>
      </details>
    </div>
  );
}
