import 'server-only';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';
import { applySeoTemplate, clipSeo } from '@/lib/seo-templates';

export interface PublicSiteSettings {
  siteTitle: string;
  siteDescription: string;
  defaultLocale: string;
  ogImage: string;
  titleTemplate: string;
  homeH1: string;
  homeSubtitle: string;
  gameTitleTemplate: string;
  gameDescriptionTemplate: string;
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
  titleTemplate: '{page} | {brand}',
  homeH1: 'Free Mahjong Games Online',
  homeSubtitle: 'Mahjong Hub · Rainbow Mahjong Games',
  gameTitleTemplate: '{game} | {brand}',
  gameDescriptionTemplate:
    'Play {game} free online at {brand}. Instant play in your browser — no download required. {summary}',
  facebook: '',
  x: '',
  instagram: '',
  tiktok: '',
  ga: 'G-61V8MK15S6',
  gtm: ''
};

function pickString(
  source: Record<string, unknown>,
  key: string,
  fallback: string
): string {
  const value = source[key];
  return typeof value === 'string' && value.trim() ? value : fallback;
}

const loadSiteSettings = unstable_cache(
  async (): Promise<PublicSiteSettings> => {
    try {
      const rows = await prisma.siteSetting.findMany({
        where: { key: { in: ['site', 'social', 'analytics', 'seo'] } }
      });
      const byKey = new Map(
        rows.map((row) => [row.key, (row.value ?? {}) as Record<string, unknown>])
      );
      const site = byKey.get('site') ?? {};
      const seo = byKey.get('seo') ?? {};
      const social = byKey.get('social') ?? {};
      const analytics = byKey.get('analytics') ?? {};

      return {
        siteTitle: pickString(site, 'siteTitle', DEFAULT_PUBLIC_SITE_SETTINGS.siteTitle),
        siteDescription: pickString(
          site,
          'siteDescription',
          DEFAULT_PUBLIC_SITE_SETTINGS.siteDescription
        ),
        defaultLocale: pickString(
          site,
          'defaultLocale',
          DEFAULT_PUBLIC_SITE_SETTINGS.defaultLocale
        ),
        ogImage: pickString(site, 'ogImage', DEFAULT_PUBLIC_SITE_SETTINGS.ogImage),
        titleTemplate: pickString(
          { ...site, ...seo },
          'titleTemplate',
          DEFAULT_PUBLIC_SITE_SETTINGS.titleTemplate
        ),
        homeH1: pickString({ ...site, ...seo }, 'homeH1', DEFAULT_PUBLIC_SITE_SETTINGS.homeH1),
        homeSubtitle: pickString(
          { ...site, ...seo },
          'homeSubtitle',
          DEFAULT_PUBLIC_SITE_SETTINGS.homeSubtitle
        ),
        gameTitleTemplate: pickString(
          { ...site, ...seo },
          'gameTitleTemplate',
          DEFAULT_PUBLIC_SITE_SETTINGS.gameTitleTemplate
        ),
        gameDescriptionTemplate: pickString(
          { ...site, ...seo },
          'gameDescriptionTemplate',
          DEFAULT_PUBLIC_SITE_SETTINGS.gameDescriptionTemplate
        ),
        facebook: typeof social.facebook === 'string' ? social.facebook : '',
        x: typeof social.x === 'string' ? social.x : '',
        instagram: typeof social.instagram === 'string' ? social.instagram : '',
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

export function brandName(site: PublicSiteSettings): string {
  return site.siteTitle.split('·')[0].trim() || site.siteTitle;
}

export function formatPageTitle(site: PublicSiteSettings, page: string): string {
  return clipSeo(
    applySeoTemplate(site.titleTemplate, {
      page,
      brand: brandName(site),
      siteTitle: site.siteTitle
    }),
    70
  );
}

export function formatHomeMetadata(site: PublicSiteSettings): {
  title: string;
  description: string;
} {
  return {
    title: clipSeo(site.siteTitle, 70),
    description: clipSeo(site.siteDescription, 160)
  };
}

export function formatGameMetadata(
  site: PublicSiteSettings,
  game: { title: string; description: string }
): { title: string; description: string } {
  const brand = brandName(site);
  return {
    title: clipSeo(
      applySeoTemplate(site.gameTitleTemplate, {
        game: game.title,
        brand,
        siteTitle: site.siteTitle
      }),
      70
    ),
    description: clipSeo(
      applySeoTemplate(site.gameDescriptionTemplate, {
        game: game.title,
        brand,
        siteTitle: site.siteTitle,
        summary: game.description
      }),
      160
    )
  };
}
