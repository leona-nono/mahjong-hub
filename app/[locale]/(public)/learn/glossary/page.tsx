import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import { GLOSSARY } from '@/data/glossary';
import { GLOSSARY_GROUPS, glossaryDefinition } from '@/data/glossary/definitions';
import { pageMeta, SITE_BASE_URL } from '@/lib/seo';
import { brandName, getPublicSiteSettings } from '@/lib/site-settings';
import { term } from '@/data/glossary';

export const dynamic = 'force-static';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const learn = await getTranslations({ locale, namespace: 'learn' });
  const site = getPublicSiteSettings();
  return pageMeta({
    locale,
    path: '/learn/glossary',
    title: learn('glossaryTitle'),
    description: learn('glossaryLead'),
    ogImage: site.ogImage,
    siteName: brandName(site)
  });
}

function labelFor(key: string, locale: string): string {
  if (locale === 'en' || locale === 'zh' || locale === 'zh-TW') return term(key, locale);
  return term(key, 'en');
}

export default async function GlossaryPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const nav = await getTranslations('nav');
  const learn = await getTranslations('learn');
  const pageUrl = `${SITE_BASE_URL}/${locale}/learn/glossary`;
  const terms = GLOSSARY_GROUPS.flatMap((group) => group.keys);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: learn('glossaryTitle'),
    description: learn('glossaryLead'),
    url: pageUrl,
    hasDefinedTerm: terms.map((key) => ({
      '@type': 'DefinedTerm',
      name: labelFor(key, locale),
      description: glossaryDefinition(key, locale),
      url: `${pageUrl}#${key}`
    }))
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs
        locale={locale}
        crumbs={[
          { name: nav('home'), path: '/' },
          { name: nav('beginners'), path: '/blog' },
          { name: learn('glossary'), path: '/learn/glossary' }
        ]}
      />
      <h1 className="font-display text-3xl font-semibold text-portal-text">{learn('glossaryTitle')}</h1>
      <p className="mt-3 text-portal-muted">{learn('glossaryLead')}</p>

      <div className="mt-10 space-y-10">
        {GLOSSARY_GROUPS.map((group) => (
          <section key={group.id}>
            <h2 className="text-xl font-bold text-portal-text">{learn(`groups.${group.id}`)}</h2>
            <div className="mt-4 space-y-4">
              {group.keys.map((key) => {
                const label = labelFor(key, locale);
                const english = GLOSSARY[key]?.source ?? label;
                return (
                  <section key={key} id={key} className="scroll-mt-24 rounded-2xl border border-portal-border bg-portal-panel p-4">
                    <h3 className="font-semibold text-portal-text">{learn('whatIs', { term: label })}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-portal-muted">{glossaryDefinition(key, locale)}</p>
                    {locale !== 'en' ? (
                      <p className="mt-2 text-xs text-portal-muted/80">{english}</p>
                    ) : null}
                    <p className="mt-3 text-sm">
                      <Link href="/games/hong-kong-mahjong" className="text-portal-accent underline">
                        {learn('seeOnTable')}
                      </Link>
                    </p>
                  </section>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
