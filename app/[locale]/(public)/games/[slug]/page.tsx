import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import {
  getGames,
  getGamesByNavGroup,
  getLocalizedGame,
  getLocalizedGames,
  getRelatedGames
} from '@/data/games';
import IframeSection from '@/components/IframeSection';
import NativeGameLazy from '@/components/games/NativeGameLazy';
import CatalogGameCard from '@/components/CatalogGameCard';
import AdSlot from '@/components/AdSlot';
import ComingSoonGame from '@/components/ComingSoonGame';
import { pageMeta } from '@/lib/seo';
import { UI_LOCALES } from '@/lib/locales';
import { brandName, formatGameMetadata, getPublicSiteSettings } from '@/lib/site-settings';

const SITE = 'https://mahjonggame.org';

const LOCALE_TO_LANGUAGE: Record<string, string> = {
  en: 'en-US',
  zh: 'zh-CN',
  'zh-TW': 'zh-TW',
  ja: 'ja',
  ko: 'ko',
  es: 'es',
  'pt-BR': 'pt-BR',
  fr: 'fr',
  de: 'de'
};

/** Pure SSG from data/games + games-i18n. Redeploy to refresh. */
export const dynamic = 'force-static';

export function generateStaticParams() {
  return getGames().flatMap((g) =>
    UI_LOCALES.map((locale) => ({ locale, slug: g.slug }))
  );
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const game = getLocalizedGame(slug, locale);
  if (!game) return {};

  const isIndexable = game.gameType === 'native' || game.gameType === 'coming-soon';
  const site = getPublicSiteSettings();
  const seo = formatGameMetadata(site, game);

  return pageMeta({
    locale,
    path: `/games/${slug}`,
    title: seo.title,
    description: seo.description,
    ogImage: game.cover || site.ogImage,
    siteName: brandName(site),
    robots: isIndexable
      ? { index: true, follow: true }
      : { index: false, follow: true }
  });
}

export default async function GamePage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const game = getLocalizedGame(slug, locale);
  if (!game) notFound();

  const t = await getTranslations('game');
  const related = getLocalizedGames(getRelatedGames(slug, 8), locale);
  const regionalSwitchGames = getLocalizedGames(
    getGamesByNavGroup('classic'),
    locale
  ).filter((candidate) => candidate.slug !== slug);
  const solitaireSwitchGames = getLocalizedGames(
    getGamesByNavGroup('solitaire'),
    locale
  ).filter((candidate) => candidate.slug !== slug);
  const isNative = game.gameType === 'native';
  const isComingSoon = game.gameType === 'coming-soon';
  const content = game.content;
  const isHongKong = game.ruleset === 'hongkong';
  const isFourPlayer = game.category === 'four-player';

  const jsonLd: Record<string, unknown>[] = [];
  if (isNative) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: game.title,
      description: game.description,
      url: `${SITE}/${locale}/games/${slug}`,
      inLanguage: LOCALE_TO_LANGUAGE[locale] ?? locale,
      genre: game.category === 'four-player' ? 'BoardGame' : 'Puzzle',
      gamePlatform: ['Web Browser', 'Mobile Web'],
      playMode: game.players && game.players > 1 ? 'MultiPlayer' : 'SinglePlayer',
      numberOfPlayers: {
        '@type': 'QuantitativeValue',
        value: game.players ?? 1
      },
      applicationCategory: 'GameApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      }
    });
  }

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

  const stage = isComingSoon ? (
    <ComingSoonGame game={game} />
  ) : isNative && game.native ? (
    <Suspense
      fallback={
        <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-portal-border bg-portal-panel text-sm text-portal-muted">
          Loading game…
        </div>
      }
    >
      <NativeGameLazy
        native={game.native}
        ruleset={game.ruleset}
        regionalRuleset={game.regionalRuleset}
        slug={game.slug}
      />
    </Suspense>
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
          {content && !isHongKong && (
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
          <div className="regional-switch-grid">
            {(isFourPlayer ? regionalSwitchGames : solitaireSwitchGames).map((g) => (
              <CatalogGameCard
                key={g.slug}
                game={g}
                kind={isFourPlayer ? 'classic' : 'solitaire'}
                compact
              />
            ))}
          </div>
        </aside>
      </div>

      {content ? (
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

          <section className="rounded-xl border border-portal-border bg-portal-panel p-4">
            <h2 className="font-semibold text-portal-text">{t('howToPlay')}</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-portal-muted">
              {content.howToPlay.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </section>
          {content.features?.length ? (
            <section className="rounded-xl border border-portal-border bg-portal-panel p-4">
              <h2 className="font-semibold text-portal-text">{t('features')}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-portal-muted">
                {content.features.map((item) => (
                  <li key={item.slice(0, 48)}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {content.supportedDevices ? (
            <section className="rounded-xl border border-portal-border bg-portal-panel p-4">
              <h2 className="font-semibold text-portal-text">{t('supportedDevices')}</h2>
              <p className="mt-3 text-sm leading-relaxed text-portal-muted">
                {content.supportedDevices}
              </p>
            </section>
          ) : null}
          <section className="rounded-xl border border-portal-border bg-portal-panel p-4">
            <h2 className="font-semibold text-portal-text">{t('tips')}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-portal-muted">
              {content.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </section>
          {content.faq?.length ? (
            <section className="rounded-xl border border-portal-border bg-portal-panel p-4">
              <h2 className="font-semibold text-portal-text">{t('faq')}</h2>
              <div className="mt-3 space-y-3">
                {content.faq.map((item, i) => (
                  <div key={i}>
                    <p className="text-sm font-semibold text-portal-text">{item.question}</p>
                    <p className="mt-1 text-sm text-portal-muted">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      <section className="mt-8 lg:hidden">
        <h2 className="mb-3 font-display text-lg font-semibold text-portal-text">
          {t('tryAnother')}
        </h2>
        <div className="regional-switch-grid regional-switch-grid--mobile">
          {(isFourPlayer ? regionalSwitchGames : solitaireSwitchGames).map((g) => (
            <CatalogGameCard
              key={g.slug}
              game={g}
              kind={isFourPlayer ? 'classic' : 'solitaire'}
              compact
            />
          ))}
        </div>
      </section>
    </div>
  );
}
