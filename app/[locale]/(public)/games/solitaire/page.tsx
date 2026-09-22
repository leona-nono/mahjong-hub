import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getGamesByNavGroup, getLocalizedGames } from '@/data/games';
import Breadcrumbs from '@/components/Breadcrumbs';
import CatalogGameCard from '@/components/CatalogGameCard';
import { pageMeta, SITE_BASE_URL } from '@/lib/seo';
import { brandName, getPublicSiteSettings } from '@/lib/site-settings';

export const dynamic = 'force-static';

const FAQ_COUNT = 4;

/**
 * Mahjong Solitaire category page (R7).
 * Cards: only mahjong-solitaire-classic — Connect is a sibling on /games.
 * No embedded table (R7).
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  const site = getPublicSiteSettings();
  const title = `${t('mahjongSolitaire')} | ${brandName(site)}`;
  return pageMeta({
    locale,
    path: '/games/solitaire',
    title,
    description: t('mahjongSolitaireDesc'),
    ogImage: site.ogImage,
    siteName: brandName(site)
  });
}

export default async function SolitaireCatalogPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('nav');
  const catalog = await getTranslations('catalog');
  // navGroup 'solitaire' also lists Connect (different genre) — this page only
  // shows Solitaire; Connect stays a sibling on /games (NAV_AND_GAMES_IA_SPEC §2.5).
  const games = getLocalizedGames(getGamesByNavGroup('solitaire'), locale).filter(
    (g) => g.slug === 'mahjong-solitaire-classic'
  );

  const pageUrl = `${SITE_BASE_URL}/${locale}/games/solitaire`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t('mahjongSolitaire'),
    description: catalog('solitaireLead'),
    url: pageUrl,
    hasPart: games.map((g) => ({
      '@type': 'Game',
      name: g.title,
      url: `${SITE_BASE_URL}/${locale}/games/${g.slug}`
    }))
  };

  const faq = Array.from({ length: FAQ_COUNT }, (_, index) => ({
    question: catalog(`solitaireFaqQ${index + 1}`),
    answer: catalog(`solitaireFaqA${index + 1}`)
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
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Breadcrumbs
        locale={locale}
        crumbs={[
          { name: t('home'), path: '/' },
          { name: t('games'), path: '/games' },
          { name: t('mahjongSolitaire'), path: '/games/solitaire' }
        ]}
      />
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-portal-text">
          {t('mahjongSolitaire')}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-portal-muted">
          {catalog('solitaireLead')}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((g) => (
          <CatalogGameCard key={g.slug} game={g} kind="solitaire" />
        ))}
      </div>

      <section className="mt-12 max-w-3xl">
        <h2 className="font-display text-xl font-semibold text-portal-text">
          {catalog('solitaireAboutTitle')}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-portal-muted">{catalog('solitaireAboutP1')}</p>
        <p className="mt-3 text-sm leading-relaxed text-portal-muted">{catalog('solitaireAboutP2')}</p>
        <p className="mt-3 text-sm leading-relaxed text-portal-muted">{catalog('solitaireAboutP3')}</p>
        <p className="mt-4 text-sm">
          <Link href="/games/mahjong-solitaire-classic" className="text-portal-accent underline">
            {catalog('solitairePlayClassic')}
          </Link>
        </p>
        <p className="mt-2 text-sm">
          <Link href="/games/mahjong-connect-classic" className="text-portal-accent underline">
            {catalog('solitaireConnectLink')}
          </Link>
        </p>
      </section>

      <section className="mt-10 max-w-3xl" id="faq">
        <h2 className="font-display text-xl font-semibold text-portal-text">
          {catalog('solitaireFaqTitle')}
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

      <section className="mt-10 max-w-3xl">
        <h2 className="font-display text-xl font-semibold text-portal-text">
          {catalog('relatedReading')}
        </h2>
        <p className="mt-3 text-sm text-portal-muted">{catalog('readingNote')}</p>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link href="/blog/what-is-mahjong" className="text-portal-accent underline">
              {catalog('solitaireReadingWhatIs')}
            </Link>
          </li>
          <li>
            <Link href="/blog/mahjong-tiles-meaning-guide" className="text-portal-accent underline">
              {catalog('solitaireReadingTiles')}
            </Link>
          </li>
          <li>
            <Link href="/blog/types-of-mahjong-games" className="text-portal-accent underline">
              {catalog('solitaireReadingTypes')}
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
