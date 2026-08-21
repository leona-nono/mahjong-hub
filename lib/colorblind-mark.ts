import type { Tile } from '@/lib/mahjong/tiles';

/**
 * Suit letter + rank (or honour abbreviation) so tiles stay distinct
 * without relying on color alone (P0-D1 dual encoding).
 */
export function colorblindMark(tile: Tile): { suit: string; rank: string } {
  const suit = tile[0];
  const raw = tile.slice(1);
  const rank = raw === '0' ? '5' : raw;
  if (suit === 'm') return { suit: 'C', rank };
  if (suit === 'p') return { suit: 'D', rank };
  if (suit === 's') return { suit: 'B', rank };
  if (suit === 'z') {
    const honours = ['E', 'S', 'W', 'N', 'Wh', 'G', 'R'];
    const i = Number(raw) - 1;
    return { suit: honours[i] ?? 'H', rank: '' };
  }
  if (suit === 'f') {
    const n = Number(raw);
    return { suit: n <= 4 ? 'Sn' : 'Fl', rank: String(n) };
  }
  return { suit: '?', rank };
}

export function colorblindLabel(tile: Tile): string {
  const m = colorblindMark(tile);
  return m.rank ? `${m.suit}${m.rank}` : m.suit;
}
