import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

const BASE = 'https://mahjonggame.org';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ['', '/games'];
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const p of staticPaths) {
      entries.push({
        url: `${BASE}/${locale}${p}`,
        changeFrequency: 'weekly',
        priority: p === '' ? 1 : 0.8
      });
    }
  }

  return entries;
}
