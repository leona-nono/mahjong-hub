import { absoluteUrl, SITE_BASE_URL } from '@/lib/seo';

/** CollectionPage + ItemList for /blog and /games hubs (locale-prefixed URLs). */
export function hubCollectionJsonLd(opts: {
  locale: string;
  path: '/blog' | '/games';
  name: string;
  description: string;
  items: { urlPath: string; name: string }[];
}): Record<string, unknown> {
  const pageUrl = absoluteUrl(`/${opts.locale}${opts.path}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': pageUrl,
    name: opts.name,
    description: opts.description,
    url: pageUrl,
    inLanguage: opts.locale,
    isPartOf: { '@id': `${SITE_BASE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: opts.items.length,
      itemListElement: opts.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(`/${opts.locale}${item.urlPath}`),
        name: item.name
      }))
    }
  };
}
