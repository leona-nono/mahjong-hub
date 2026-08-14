/**
 * Solitaire tile catalogue (144-tile Shanghai set) + match rules + art keys.
 * Independent of four-player scoring; reuses the shared Tile string ids.
 */

import {
  BONUS_TILES,
  tileFromIndex,
  type Tile
} from '../mahjong/tiles';

/** Seasons (春夏秋冬) — any two match. */
export const SEASON_TILES: Tile[] = ['f1', 'f2', 'f3', 'f4'];
/** Flowers (梅兰竹菊) — any two match. */
export const FLOWER_TILES: Tile[] = ['f5', 'f6', 'f7', 'f8'];

export type MatchGroup = 'exact' | 'season' | 'flower';

export function matchGroup(tile: Tile): MatchGroup {
  if (SEASON_TILES.includes(tile)) return 'season';
  if (FLOWER_TILES.includes(tile)) return 'flower';
  return 'exact';
}

/** Shanghai pairing: identical faces, or any two seasons, or any two flowers. */
export function canMatchTiles(a: Tile, b: Tile): boolean {
  const ga = matchGroup(a);
  const gb = matchGroup(b);
  if (ga === 'season' && gb === 'season') return true;
  if (ga === 'flower' && gb === 'flower') return true;
  return a === b;
}

/**
 * Full 144-tile multiset: 4× each of 34 suited/honours + 8 unique bonus tiles.
 */
export function buildWall144(): Tile[] {
  const wall: Tile[] = [];
  for (let i = 0; i < 34; i += 1) {
    const t = tileFromIndex(i);
    for (let c = 0; c < 4; c += 1) wall.push(t);
  }
  for (const t of BONUS_TILES) wall.push(t);
  return wall;
}

/** Art filename stem under /assets/mahjong-solitaire/tiles/ */
export function artKeyForTile(tile: Tile): string {
  const suit = tile[0];
  const rank = Number(tile.slice(1));
  if (suit === 'm') return `man-${String(rank).padStart(2, '0')}`;
  if (suit === 'p') return `pin-${String(rank).padStart(2, '0')}`;
  if (suit === 's') return `sou-${String(rank).padStart(2, '0')}`;
  if (suit === 'z') {
    const map = [
      'wind-e',
      'wind-s',
      'wind-w',
      'wind-n',
      'dragon-white',
      'dragon-green',
      'dragon-red'
    ];
    return map[rank - 1] ?? 'wind-e';
  }
  if (suit === 'f') {
    const map = [
      'season-spring',
      'season-summer',
      'season-autumn',
      'season-winter',
      'flower-plum',
      'flower-orchid',
      'flower-bamboo',
      'flower-chrys'
    ];
    return map[rank - 1] ?? 'season-spring';
  }
  return 'man-01';
}

export function tileArtSrc(tile: Tile): string {
  return `/assets/mahjong-solitaire/tiles/${artKeyForTile(tile)}.svg`;
}

export function tileBackSrc(): string {
  return '/assets/mahjong-solitaire/backs/default.svg';
}

/** Free undos granted each level before points/ads (design P0). */
export const FREE_UNDO_PER_LEVEL = 3;
