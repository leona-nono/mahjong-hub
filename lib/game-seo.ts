import type { GameType } from '@/data/games';

/**
 * Whether a game detail URL may be indexed.
 * iframe embeds are third-party content — keep noindex (SEO scheme 1).
 */
export function isGamePageIndexable(game: { gameType: GameType }): boolean {
  return game.gameType === 'native' || game.gameType === 'coming-soon';
}
