import 'server-only';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';

export interface PublicSiteSettings {
  siteTitle: string;
  siteDescription: string;
  defaultLocale: string;
  ogImage: string;
  facebook: string;
  x: string;
  instagram: string;
  tiktok: string;
  ga: string;
  gtm: string;
}

export const DEFAULT_PUBLIC_SITE_SETTINGS: PublicSiteSettings = {
  siteTitle: 'Mahjong Hub · Free Mahjong Games',
  siteDescription:
    'Play free mahjong solitaire, connect and classic tile games online. Instant play in your browser — no download.',
  defaultLocale: 'en',
  ogImage: '/og-default.png',
  facebook: '',
  x: '',
  instagram: '',
  tiktok: '',
  ga: 'G-61V8MK15S6',
  gtm: ''
};

const loadSiteSettings = unstable_cache(
  async (): Promise<PublicSiteSettings> => {
    try {
      const rows = await prisma.siteSetting.findMany({
        where: { key: { in: ['site', 'social', 'analytics'] } }
      });
      const byKey = new Map(
        rows.map((row) => [row.key, (row.value ?? {}) as Record<string, unknown>])
      );
      const site = byKey.get('site') ?? {};
      const social = byKey.get('social') ?? {};
      const analytics = byKey.get('analytics') ?? {};

      return {
        siteTitle:
          typeof site.siteTitle === 'string' && site.siteTitle
            ? site.siteTitle
            : DEFAULT_PUBLIC_SITE_SETTINGS.siteTitle,
        siteDescription:
          typeof site.siteDescription === 'string' && site.siteDescription
            ? site.siteDescription
            : DEFAULT_PUBLIC_SITE_SETTINGS.siteDescription,
        defaultLocale:
          typeof site.defaultLocale === 'string' && site.defaultLocale
            ? site.defaultLocale
            : DEFAULT_PUBLIC_SITE_SETTINGS.defaultLocale,
        ogImage:
          typeof site.ogImage === 'string' && site.ogImage
            ? site.ogImage
            : DEFAULT_PUBLIC_SITE_SETTINGS.ogImage,
        facebook:
          typeof social.facebook === 'string' ? social.facebook : '',
        x: typeof social.x === 'string' ? social.x : '',
        instagram:
          typeof social.instagram === 'string' ? social.instagram : '',
        tiktok: typeof social.tiktok === 'string' ? social.tiktok : '',
        ga:
          typeof analytics.ga === 'string' && analytics.ga
            ? analytics.ga
            : DEFAULT_PUBLIC_SITE_SETTINGS.ga,
        gtm: typeof analytics.gtm === 'string' ? analytics.gtm : ''
      };
    } catch {
      return DEFAULT_PUBLIC_SITE_SETTINGS;
    }
  },
  ['site-settings'],
  { tags: ['site-settings'] }
);

export async function getSiteSettings(): Promise<PublicSiteSettings> {
  return loadSiteSettings();
}
