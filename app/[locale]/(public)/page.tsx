import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import {
  getMergedFeaturedGames,
  getMergedGames,
  getMergedLocalizedGames,
  getMergedNativeGames
} from '@/lib/games-db';
import GameCard from '@/components/GameCard';
import DailyCheckIn from '@/components/DailyCheckIn';
import { Link } from '@/i18n/navigation';

// ISR: re-render at most every 5 minutes so CMS edits show up without a
// redeploy (admin writes also trigger revalidatePath for instant refresh).
export const revalidate = 300;

// Canonical + hreflang alternates are provided by the (public) layout —
// see app/[locale]/(public)/layout.tsx. A page-level `alternates` here would
// not emit its `languages` (Next 15.5 quirk on the `[locale]` index route).
export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const ts = await getTranslations('site');
  const featured = getMergedLocalizedGames(await getMergedFeaturedGames(), locale);
  const native = getMergedLocalizedGames(await getMergedNativeGames(), locale);
  const all = getMergedLocalizedGames(await getMergedGames(), locale);

  // FAQPage structured data (English — our primary SEO target language) so
  // Google can surface rich Q&A results on the homepage.
  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'en',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Mahjong Hub?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mahjong Hub is a free online collection of rainbow-themed mahjong games, including mahjong solitaire, connect (match) puzzles and tile-matching modes. Play instantly in your browser with no download required.'
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
          text: 'Yes. Mahjong Hub is fully responsive and works on phones, tablets and desktop browsers, so there is no app to install.'
        }
      },
      {
        '@type': 'Question',
        name: 'How do you play mahjong solitaire?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Match two free tiles that share the same symbol to remove them. A tile is "free" when nothing is on top of it and at least one side is open. Clear the entire board to win.'
        }
      },
      {
        '@type': 'Question',
        name: 'Which mahjong game types are available?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We offer original rainbow mahjong solitaire layouts, connect/match puzzles and classic tile-matching modes, with new game types added over time.'
        }
      }
    ]
  };

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: ts('name'),
      description: ts('tagline'),
      url: 'https://mahjonggame.org',
      inLanguage: ['en', 'zh', 'zh-TW', 'ja', 'ko']
    },
    faqPage
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="rounded-3xl rainbow-card px-6 py-12 text-center">
        <h1 className="text-4xl font-black rainbow-text sm:text-5xl">
          {t('heroTitle')}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600">
          {t('heroSubtitle')}
        </p>
        <Link
          href="/games"
          className="mt-6 inline-block rounded-full rainbow-bar px-8 py-3 font-bold text-white shadow-md transition hover:opacity-90"
        >
          {t('playButton')}
        </Link>
      </section>

      {/* Daily check-in */}
      <DailyCheckIn />

      {/* Our own games — the differentiator, so they go above the fold. */}
      <section className="mt-12">
        <h2 className="mb-1 text-2xl font-bold text-gray-800">
          {t('originalTitle')}
        </h2>
        <p className="mb-4 text-sm text-gray-500">{t('originalSubtitle')}</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {native.map((g) => (
            <GameCard key={g.slug} game={g} locale={locale} />
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">
          {t('featuredTitle')}
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {featured.map((g) => (
            <GameCard key={g.slug} game={g} locale={locale} />
          ))}
        </div>
      </section>

      {/* All games */}
      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">
          {t('collectionTitle')}
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {all.map((g) => (
            <GameCard key={g.slug} game={g} locale={locale} />
          ))}
        </div>
      </section>
    </div>
  );
}
