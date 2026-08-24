import type { GameCategory, GameConfig } from '@/data/games';

const CATEGORY_COVER: Record<GameCategory, string> = {
  solitaire: '/covers/solitaire.svg',
  connect: '/covers/connect.svg',
  mahjong: '/covers/mahjong.svg',
  'tile-match': '/covers/tile-match.svg',
  'four-player': '/covers/four-player.svg'
};

/** Prefer explicit cover, then native tile art, then category placeholder. */
export function resolveGameCover(game: Pick<GameConfig, 'cover' | 'category' | 'native'>): string {
  if (game.cover) return game.cover;
  if (game.native === 'mahjong-solitaire') {
    return '/assets/mahjong-solitaire/tiles/dragon-green.png';
  }
  if (game.native === 'mahjong-connect') {
    return '/assets/mahjong-solitaire/tiles/pin-05.png';
  }
  if (game.native === 'mahjong-table' || game.native === 'american-mahjong' || game.native === 'regional-mahjong') {
    return '/assets/mahjong-solitaire/tiles/wind-e.png';
  }
  return CATEGORY_COVER[game.category] ?? CATEGORY_COVER.mahjong;
}
