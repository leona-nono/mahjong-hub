import { describe, expect, it } from 'vitest';
import {
  LANGUAGE_ALTERNATES,
  SITE_BASE_URL,
  absoluteUrl,
  alternatesFor,
  pageMeta,
  socialShareMeta
} from '@/lib/seo';
import { homeJsonLd } from '@/lib/home-jsonld';
import { DEFAULT_PUBLIC_SITE_SETTINGS } from '@/lib/site-settings';

describe('homepage SEO consolidation', () => {
  it('points English canonical and x-default at /en', () => {
    const alts = alternatesFor('en', '');
    expect(alts.canonical).toBe(`${SITE_BASE_URL}/en`);
    expect(alts.languages?.['x-default']).toBe(`${SITE_BASE_URL}/en`);
    expect(LANGUAGE_ALTERNATES['x-default']).toBe(`${SITE_BASE_URL}/en`);
  });

  it('gives each locale its own self-canonical home URL', () => {
    for (const locale of ['en', 'fr', 'de', 'es', 'pt-BR', 'zh', 'ja', 'ko']) {
      const alts = alternatesFor(locale, '');
      expect(alts.canonical).toBe(`${SITE_BASE_URL}/${locale}`);
    }
  });

  it('emits absolute OG/Twitter image URLs', () => {
    const share = socialShareMeta({
      title: 'Play free mahjong games',
      description: 'Free mahjong online',
      locale: 'en',
      ogImage: '/og-default.png',
      siteName: 'Mahjong Hub'
    });
    expect(share.openGraph?.type).toBe('website');
    expect(share.openGraph?.url).toBe(`${SITE_BASE_URL}/en`);
    expect(share.twitter?.card).toBe('summary_large_image');
    const images = share.openGraph?.images;
    const first = Array.isArray(images) ? images[0] : images;
    expect(typeof first === 'object' && first && 'url' in first ? first.url : first).toBe(
      absoluteUrl('/og-default.png')
    );
  });

  it('builds full pageMeta with canonical, hreflang, OG url/image', () => {
    const meta = pageMeta({
      locale: 'fr',
      path: '/games',
      title: 'Jeux',
      description: 'Tous les jeux',
      ogImage: '/og-default.png',
      siteName: 'Mahjong Hub'
    });
    expect(meta.alternates?.canonical).toBe(`${SITE_BASE_URL}/fr/games`);
    expect(meta.alternates?.languages?.['x-default']).toBe(`${SITE_BASE_URL}/en/games`);
    expect(meta.alternates?.languages?.de).toBe(`${SITE_BASE_URL}/de/games`);
    expect(meta.openGraph?.url).toBe(`${SITE_BASE_URL}/fr/games`);
    expect(meta.title).toEqual({ absolute: 'Jeux' });
    expect(meta.openGraph?.title).toBe('Jeux');
    expect(meta.twitter?.card).toBe('summary_large_image');
  });

  it('includes Organization and SoftwareApplication JSON-LD', () => {
    const nodes = homeJsonLd({
      site: DEFAULT_PUBLIC_SITE_SETTINGS,
      locale: 'fr',
      description: 'Description FR'
    });
    const types = nodes.map((n) => n['@type']);
    expect(types).toContain('Organization');
    expect(types).toContain('SoftwareApplication');
    expect(types).toContain('WebSite');
    const app = nodes.find((n) => n['@type'] === 'SoftwareApplication')!;
    expect(app.applicationCategory).toBe('GameApplication');
    expect(app.operatingSystem).toBe('Web');
    expect(app.description).toBe('Description FR');
    expect((app.offers as { price: string; name: string }).price).toBe('0');
    expect((app.offers as { name: string }).name).toBe('Free');
  });
});
