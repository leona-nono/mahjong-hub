import type { GameCategory, GameConfig } from '@/data/games';

const CATEGORY_COVER: Record<GameCategory, string> = {
  solitaire: '/covers/solitaire.svg',
  connect: '/covers/connect.svg',
  mahjong: '/covers/mahjong.svg',
  'tile-match': '/covers/tile-match.svg',
  'four-player': '/covers/four-player.svg'
};

/** Approved catalogue stills — used by /games hubs and the homepage cards. */
export const CATALOG_COVER: Record<string, string> = {
  'mahjong-connect-classic': '/images/catalog/solitaire/mahjong-connect.png',
  'mahjong-solitaire-classic': '/images/catalog/solitaire/mahjong-solitaire-classic.png',
  'mahjong-connect': '/images/catalog/solitaire/mahjong-connect-lite.png',
  'mahjong-classic': '/images/catalog/solitaire/mahjong-classic.png',
  'mahjong-solitaire': '/images/catalog/solitaire/mahjong-connect-pipe.png',
  'mahjong-3d': '/images/catalog/solitaire/mahjong-3d.png',
  'onet-connect-classic': '/images/catalog/solitaire/onet-connect-classic.png',
  'bee-connect': '/images/catalog/solitaire/bee-connect.png',
  'aloha-mahjong': '/images/catalog/solitaire/aloha-mahjong.png',
  '8x8-match-tiles': '/images/catalog/solitaire/8x8-match-tiles.png',
  'tile-guru': '/images/catalog/solitaire/tile-guru.png',
  'tile-journey': '/images/catalog/solitaire/tile-journey.png',
  'american-mahjong': '/images/catalog/classic/american-mahjong.png',
  'riichi-mahjong': '/images/catalog/classic/riichi-mahjong.png',
  'chinese-official-mahjong': '/images/catalog/classic/chinese-official-mahjong.png',
  'hong-kong-mahjong': '/images/catalog/classic/hong-kong-mahjong.png',
  'taiwan-mahjong': '/images/catalog/classic/taiwan-mahjong.png',
  'sichuan-mahjong': '/images/catalog/classic/sichuan-mahjong.png'
};

export function catalogCover(slug: string): string | undefined {
  return CATALOG_COVER[slug];
}

/**
 * Prefer the approved catalogue still, then an explicit cover, then native
 * tile art / category placeholder. Catalogue art must win so the homepage
 * (GameCard) matches /games (CatalogGameCard) instead of leftover tile PNGs.
 */
export function resolveGameCover(
  game: Pick<GameConfig, 'slug' | 'cover' | 'category' | 'native'>
): string {
  const catalog = catalogCover(game.slug);
  if (catalog) return catalog;
  if (game.cover) return game.cover;
  if (game.native === 'mahjong-solitaire') {
    return '/assets/mahjong-solitaire/tiles/dragon-green.png';
  }
  if (game.native === 'mahjong-connect') {
    return '/assets/mahjong-solitaire/tiles/pin-05.png';
  }
  if (
    game.native === 'mahjong-table' ||
    game.native === 'american-mahjong' ||
    game.native === 'regional-mahjong'
  ) {
    return '/assets/mahjong-solitaire/tiles/wind-e.png';
  }
  return CATEGORY_COVER[game.category] ?? CATEGORY_COVER.mahjong;
}
