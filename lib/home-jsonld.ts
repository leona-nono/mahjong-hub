import { absoluteUrl, SITE_BASE_URL } from '@/lib/seo';
import { brandName, type PublicSiteSettings } from '@/lib/site-settings';

/**
 * Homepage JSON-LD: WebSite + Organization + SoftwareApplication (+ optional FAQ).
 * Helps rich results / knowledge panels for brand identity and free web game offers.
 */
export function homeJsonLd(opts: {
  site: PublicSiteSettings;
  locale: string;
  /** Locale-aware site description (prefer translated meta over CMS English). */
  description?: string;
  faq?: Record<string, unknown>;
}): Record<string, unknown>[] {
  const brand = brandName(opts.site);
  const description = opts.description || opts.site.siteDescription;
  const homeUrl = absoluteUrl(`/${opts.locale}`);
  const logo = absoluteUrl('/icons/icon-512.svg');
  const sameAs = [opts.site.facebook, opts.site.x, opts.site.instagram, opts.site.tiktok].filter(
    Boolean
  );

  const organization: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_BASE_URL}/#organization`,
    name: brand,
    url: SITE_BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: logo
    },
    description
  };
  if (sameAs.length) organization.sameAs = sameAs;

  const software: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE_BASE_URL}/#software`,
    name: brand,
    applicationCategory: 'GameApplication',
    applicationSubCategory: 'Mahjong',
    operatingSystem: 'Web',
    url: homeUrl,
    image: absoluteUrl(opts.site.ogImage || '/og-default.png'),
    description,
    offers: {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    publisher: { '@id': `${SITE_BASE_URL}/#organization` },
    inLanguage: opts.locale
  };

  const website: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_BASE_URL}/#website`,
    name: opts.site.siteTitle,
    description,
    url: SITE_BASE_URL,
    inLanguage: ['en', 'zh', 'zh-TW', 'ja', 'ko', 'es', 'pt-BR', 'fr', 'de'],
    publisher: { '@id': `${SITE_BASE_URL}/#organization` }
  };

  const nodes = [organization, website, software];
  if (opts.faq) nodes.push(opts.faq);
  return nodes;
}
