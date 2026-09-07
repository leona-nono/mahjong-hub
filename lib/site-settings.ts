import 'server-only';
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

/**
 * Public-page settings — defaults + optional NEXT_PUBLIC_* env overrides.
 * No Prisma / CMS (ops admin removed). Redeploy to change branding.
 */
export function getPublicSiteSettings(): PublicSiteSettings {
  return {
    ...DEFAULT_PUBLIC_SITE_SETTINGS,
    siteTitle:
      process.env.NEXT_PUBLIC_SITE_TITLE?.trim() ||
      DEFAULT_PUBLIC_SITE_SETTINGS.siteTitle,
    siteDescription:
      process.env.NEXT_PUBLIC_SITE_DESCRIPTION?.trim() ||
      DEFAULT_PUBLIC_SITE_SETTINGS.siteDescription,
    ogImage:
      process.env.NEXT_PUBLIC_OG_IMAGE?.trim() ||
      DEFAULT_PUBLIC_SITE_SETTINGS.ogImage,
    ga:
      process.env.NEXT_PUBLIC_GA_ID?.trim() ||
      DEFAULT_PUBLIC_SITE_SETTINGS.ga,
    gtm:
      process.env.NEXT_PUBLIC_GTM_ID?.trim() ||
      DEFAULT_PUBLIC_SITE_SETTINGS.gtm
  };
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
