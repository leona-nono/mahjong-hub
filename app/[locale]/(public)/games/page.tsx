import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getGames, getLocalizedGames } from '@/data/games';
import Breadcrumbs from '@/components/Breadcrumbs';
import GameCard from '@/components/GameCard';
import HomeCategoryCards from '@/components/HomeCategoryCards';
import { hubPageMeta } from '@/lib/hub-seo';
import { hubCollectionJsonLd } from '@/lib/hub-jsonld';
import { isGamePageIndexable } from '@/lib/game-seo';
import { SITE_BASE_URL } from '@/lib/seo';

export const dynamic = 'force-static';

const FAQ_COUNT = 4;

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  const catalog = await getTranslations({ locale, namespace: 'catalog' });
  return hubPageMeta({
    locale,
    path: '/games',
    titleKey: 'gamesTitle',
    pageLabel: t('gameHallH1'),
    description: catalog('hallLead')
  });
}

/** Game Hall — R7 category hub. No embedded table. */
export default async function GamesHallPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('nav');
  const th = await getTranslations('home');
  const catalog = await getTranslations('catalog');
  const all = getLocalizedGames(getGames(), locale);
  const wall = all.filter((g) => g.gameType === 'native');
  const indexable = all.filter(isGamePageIndexable);
  const collectionLd = hubCollectionJsonLd({
    locale,
    path: '/games',
    name: t('gameHallH1'),
    description: catalog('hallLead'),
    items: indexable.map((game) => ({
      urlPath: `/games/${game.slug}`,
      name: game.title
    }))
  });

  const faq = Array.from({ length: FAQ_COUNT }, (_, index) => ({
    question: catalog(`hallFaqQ${index + 1}`),
    answer: catalog(`hallFaqA${index + 1}`)
  }));

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer }
    }))
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Breadcrumbs
        locale={locale}
        crumbs={[
          { name: t('home'), path: '/' },
          { name: t('games'), path: '/games' }
        ]}
      />
      <header>
        <h1 className="font-display text-3xl font-semibold text-portal-text">
          {t('gameHallH1')}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-portal-muted">
          {catalog('hallLead')}
        </p>
      </header>

      {/* On this hub, “More” must not self-link — send it to Solitaire category. */}
      <HomeCategoryCards moreHref="/games/solitaire" />

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold text-portal-text">
          {th('featuredHall')}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {wall.map((g) => (
            <GameCard key={g.slug} game={g} locale={locale} size="sm" />
          ))}
        </div>
      </section>

      <section className="max-w-3xl">
        <h2 className="font-display text-xl font-semibold text-portal-text">
          {catalog('hallAboutTitle')}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-portal-muted">{catalog('hallAboutP1')}</p>
        <p className="mt-3 text-sm leading-relaxed text-portal-muted">{catalog('hallAboutP2')}</p>
        <p className="mt-3 text-sm leading-relaxed text-portal-muted">{catalog('hallAboutP3')}</p>
      </section>

      <section className="max-w-3xl" id="faq">
        <h2 className="font-display text-xl font-semibold text-portal-text">
          {catalog('hallFaqTitle')}
        </h2>
        <dl className="mt-4 space-y-4">
          {faq.map((item) => (
            <div key={item.question} className="rounded-2xl border border-portal-border bg-portal-panel p-4">
              <dt className="font-semibold text-portal-text">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-portal-muted">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="max-w-3xl">
        <h2 className="font-display text-xl font-semibold text-portal-text">
          {catalog('relatedReading')}
        </h2>
        <p className="mt-3 text-sm text-portal-muted">{catalog('readingNote')}</p>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link href="/blog/what-is-mahjong" className="text-portal-accent underline">
              {catalog('hallReadingWhatIs')}
            </Link>
          </li>
          <li>
            <Link href="/blog/how-to-play-mahjong" className="text-portal-accent underline">
              {catalog('hallReadingHowToPlay')}
            </Link>
          </li>
          <li>
            <Link href="/blog/types-of-mahjong-games" className="text-portal-accent underline">
              {catalog('hallReadingTypes')}
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
