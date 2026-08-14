'use client';

import type { Tile } from '@/lib/mahjong/tiles';
import { tileArtSrc } from '@/lib/mahjong-solitaire/art';
import { matchGroup } from '@/lib/mahjong-solitaire/tiles';

export type SolitaireTileSize = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<SolitaireTileSize, string> = {
  sm: 'h-12 w-9',
  md: 'h-14 w-[2.65rem]',
  lg: 'h-[4.6rem] w-14'
};

/** Solitaire faces from /assets/mahjong-solitaire/tiles/ (not 4P traditional). */
export default function SolitaireTileFace({
  tile,
  size = 'md',
  selected,
  hinted,
  dimmed
}: {
  tile: Tile;
  size?: SolitaireTileSize;
  selected?: boolean;
  hinted?: boolean;
  dimmed?: boolean;
}) {
  const group = matchGroup(tile);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={tileArtSrc(tile)}
      alt={tile}
      draggable={false}
      data-match-group={group}
      className={[
        'inline-block rounded-md object-cover shadow-sm select-none',
        SIZE_CLASS[size],
        selected ? 'ring-2 ring-amber-400' : '',
        hinted ? 'ring-2 ring-sky-400' : '',
        dimmed ? 'opacity-55 saturate-50' : ''
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
