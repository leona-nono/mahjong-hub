import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import WaitsTool from '@/components/tools/WaitsTool';
import { RichParagraph } from '@/lib/rich-text';
import { autolinkParagraph, glossaryLabels } from '@/lib/glossary-autolink';
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

function linkedParagraphs(texts: string[], locale: string): string[] {
  const labels = glossaryLabels(locale);
  const used = new Set<string>();
  return texts.map((text) => autolinkParagraph(text, labels, used).text);
}

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

  const howParas = linkedParagraphs(
    [t('waitsHowP1'), t('waitsHowP2'), t('waitsHowP3'), t('waitsHowP4'), t('waitsHowP5'), t('waitsHowP6')],
    locale
  );
  const conceptParas = linkedParagraphs([t('waitsConceptsP1'), t('waitsConceptsP2')], locale);

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
          { name: t('waitsTitle'), path: '/tools/waits' }
        ]}
      />

      <h1 className="font-display text-3xl font-semibold text-portal-text">{t('waitsH1')}</h1>
      <p className="mt-3 max-w-2xl text-portal-muted">{t('waitsLead')}</p>

      <div className="mt-8">
        <WaitsTool />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-portal-text">{t('waitsHowTitle')}</h2>
        {howParas.map((para) => (
          <p key={para.slice(0, 24)} className="mt-3 text-sm leading-relaxed text-portal-muted">
            <RichParagraph text={para} />
          </p>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-portal-text">{t('waitsConceptsTitle')}</h2>
        {conceptParas.map((para) => (
          <p key={para.slice(0, 24)} className="mt-3 text-sm leading-relaxed text-portal-muted">
            <RichParagraph text={para} />
          </p>
        ))}
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
            <Link href="/tools/tile-identifier" className="text-portal-accent underline">
              {t('tileIdTitle')}
            </Link>
          </li>
          <li>
            <Link href="/tools/score" className="text-portal-accent underline">
              {t('scoreTitle')}
            </Link>
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
              {t('readingWaitingHand')}
            </Link>
          </li>
          <li>
            <Link href="/learn/glossary#win_hand" className="text-portal-accent underline">
              {t('readingWinHand')}
            </Link>
          </li>
          <li>
            <Link href="/learn/glossary#single_tile_wait" className="text-portal-accent underline">
              {t('readingSingleWait')}
            </Link>
          </li>
          <li>
            <Link href="/learn/glossary" className="text-portal-accent underline">
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
