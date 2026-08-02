'use client';

import { tileFace, tileName, tileSuit, type Tile } from '@/lib/mahjong/tiles';

export type TileSize = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<TileSize, string> = {
  sm: 'h-8 w-6 text-[11px] rounded-md',
  md: 'h-12 w-9 text-base rounded-lg',
  lg: 'h-16 w-12 text-xl rounded-xl'
};

/** Each suit gets its own colour so the board reads at a glance on mobile. */
const SUIT_CLASS: Record<string, string> = {
  m: 'text-rose-500',
  p: 'text-sky-500',
  s: 'text-emerald-500',
  z: 'text-violet-500'
};

export interface TileFaceProps {
  tile: Tile;
  size?: TileSize;
  /** Renders the tile as clickable and wires up the handler. */
  onClick?: (tile: Tile) => void;
  disabled?: boolean;
  /** Visually lifts the tile, used for the freshly drawn tile. */
  highlight?: boolean;
  /** Dims the tile, used for tiles already in the discard pool. */
  muted?: boolean;
}

export default function TileFace({
  tile,
  size = 'md',
  onClick,
  disabled,
  highlight,
  muted
}: TileFaceProps) {
  const suit = tileSuit(tile);
  const interactive = Boolean(onClick) && !disabled;

  const classes = [
    'inline-flex select-none items-center justify-center border font-bold shadow-sm transition',
    SIZE_CLASS[size],
    SUIT_CLASS[suit] ?? 'text-gray-700',
    muted ? 'border-gray-200 bg-gray-50 opacity-70' : 'border-gray-200 bg-white',
    highlight ? 'ring-2 ring-amber-300 -translate-y-1' : '',
    interactive
      ? 'cursor-pointer hover:-translate-y-1.5 hover:shadow-md active:translate-y-0'
      : '',
    disabled ? 'opacity-50' : ''
  ]
    .filter(Boolean)
    .join(' ');

  if (!interactive) {
    return (
      <span className={classes} role="img" aria-label={tileName(tile)}>
        {tileFace(tile)}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      onClick={() => onClick?.(tile)}
      aria-label={tileName(tile)}
    >
      {tileFace(tile)}
    </button>
  );
}

/** Face-down tile, used for opponents' concealed hands and the wall. */
export function TileBack({ size = 'md' }: { size?: TileSize }) {
  return (
    <span
      className={`inline-block border border-emerald-300/60 bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm ${SIZE_CLASS[size]}`}
      aria-hidden="true"
    />
  );
}
