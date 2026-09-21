import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import ScoreTool from '@/components/tools/ScoreTool';
import { RichParagraph } from '@/lib/rich-text';
import { autolinkParagraph, glossaryLabels } from '@/lib/glossary-autolink';
import { pageMeta, SITE_BASE_URL } from '@/lib/seo';
import { brandName, getPublicSiteSettings } from '@/lib/site-settings';

export const dynamic = 'force-static';

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
    path: '/tools/score',
    title: t('scoreTitle'),
    description: t('scoreMetaDesc'),
    ogImage: site.ogImage,
    siteName: brandName(site)
  });
}

export default async function ScorePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const nav = await getTranslations('nav');
  const t = await getTranslations('tools');
  const pageUrl = `${SITE_BASE_URL}/${locale}/tools/score`;

  const faq = Array.from({ length: FAQ_COUNT }, (_, index) => ({
    question: t(`scoreFaqQ${index + 1}`),
    answer: t(`scoreFaqA${index + 1}`)
  }));

  const howParas = linkedParagraphs(
    [t('scoreHowP1'), t('scoreHowP2'), t('scoreHowP3'), t('scoreHowP4'), t('scoreHowP5')],
    locale
  );

  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: t('scoreTitle'),
    description: t('scoreMetaDesc'),
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
          { name: t('scoreTitle'), path: '/tools/score' }
        ]}
      />

      <h1 className="font-display text-3xl font-semibold text-portal-text">{t('scoreH1')}</h1>
      <p className="mt-3 max-w-2xl text-portal-muted">{t('scoreLead')}</p>

      <div className="mt-8">
        <ScoreTool />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-portal-text">{t('scoreHowTitle')}</h2>
        {howParas.map((para) => (
          <p key={para.slice(0, 24)} className="mt-3 text-sm leading-relaxed text-portal-muted">
            <RichParagraph text={para} />
          </p>
        ))}
      </section>

      <section className="mt-10" id="faq">
        <h2 className="font-display text-xl font-semibold text-portal-text">{t('scoreFaqTitle')}</h2>
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
            <Link href="/tools/waits" className="text-portal-accent underline">
              {t('waitsTitle')}
            </Link>
          </li>
          <li>
            <Link href="/tools/tile-identifier" className="text-portal-accent underline">
              {t('tileIdTitle')}
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
            <Link href="/learn/glossary" className="text-portal-accent underline">
              {t('readingGlossary')}
            </Link>
          </li>
        </ul>
      </section>

      <p className="mt-8 text-sm">
        <Link href="/tools" className="text-portal-muted underline">
          {t('backToHub')}
        </Link>
      </p>
    </div>
  );
}
