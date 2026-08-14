import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import {
  getMergedGames,
  getMergedLocalizedGame,
  getMergedLocalizedGames,
  getMergedRelatedGames
} from '@/lib/games-db';
import IframeSection from '@/components/IframeSection';
import NativeGameMount from '@/components/games/NativeGameMount';
import GameCard from '@/components/GameCard';
import AdSlot from '@/components/AdSlot';
import ComingSoonGame from '@/components/ComingSoonGame';
import { alternatesFor } from '@/lib/seo';

const SITE = 'https://mahjonggame.org';
const LOCALES = ['en', 'zh', 'zh-TW', 'ja', 'ko'];

export const revalidate = 86_400;

export async function generateStaticParams() {
  const games = await getMergedGames();
  return games.flatMap((g) =>
    LOCALES.map((locale) => ({ locale, slug: g.slug }))
  );
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const game = await getMergedLocalizedGame(slug, locale);
  if (!game) return {};

  const isNative = game.gameType === 'native';
  const url = `${SITE}/${locale}/games/${slug}`;

  return {
    title: game.title,
    description: game.description,
    alternates: alternatesFor(locale, `/games/${slug}`),
    openGraph: {
      title: game.title,
      description: game.description,
      url,
      type: 'website'
    },
    // Native games are our own content and carry full rules copy, so they are
    // worth indexing. Iframe pages wrap someone else's game — thin content that
    // we do not want competing with our own pages.
    robots: isNative
      ? { index: true, follow: true }
      : { index: false, follow: true }
  };
}

export default async function GamePage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const game = await getMergedLocalizedGame(slug, locale);
  if (!game) notFound();

  const t = await getTranslations('game');
  const related = getMergedLocalizedGames(
    await getMergedRelatedGames(slug, 4),
    locale
  );
  const isNative = game.gameType === 'native';
  const isComingSoon = game.gameType === 'coming-soon';
  const content = game.content;
  const isHongKong = game.ruleset === 'hongkong';

  const jsonLd: Record<string, unknown>[] = [];
  if (isNative) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: game.title,
      description: game.description,
      url: `${SITE}/${locale}/games/${slug}`,
      genre: 'Puzzle',
      gamePlatform: ['Web Browser', 'Mobile Web'],
      playMode: game.players && game.players > 1 ? 'MultiPlayer' : 'SinglePlayer',
      numberOfPlayers: {
        '@type': 'QuantitativeValue',
        value: game.players ?? 1
      },
      applicationCategory: 'Game',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      }
    });

    if (content?.faq?.length) {
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: content.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer }
        }))
      });
    }
  }

  return (
    <div className={`mx-auto px-4 py-8 ${isHongKong ? 'max-w-[1500px]' : 'max-w-5xl'}`}>
      {jsonLd.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}

      <h1 className={isHongKong ? 'sr-only' : 'mb-2 text-3xl font-black rainbow-text'}>{game.title}</h1>

      {isNative && content && !isHongKong && (
        <p className="mb-5 max-w-3xl text-gray-600">{content.intro}</p>
      )}

      {isComingSoon ? (
        <ComingSoonGame game={game} />
      ) : isNative && game.native ? (
        <NativeGameMount native={game.native} ruleset={game.ruleset} slug={game.slug} />
      ) : (
        <IframeSection
          game={game}
          fallbackGames={related.map((g) => ({ slug: g.slug, title: g.title }))}
        />
      )}

      <AdSlot />

      {isNative && content && (
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-800">
              {t('howToPlay')}
            </h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-600">
              {content.howToPlay.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-800">{t('tips')}</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600">
              {content.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {isNative && content?.faq?.length ? (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-gray-800">{t('faq')}</h2>
          <div className="space-y-3">
            {content.faq.map((item, i) => (
              <details
                key={i}
                className="rounded-2xl border border-gray-100 bg-white/70 p-4"
              >
                <summary className="cursor-pointer font-semibold text-gray-800">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm text-gray-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-gray-800">{t('tryAnother')}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {related.map((g) => (
            <GameCard key={g.slug} game={g} locale={locale} />
          ))}
        </div>
      </section>
    </div>
  );
}
