/**
 * Canonical artwork for the photographic tile faces.
 *
 * Single source of truth shared by the in-game tile renderer
 * (`components/games/TileFace.tsx`) and the blog article 牌图 rows
 * (`components/blog/ArticleTiles.tsx`). Keeping the paths here means a tile can
 * never show one picture on the table and a different one inside an article.
 *
 * Deliberately NOT a client module: the blog renders tiles on the server, so
 * these helpers must be callable outside a client boundary.
 */
import { isBonusTile, normalTile, type Tile } from './tiles';

/** Cache-buster for the exported artwork files. Bump when the art is re-cut. */
export const TILE_ART_VERSION = '20260911';

/**
 * Photo tiles already include their own rim, so the rendered box must stay at
 * the artwork's ~5:7 ratio — otherwise `object-cover` crops the frame away.
 */
export type TilePhotoSize = 'xs' | 'sm' | 'md' | 'lg' | 'table' | 'xl';

export const TILE_ART_SIZE: Record<TilePhotoSize, string> = {
  sm: 'h-9 w-[1.61rem] rounded-sm',
  xs: 'h-10 w-[1.79rem] rounded-sm',
  md: 'h-14 w-10 rounded-md',
  lg: 'h-[4.5rem] w-[3.21rem] rounded-md',
  table: 'h-12 w-[2.14rem] rounded-sm',
  xl: 'h-24 w-[4.29rem] rounded-md'
};

/**
 * Exact source order in majiangmeishuziyuan1: Characters, Dots, Bamboo, Winds,
 * then Dragons. Flowers and Seasons are never mapped from the cropped set.
 */
const TILE_ART_FILES: Record<Tile, string> = {
  m1: '001.png', m2: '002.png', m3: '003.png', m4: '004.png', m5: '005.png', m6: '006.png', m7: '007.png', m8: '008.png', m9: '009.png',
  p1: '010.png', p2: '011.png', p3: '012.png', p4: '013.png', p5: '014.png', p6: '015.png', p7: '016.png', p8: '017.png', p9: '018.png',
  s1: '019.png', s2: '020.png', s3: '021.png', s4: '022.png', s5: '023.png', s6: '024.png', s7: '025.png', s8: '026.png', s9: '027.png',
  z1: '028.png', z2: '029.png', z3: '030.png', z4: '031.png',
  z5: '034.png', z6: '033.png', z7: '032.png',
  // Existing project-owned artwork: Spring/Summer/Autumn/Winter, then
  // Plum/Orchid/Bamboo/Chrysanthemum. These are only enabled by MCR.
  f1: '037.png', f2: '038.png', f3: '039.png', f4: '040.png',
  f5: '041.png', f6: '042.png', f7: '043.png', f8: '044.png'
};

/** Artwork shown when a tile has no photo of its own. */
const TILE_ART_FALLBACK = '/assets/mahjong-chinese/source-5-crops/tile-42.png';

/** Every tile kind we can draw a photo for. */
export const TILE_ART_TILES = Object.keys(TILE_ART_FILES) as Tile[];

/**
 * Red fives share the five's artwork — the red is carried by the frame — so the
 * lookup always runs on the normalised tile.
 */
function artFile(tile: Tile): string | undefined {
  return TILE_ART_FILES[normalTile(tile)];
}

/** Whether a photo exists for this tile (bonus tiles live in the other folder). */
export function hasTileArt(tile: Tile): boolean {
  return Boolean(artFile(tile));
}

export function tileArtPngSrc(tile: Tile): string {
  const kind = normalTile(tile);
  const file = artFile(kind);
  const base = file
    ? `/assets/mahjong-hongkong/${isBonusTile(kind) ? 'tiles' : 'tiles-display'}/${file}`
    : TILE_ART_FALLBACK;
  return `${base}?v=${TILE_ART_VERSION}`;
}

/** Prefers the smaller webp set, falling back to the PNG when it is not covered. */
export function tileArtWebpSrc(tile: Tile): string {
  const kind = normalTile(tile);
  const file = artFile(kind);
  return file && !isBonusTile(kind)
    ? `/assets/mahjong-hongkong/tiles-webp-v1/${file.replace(/\.png$/, '.webp')}?v=${TILE_ART_VERSION}`
    : tileArtPngSrc(kind);
}

/** Warm-up list for the browser's decoded image cache. */
export const TILE_ART_SRCS: string[] = TILE_ART_TILES.map((tile) => tileArtWebpSrc(tile));
