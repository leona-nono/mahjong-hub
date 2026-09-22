import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import { pageMeta, SITE_BASE_URL } from '@/lib/seo';
import { brandName, getPublicSiteSettings } from '@/lib/site-settings';

export const dynamic = 'force-static';

/**
 * Tools hub — the parent container for every free mahjong calculator.
 *
 * This page owns the head term "Mahjong Calculator" (see
 * docs/MAHJONG_TOOLS_SPEC.md §3.1): it is the umbrella keyword, and the three
 * child tools each take a specific one. Splitting them into four sibling pages
 * would make all four thin.
 *
 * Per §3.2 the hub may only ship alongside at least one *working* child tool.
 * All three Phase-1 tools (waits, tile-identifier, score) are live.
 */

type ToolEntry = {
  id: 'waits' | 'score' | 'tileId';
  href: string;
  live: boolean;
};

const TOOLS: ToolEntry[] = [
  { id: 'waits', href: '/tools/waits', live: true },
  { id: 'tileId', href: '/tools/tile-identifier', live: true },
  { id: 'score', href: '/tools/score', live: true }
];

const HUB_FAQ_COUNT = 4;

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'tools' });
  const site = getPublicSiteSettings();
  return pageMeta({
    locale,
    path: '/tools',
    title: t('hubTitle'),
    description: t('hubLead'),
    ogImage: site.ogImage,
    siteName: brandName(site)
  });
}

export default async function ToolsHubPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const nav = await getTranslations('nav');
  const t = await getTranslations('tools');
  const pageUrl = `${SITE_BASE_URL}/${locale}/tools`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t('hubTitle'),
    description: t('hubLead'),
    url: pageUrl,
    // Only live tools belong in structured data — listing undeployed URLs
    // would hand crawlers soft-404 targets (MAHJONG_TOOLS_SPEC §3.2).
    hasPart: TOOLS.filter((tool) => tool.live).map((tool) => ({
      '@type': 'SoftwareApplication',
      name: t(`${tool.id}Title`),
      description: t(`${tool.id}Lead`),
      url: `${SITE_BASE_URL}/${locale}${tool.href}`,
      applicationCategory: 'GameApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
    }))
  };

  const faq = Array.from({ length: HUB_FAQ_COUNT }, (_, index) => ({
    question: t(`hubFaqQ${index + 1}`),
    answer: t(`hubFaqA${index + 1}`)
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
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Breadcrumbs
        locale={locale}
        crumbs={[
          { name: nav('home'), path: '/' },
          { name: nav('tools'), path: '/tools' }
        ]}
      />
      <h1 className="font-display text-3xl font-semibold text-portal-text">{t('hubTitle')}</h1>
      <p className="mt-3 max-w-2xl text-portal-muted">{t('hubLead')}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {TOOLS.map((tool) => {
          const card = (
            <div className="flex h-full flex-col rounded-2xl border border-portal-border bg-portal-panel p-5 transition">
              <h3 className="font-display text-lg font-semibold text-portal-text">
                {t(`${tool.id}Title`)}
              </h3>
              <p className="mt-2 flex-1 text-sm text-portal-muted">{t(`${tool.id}Lead`)}</p>
              <p className="mt-4 text-sm font-semibold">
                {tool.live ? (
                  <span className="text-portal-accent">{t('seeTool')} →</span>
                ) : (
                  <span className="text-portal-muted">{t('inDevelopment')}</span>
                )}
              </p>
            </div>
          );

          return tool.live ? (
            <Link key={tool.id} href={tool.href} className="block rounded-2xl hover:opacity-90">
              {card}
            </Link>
          ) : (
            <div key={tool.id} aria-disabled="true">
              {card}
            </div>
          );
        })}
      </div>

      {TOOLS.some((tool) => !tool.live) ? (
        <p className="mt-4 text-xs text-portal-muted">{t('inDevelopmentNote')}</p>
      ) : null}

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-portal-text">{t('hubAboutTitle')}</h2>
        <p className="mt-3 text-sm leading-relaxed text-portal-muted">{t('hubIntro')}</p>
        <p className="mt-3 text-sm leading-relaxed text-portal-muted">{t('hubAboutP2')}</p>
        <p className="mt-3 text-sm leading-relaxed text-portal-muted">{t('hubAboutP3')}</p>
      </section>

      <section className="mt-10" id="faq">
        <h2 className="font-display text-xl font-semibold text-portal-text">{t('hubFaqTitle')}</h2>
        <dl className="mt-4 space-y-4">
          {faq.map((item) => (
            <div key={item.question} className="rounded-2xl border border-portal-border bg-portal-panel p-4">
              <dt className="font-semibold text-portal-text">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-portal-muted">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-portal-text">{t('relatedReading')}</h2>
        <p className="mt-3 text-sm text-portal-muted">{t('readingNote')}</p>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link href="/blog/mahjong-tiles-meaning-guide" className="text-portal-accent underline">
              {t('readingTiles')}
            </Link>
          </li>
          <li>
            <Link href="/blog/mahjong-scoring-system-explained" className="text-portal-accent underline">
              {t('readingScoring')}
            </Link>
          </li>
          <li>
            <Link href="/learn/glossary" className="text-portal-accent underline">
              {t('readingGlossary')}
            </Link>
          </li>
        </ul>
      </section>

      <p className="mt-10 text-sm">
        <Link href="/challenge" className="text-portal-accent underline">
          {t('hubChallenge')}
        </Link>
      </p>
    </div>
  );
}
