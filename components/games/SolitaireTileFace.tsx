'use client';

import type { Tile } from '@/lib/mahjong/tiles';
import { tileArtSrc } from '@/lib/mahjong-solitaire/art';
import { matchGroup } from '@/lib/mahjong-solitaire/tiles';
import { colorblindLabel } from '@/lib/colorblind-mark';

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

function lookalikeRank(tile: Tile): 6 | 9 | null {
  const suit = tile[0];
  if (suit !== 'm' && suit !== 'p' && suit !== 's') return null;
  const rank = Number(tile.slice(1));
  if (rank === 6 || rank === 9) return rank;
  return null;
}

/** Solitaire faces from /assets/mahjong-solitaire/tiles/ (not 4P traditional). */
export default function SolitaireTileFace({
  tile,
  size = 'md',
  selected,
  hinted,
  dimmed,
  colorblind
}: {
  tile: Tile;
  size?: SolitaireTileSize;
  selected?: boolean;
  hinted?: boolean;
  dimmed?: boolean;
  colorblind?: boolean;
}) {
  const group = matchGroup(tile);
  const px = SIZE_PX[size];
  const mark = lookalikeRank(tile);
  return (
    <span
      data-mahjong-tile
      className={[
        'relative inline-block',
        SIZE_CLASS[size],
        selected ? 'ring-2 ring-amber-400 rounded-md' : '',
        hinted ? 'ring-2 ring-sky-400 rounded-md' : '',
        dimmed ? 'opacity-55 saturate-50' : ''
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tileArtSrc(tile)}
        alt=""
        width={px.w}
        height={px.h}
        draggable={false}
        decoding="async"
        loading="eager"
        data-match-group={group}
        className="h-full w-full rounded-md object-cover shadow-sm select-none"
      />
      {mark !== null && (
        <span className="solitaire-lookalike-mark" aria-hidden>
          {mark}
        </span>
      )}
      {colorblind && (
        <span
          className="pointer-events-none absolute bottom-0 left-0 rounded-bl-md rounded-tr-sm bg-slate-950/80 px-0.5 text-[9px] font-black leading-tight text-amber-100"
          aria-hidden
        >
          {colorblindLabel(tile)}
        </span>
      )}
    </span>
  );
}
