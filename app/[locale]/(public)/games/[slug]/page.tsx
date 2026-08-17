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
import MarkdownContent from '@/components/MarkdownContent';
import { alternatesFor } from '@/lib/seo';
import { getGameFeatureMarkdown } from '@/lib/game-features';

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

  const cmsMarkdown = await getGameFeatureMarkdown(slug, locale);
  const t = await getTranslations('game');
  const related = getMergedLocalizedGames(
    await getMergedRelatedGames(slug, 8),
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

  const stage = isComingSoon ? (
    <ComingSoonGame game={game} />
  ) : isNative && game.native ? (
    <NativeGameMount native={game.native} ruleset={game.ruleset} slug={game.slug} />
  ) : (
    <IframeSection
      game={game}
      fallbackGames={related.map((g) => ({ slug: g.slug, title: g.title }))}
    />
  );

  return (
    <div
      className={`mx-auto px-4 py-5 sm:px-6 ${
        isHongKong ? 'max-w-[1600px]' : 'max-w-[1400px]'
      }`}
    >
      {jsonLd.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}

      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1
            className={
              isHongKong
                ? 'sr-only'
                : 'font-display text-2xl font-semibold text-portal-text sm:text-3xl'
            }
          >
            {game.title}
          </h1>
          {isNative && content && !isHongKong && (
            <p className="mt-1 max-w-3xl text-sm text-portal-muted line-clamp-2">
              {content.intro}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          {stage}
          <AdSlot />
        </div>

        <aside className="hidden lg:block">
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-portal-muted">
            {t('tryAnother')}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {related.map((g) => (
              <GameCard key={g.slug} game={g} size="sm" />
            ))}
          </div>
        </aside>
      </div>

      {(game.screenshots?.length || cmsMarkdown || (isNative && content)) && (
        <div className="mt-8 space-y-3">
          {game.screenshots?.length ? (
            <section className="rounded-xl border border-portal-border bg-portal-panel p-4">
              <h2 className="font-semibold text-portal-text">{t('screenshots')}</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                {game.screenshots.map((src) => (
                  <div key={src} className="overflow-hidden rounded-lg border border-portal-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="aspect-video w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {cmsMarkdown ? (
            <section className="rounded-xl border border-portal-border bg-portal-panel p-4">
              <h2 className="mb-3 font-semibold text-portal-text">{t('about')}</h2>
              <MarkdownContent markdown={cmsMarkdown} />
            </section>
          ) : null}

          {isNative && content ? (
            <>
          <details className="rounded-xl border border-portal-border bg-portal-panel p-4">
            <summary className="cursor-pointer font-semibold text-portal-text">
              {t('howToPlay')}
            </summary>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-portal-muted">
              {content.howToPlay.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </details>
          <details className="rounded-xl border border-portal-border bg-portal-panel p-4">
            <summary className="cursor-pointer font-semibold text-portal-text">
              {t('tips')}
            </summary>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-portal-muted">
              {content.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </details>
          {content.faq?.length ? (
            <details className="rounded-xl border border-portal-border bg-portal-panel p-4">
              <summary className="cursor-pointer font-semibold text-portal-text">
                {t('faq')}
              </summary>
              <div className="mt-3 space-y-3">
                {content.faq.map((item, i) => (
                  <div key={i}>
                    <p className="text-sm font-semibold text-portal-text">{item.question}</p>
                    <p className="mt-1 text-sm text-portal-muted">{item.answer}</p>
                  </div>
                ))}
              </div>
            </details>
          ) : null}
            </>
          ) : null}
        </div>
      )}

      <section className="mt-8 lg:hidden">
        <h2 className="mb-3 font-display text-lg font-semibold text-portal-text">
          {t('tryAnother')}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {related.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      </section>
    </div>
  );
}
