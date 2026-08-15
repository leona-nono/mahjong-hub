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

const SIZE_PX: Record<SolitaireTileSize, { w: number; h: number }> = {
  sm: { w: 36, h: 48 },
  md: { w: 42, h: 56 },
  lg: { w: 56, h: 74 }
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
  const px = SIZE_PX[size];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={tileArtSrc(tile)}
      alt=""
      width={px.w}
      height={px.h}
      draggable={false}
      decoding="async"
      loading="eager"
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
