import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import TileFace from '@/components/games/TileFace';
import TileIdentifierTool from '@/components/tools/TileIdentifierTool';
import { TILE_ALIASES, TILE_ID_ORDER } from '@/data/tools/tile-aliases';
import { RichParagraph } from '@/lib/rich-text';
import { autolinkParagraph, glossaryLabels } from '@/lib/glossary-autolink';
import { pageMeta, SITE_BASE_URL } from '@/lib/seo';
import { brandName, getPublicSiteSettings } from '@/lib/site-settings';
import {
  isHonour,
  isTerminal,
  tileName,
  tileRank,
  tileSuit,
  type Tile
} from '@/lib/mahjong/tiles';

export const dynamic = 'force-static';

const FAQ_COUNT = 5;

const SUIT_LABEL_KEY = {
  m: 'tileIdSuitCharacters',
  p: 'tileIdSuitDots',
  s: 'tileIdSuitBamboo',
  z: 'tileIdSuitHonours'
} as const;

function typeKey(tile: Tile): 'tileIdTypeHonour' | 'tileIdTypeTerminal' | 'tileIdTypeSimple' {
  if (isHonour(tile)) return 'tileIdTypeHonour';
  if (isTerminal(tile)) return 'tileIdTypeTerminal';
  return 'tileIdTypeSimple';
}

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
    path: '/tools/tile-identifier',
    title: t('tileIdTitle'),
    description: t('tileIdMetaDesc'),
    ogImage: site.ogImage,
    siteName: brandName(site)
  });
}

export default async function TileIdentifierPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const nav = await getTranslations('nav');
  const t = await getTranslations('tools');
  const pageUrl = `${SITE_BASE_URL}/${locale}/tools/tile-identifier`;

  const faq = Array.from({ length: FAQ_COUNT }, (_, index) => ({
    question: t(`tileIdFaqQ${index + 1}`),
    answer: t(`tileIdFaqA${index + 1}`)
  }));

  const howParas = linkedParagraphs(
    [t('tileIdHowP1'), t('tileIdHowP2'), t('tileIdHowP3'), t('tileIdHowP4'), t('tileIdHowP5')],
    locale
  );

  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: t('tileIdTitle'),
    description: t('tileIdMetaDesc'),
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
          { name: t('tileIdTitle'), path: '/tools/tile-identifier' }
        ]}
      />

      <h1 className="font-display text-3xl font-semibold text-portal-text">{t('tileIdH1')}</h1>
      <p className="mt-3 max-w-2xl text-portal-muted">{t('tileIdLead')}</p>

      <div className="mt-8">
        <TileIdentifierTool />
      </div>

      {/* Full SSR catalogue — the SEO asset (§4.3). Client picker above must not replace this. */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-portal-text">{t('tileIdCatalogTitle')}</h2>
        <p className="mt-2 text-sm text-portal-muted">{t('tileIdCatalogLead')}</p>
        <div className="mt-6 space-y-8">
          {TILE_ID_ORDER.map((tile) => {
            const suit = tileSuit(tile);
            const aliases = TILE_ALIASES[tile] ?? [];
            return (
              <article
                key={tile}
                id={tile}
                className="scroll-mt-24 rounded-2xl border border-portal-border bg-portal-panel p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start gap-4">
                  <TileFace tile={tile} size="lg" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-semibold text-portal-text">
                      {tileName(tile)}
                    </h3>
                    <p className="mt-1 text-sm text-portal-muted">
                      <span className="font-semibold text-portal-text">{t('tileIdAliases')}: </span>
                      {aliases.join(' · ')}
                    </p>
                    <p className="mt-1 text-sm text-portal-muted">
                      <span className="font-semibold text-portal-text">{t('tileIdSuit')}: </span>
                      {t(SUIT_LABEL_KEY[suit])}
                      {!isHonour(tile) ? (
                        <>
                          {' · '}
                          <span className="font-semibold text-portal-text">{t('tileIdRank')}: </span>
                          {tileRank(tile)}
                        </>
                      ) : null}
                      {' · '}
                      <span className="font-semibold text-portal-text">{t('tileIdType')}: </span>
                      {t(typeKey(tile))}
                    </p>
                    <p className="mt-2 text-sm">
                      <Link
                        href={`/learn/glossary#${isHonour(tile) ? 'honor_tiles' : suit === 'm' ? 'character_tiles' : suit === 'p' ? 'dot_tiles' : 'bamboo_tiles'}`}
                        className="text-portal-accent underline"
                      >
                        {t('readingGlossary')}
                      </Link>
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-portal-text">{t('tileIdHowTitle')}</h2>
        {howParas.map((para) => (
          <p key={para.slice(0, 24)} className="mt-3 text-sm leading-relaxed text-portal-muted">
            <RichParagraph text={para} />
          </p>
        ))}
      </section>

      <section className="mt-10" id="faq">
        <h2 className="font-display text-xl font-semibold text-portal-text">{t('tileIdFaqTitle')}</h2>
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
            <Link href="/tools/score" className="text-portal-accent underline">
              {t('scoreTitle')}
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
