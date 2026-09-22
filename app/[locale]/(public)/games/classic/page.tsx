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

const CLASSIC_ORDER = [
  'hong-kong-mahjong',
  'riichi-mahjong',
  'chinese-official-mahjong',
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
  const t = await getTranslations({ locale, namespace: 'nav' });
  const catalog = await getTranslations({ locale, namespace: 'catalog' });
  const site = getPublicSiteSettings();
  const title = `${t('classic')} | ${brandName(site)}`;
  return pageMeta({
    locale,
    path: '/games/classic',
    title,
    description: catalog('classicLead'),
    ogImage: site.ogImage,
    siteName: brandName(site)
  });
}

/** Four-player vs AI category page (R7). No embedded table. */
export default async function ClassicCatalogPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('nav');
  const catalog = await getTranslations('catalog');
  const list = getLocalizedGames(getGamesByNavGroup('classic'), locale);
  const order = new Map<string, number>(CLASSIC_ORDER.map((slug, i) => [slug, i]));
  const games = [...list].sort(
    (a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99)
  );

  const pageUrl = `${SITE_BASE_URL}/${locale}/games/classic`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t('classicH1'),
    description: catalog('classicLead'),
    url: pageUrl,
    hasPart: games.map((g) => ({
      '@type': 'Game',
      name: g.title,
      url: `${SITE_BASE_URL}/${locale}/games/${g.slug}`
    }))
  };

  const faq = Array.from({ length: FAQ_COUNT }, (_, index) => ({
    question: catalog(`classicFaqQ${index + 1}`),
    answer: catalog(`classicFaqA${index + 1}`)
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
          { name: t('classicH1'), path: '/games/classic' }
        ]}
      />
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-portal-text">
          {t('classicH1')}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-portal-muted">
          {catalog('classicLead')}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((g) => (
          <CatalogGameCard key={g.slug} game={g} kind="classic" />
        ))}
      </div>

      <section className="mt-12 max-w-3xl">
        <h2 className="font-display text-xl font-semibold text-portal-text">
          {catalog('classicAboutTitle')}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-portal-muted">{catalog('classicAboutP1')}</p>
        <p className="mt-3 text-sm leading-relaxed text-portal-muted">{catalog('classicAboutP2')}</p>
        <p className="mt-3 text-sm leading-relaxed text-portal-muted">{catalog('classicAboutP3')}</p>
      </section>

      <section className="mt-10 max-w-3xl" id="faq">
        <h2 className="font-display text-xl font-semibold text-portal-text">
          {catalog('classicFaqTitle')}
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
            <Link href="/blog/types-of-mahjong-games" className="text-portal-accent underline">
              {catalog('classicReadingTypes')}
            </Link>
          </li>
          <li>
            <Link href="/blog/american-vs-chinese-mahjong" className="text-portal-accent underline">
              {catalog('classicReadingAmericanVsChinese')}
            </Link>
          </li>
          <li>
            <Link href="/blog/how-to-play-american-mahjong" className="text-portal-accent underline">
              {catalog('classicReadingHowToPlayAmerican')}
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
