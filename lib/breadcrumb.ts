import { SITE_BASE_URL } from '@/lib/seo';

export type Crumb = { name: string; path: string };

function crumbUrl(locale: string, path: string): string {
  if (!path || path === '/') return `${SITE_BASE_URL}/${locale}`;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_BASE_URL}/${locale}${suffix}`;
}

export function breadcrumbJsonLd(locale: string, crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumbUrl(locale, crumb.path)
    }))
  };
}
