import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import WaitsTool from '@/components/tools/WaitsTool';
import { pageMeta, SITE_BASE_URL } from '@/lib/seo';
import { brandName, getPublicSiteSettings } from '@/lib/site-settings';

export const dynamic = 'force-static';

/**
 * Mahjong Hand Checker — the first child tool under /tools.
 *
 * Per docs/MAHJONG_TOOLS_SPEC.md §3.2 this page must ship in the same release
 * as the hub; a lone tool page with no parent loses the internal link equity
 * the hub provides, and visitors cannot discover the rest of the set.
 *
 * The interactive part lives in `components/tools/WaitsTool.tsx`. Everything
 * below the picker is server-rendered prose, because a page whose only content
 * is a JS-driven result box is an empty shell to a crawler (§5).
 */

const FAQ_COUNT = 5;

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
    path: '/tools/waits',
    title: t('waitsTitle'),
    description: t('waitsMetaDesc'),
    ogImage: site.ogImage,
    siteName: brandName(site)
  });
}

export default async function WaitsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const nav = await getTranslations('nav');
  const t = await getTranslations('tools');
  const pageUrl = `${SITE_BASE_URL}/${locale}/tools/waits`;

  const faq = Array.from({ length: FAQ_COUNT }, (_, index) => ({
    question: t(`waitsFaqQ${index + 1}`),
    answer: t(`waitsFaqA${index + 1}`)
  }));

  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: t('waitsTitle'),
    description: t('waitsMetaDesc'),
    url: pageUrl,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    inLanguage: locale,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
  };

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <Breadcrumbs
        locale={locale}
        crumbs={[
          { name: nav('home'), path: '/' },
          { name: nav('tools'), path: '/tools' },
          { name: t('backToHub'), path: '/tools/waits' }
        ]}
      />

      <h1 className="font-display text-3xl font-semibold text-portal-text">{t('waitsH1')}</h1>
      <p className="mt-3 max-w-2xl text-portal-muted">{t('waitsLead')}</p>

      <div className="mt-8">
        <WaitsTool />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-portal-text">{t('waitsHowTitle')}</h2>
        <p className="mt-3 text-sm leading-relaxed text-portal-muted">{t('waitsHowP1')}</p>
        <p className="mt-3 text-sm leading-relaxed text-portal-muted">{t('waitsHowP2')}</p>
        <p className="mt-3 text-sm leading-relaxed text-portal-muted">{t('waitsHowP3')}</p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-portal-text">{t('waitsConceptsTitle')}</h2>
        <p className="mt-3 text-sm leading-relaxed text-portal-muted">{t('waitsConceptsP1')}</p>
        <p className="mt-3 text-sm leading-relaxed text-portal-muted">{t('waitsConceptsP2')}</p>
      </section>

      <section className="mt-10" id="faq">
        <h2 className="font-display text-xl font-semibold text-portal-text">{t('waitsFaqTitle')}</h2>
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
        <h2 className="font-display text-xl font-semibold text-portal-text">{t('relatedTools')}</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link href="/tools/score" className="text-portal-accent underline">
              {t('scoreTitle')}
            </Link>
            <span className="ml-2 text-portal-muted">{t('inDevelopment')}</span>
          </li>
          <li>
            <Link href="/tools/tile-identifier" className="text-portal-accent underline">
              {t('tileIdTitle')}
            </Link>
            <span className="ml-2 text-portal-muted">{t('inDevelopment')}</span>
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-portal-text">{t('relatedReading')}</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link href="/blog/mahjong-scoring-system-explained" className="text-portal-accent underline">
              {t('readingScoring')}
            </Link>
          </li>
          <li>
            <Link href="/learn/glossary#waiting_hand" className="text-portal-accent underline">
              {t('readingGlossary')}
            </Link>
          </li>
        </ul>
        <p className="mt-4 text-sm">
          <Link href="/challenge" className="text-portal-accent underline">
            {t('hubChallenge')}
          </Link>
        </p>
        <p className="mt-4 text-sm">
          <Link href="/tools" className="text-portal-muted underline">
            {t('backToHub')}
          </Link>
        </p>
      </section>
    </div>
  );
}
