/**
 * Blog 牌图 must be drawn with the same artwork the game table uses.
 *
 * The failure this guards against is quiet and expensive: a tile spec that maps
 * to the wrong engine id, or to a tile with no exported photo, renders a
 * *different tile* inside a teaching article. A reader cannot tell.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { BLOG_I18N } from '@/data/blog.i18n';
import type { TileSpec } from '@/data/tiles';
import {
  TILE_ART_SRCS,
  TILE_ART_TILES,
  hasTileArt,
  tileArtPngSrc,
  tileArtWebpSrc
} from '@/lib/mahjong/tile-art';
import { toEngineTile, toEngineTiles } from '@/lib/mahjong/tile-spec';
import { isBonusTile, tileIndex } from '@/lib/mahjong/tiles';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

/** `/assets/a/001.png?v=1` → `<repo>/public/assets/a/001.png` */
function artOnDisk(src: string): string {
  return path.join(PUBLIC_DIR, src.replace(/\?.*$/, ''));
}

/** Every locale the site actually ships, not just the three the tests usually cover. */
const CONTENT_LOCALES = ['en', 'zh', 'zh-TW', 'ja', 'ko', 'es', 'fr', 'de', 'pt-BR'] as const;

interface LocatedSpec {
  where: string;
  spec: TileSpec;
}

/** Every tile spec that article content can ask a renderer to draw. */
function blogTileSpecs(): LocatedSpec[] {
  const out: LocatedSpec[] = [];
  for (const locale of CONTENT_LOCALES) {
    for (const [slug, post] of Object.entries(BLOG_I18N)) {
      (post.sections?.[locale] ?? []).forEach((section, index) => {
        for (const spec of section.tiles ?? []) {
          out.push({ where: `${locale}/${slug} §${index} ${JSON.stringify(spec)}`, spec });
        }
      });
    }
  }
  return out;
}

describe('blog tiles reuse the game artwork', () => {
  it('maps a spec to the engine tile id', () => {
    expect(toEngineTile({ suit: 'char', rank: 3 })).toBe('m3');
    expect(toEngineTile({ suit: 'dot', rank: 2 })).toBe('p2');
    expect(toEngineTile({ suit: 'bamboo', rank: 9 })).toBe('s9');
    expect(toEngineTile({ suit: 'wind', wind: 'east' })).toBe('z1');
    expect(toEngineTile({ suit: 'wind', wind: 'north' })).toBe('z4');
    expect(toEngineTile({ suit: 'dragon', dragon: 'white' })).toBe('z5');
    expect(toEngineTile({ suit: 'dragon', dragon: 'green' })).toBe('z6');
    expect(toEngineTile({ suit: 'dragon', dragon: 'red' })).toBe('z7');
    expect(toEngineTiles([{ suit: 'dot', rank: 2 }, { suit: 'dot', rank: 3 }])).toEqual(['p2', 'p3']);
  });

  it('rejects a malformed spec instead of drawing the wrong face', () => {
    const bad = [
      { suit: 'dot', rank: 0 },
      { suit: 'dot', rank: 10 },
      { suit: 'dot' },
      { suit: 'char', rank: 1.5 },
      { suit: 'wind' },
      { suit: 'wind', wind: 'eastt' },
      { suit: 'dragon' },
      { suit: 'dragon', dragon: 'gold' },
      { suit: 'flower' }
    ];
    for (const spec of bad) {
      expect(() => toEngineTile(spec as TileSpec), JSON.stringify(spec)).toThrow();
    }
  });

  it('keeps the reversed dragon artwork order', () => {
    // z5/z6/z7 map to 034/033/032 — the single line that silently inverts.
    expect(tileArtPngSrc('z5')).toContain('/034.png');
    expect(tileArtPngSrc('z6')).toContain('/033.png');
    expect(tileArtPngSrc('z7')).toContain('/032.png');
    expect(tileArtPngSrc('z1')).toContain('/028.png');
  });

  it('ships a file for every tile it claims to draw', () => {
    expect(TILE_ART_TILES).toHaveLength(42);
    expect(TILE_ART_SRCS).toHaveLength(42);
    for (const tile of TILE_ART_TILES) {
      expect(hasTileArt(tile), tile).toBe(true);
      expect(existsSync(artOnDisk(tileArtPngSrc(tile))), `png ${tile}`).toBe(true);
      expect(existsSync(artOnDisk(tileArtWebpSrc(tile))), `webp ${tile}`).toBe(true);
    }
  });

  it('falls back to the png set for bonus tiles, which have no webp', () => {
    expect(isBonusTile('f1')).toBe(true);
    expect(tileArtWebpSrc('f1')).toBe(tileArtPngSrc('f1'));
    expect(tileArtPngSrc('f1')).toContain('/assets/mahjong-hongkong/tiles/');
    expect(tileArtPngSrc('p2')).toContain('/assets/mahjong-hongkong/tiles-display/');
  });

  it('draws every tile asked for by article content, in every locale', () => {
    const specs = blogTileSpecs();
    expect(specs.length).toBeGreaterThan(30);
    for (const { where, spec } of specs) {
      const tile = toEngineTile(spec);
      expect(() => tileIndex(tile), where).not.toThrow();
      expect(hasTileArt(tile), where).toBe(true);
      expect(existsSync(artOnDisk(tileArtPngSrc(tile))), where).toBe(true);
    }
  });

  it('still decorates the cornerstone articles, tiles not lost in translation', () => {
    const cornerstone = [
      'what-is-mahjong',
      'mahjong-rules-beginners-complete-guide',
      'mahjong-tiles-meaning-guide',
      'mahjong-scoring-system-explained'
    ];
    for (const locale of CONTENT_LOCALES) {
      for (const slug of cornerstone) {
        const sections = BLOG_I18N[slug]?.sections?.[locale] ?? [];
        const withTiles = sections.filter((section) => section.tiles?.length);
        expect(withTiles.length, `${locale}/${slug}`).toBeGreaterThan(0);
      }
    }
  });
});
