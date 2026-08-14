import type { MetadataRoute } from 'next';

const BASE = 'https://mahjonggame.org';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin', '/*/admin']
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE
  };
}
