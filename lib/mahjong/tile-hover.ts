import { isBonusTile, normalTile, tileFace, tileName, tileRank, tileSuit, type Tile } from './tiles';

const CN_RANK = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const US_SUIT = { m: 'Crak', p: 'Dot', s: 'Bam' } as const;
const CN_SUIT = { m: '万', p: '筒', s: '条' } as const;

/** Visible hover label. US suit words stay Crak / Dot / Bam. */
export function tileHoverName(tile: Tile): string {
  if (isBonusTile(tile)) return `${tileFace(tile)} · ${tileName(tile)}`;
  const kind = normalTile(tile);
  const suit = tileSuit(kind);
  if (suit === 'z') return `${tileFace(tile)} · ${tileName(tile)}`;
  const rank = tileRank(kind);
  return `${CN_RANK[rank]}${CN_SUIT[suit]} · ${rank} ${US_SUIT[suit]}`;
}
