/**
 * Shared mahjong tile spec + presets, used by TileArt (SVG rendering) and the
 * blog content so articles can decorate sections with 牌图.
 */
export type TileSuit = 'dot' | 'bamboo' | 'char' | 'wind' | 'dragon';

export interface TileSpec {
  suit: TileSuit;
  /** 1–9 for the three numbered suits. */
  rank?: number;
  /** Wind face. */
  wind?: 'east' | 'south' | 'west' | 'north';
  /** Dragon face. */
  dragon?: 'red' | 'green' | 'white';
}

const dot = (rank: number): TileSpec => ({ suit: 'dot', rank });
const bamboo = (rank: number): TileSpec => ({ suit: 'bamboo', rank });
const char = (rank: number): TileSpec => ({ suit: 'char', rank });
const wind = (w: TileSpec['wind']): TileSpec => ({ suit: 'wind', wind: w });
const dragon = (d: TileSpec['dragon']): TileSpec => ({ suit: 'dragon', dragon: d });

/** Suit tiles for a section row: a triplet of 2·3·4 dots. */
export const SEQ_DOT_234 = [dot(2), dot(3), dot(4)];
export const SEQ_BAMBOO_678 = [bamboo(6), bamboo(7), bamboo(8)];
export const SEQ_CHAR_123 = [char(1), char(2), char(3)];
export const TRIPLET_DOTS = [dot(5), dot(5), dot(5)];
export const TRIPLET_DRAGONS = [dragon('red'), dragon('green'), dragon('white')];
export const FOUR_WINDS = [wind('east'), wind('south'), wind('west'), wind('north')];
export const HONOURS = [wind('east'), wind('south'), dragon('red'), dragon('green'), dragon('white')];
export const DOT_ALL = [dot(1), dot(2), dot(3), dot(4), dot(5), dot(6), dot(7), dot(8), dot(9)];
export const SUITS_ALL = [char(1), bamboo(1), dot(1)];
