'use client';

import { tileFace, tileName, tileRank, tileSuit, type Tile } from '@/lib/mahjong/tiles';

export type TileSize = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<TileSize, string> = {
  sm: 'h-9 w-7 text-xs rounded-md',
  md: 'h-14 w-10 text-lg rounded-lg',
  lg: 'h-[4.5rem] w-14 text-2xl rounded-xl'
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
  /** Uses the supplied traditional Chinese tile photographs. */
  traditional?: boolean;
}

const TRADITIONAL_TILE_FILES: Record<Tile, string> = {
  m1: 'tile-04.png', m2: 'tile-05.png', m3: 'tile-06.png',
  m4: 'tile-10.png', m5: 'tile-11.png', m6: 'tile-12.png',
  m7: 'tile-16.png', m8: 'tile-17.png', m9: 'tile-18.png',
  p1: 'tile-19.png', p2: 'tile-20.png', p3: 'tile-21.png',
  p4: 'tile-25.png', p5: 'tile-26.png', p6: 'tile-27.png',
  p7: 'tile-32.png', p8: 'tile-33.png', p9: 'tile-34.png',
  s1: 'tile-02.png', s2: 'tile-03.png', s3: 'tile-07.png',
  s4: 'tile-08.png', s5: 'tile-09.png', s6: 'tile-13.png',
  s7: 'tile-14.png', s8: 'tile-15.png', s9: 'tile-01.png',
  z1: 'tile-22.png', z2: 'tile-23.png', z3: 'tile-24.png',
  z4: 'tile-39.png', z5: 'tile-42.png', z6: 'tile-41.png', z7: 'tile-40.png'
};

function traditionalTileSrc(tile: Tile): string {
  const file = TRADITIONAL_TILE_FILES[tile];
  return file
    ? '/assets/mahjong-chinese/source-5-crops/' + file
    : '/assets/mahjong-chinese/source-5-crops/tile-42.png';
}
export default function TileFace({
  tile,
  size = 'md',
  onClick,
  disabled,
  highlight,
  muted,
  traditional = false
}: TileFaceProps) {
  const suit = tileSuit(tile);
  const interactive = Boolean(onClick) && !disabled;
  const face = traditional ? <img src={traditionalTileSrc(tile)} alt="" className="block h-full w-full object-contain" draggable={false} /> : tileFace(tile);

  const classes = [
    'inline-flex select-none items-center justify-center border-2 font-bold shadow-[0_3px_0_rgba(148,163,184,.35),0_7px_12px_rgba(15,23,42,.12)] transition duration-150',
    SIZE_CLASS[size],
    SUIT_CLASS[suit] ?? 'text-gray-700',
    muted ? 'border-slate-200 bg-slate-100 opacity-45 saturate-50' : 'border-slate-200 bg-gradient-to-b from-white to-slate-50',
    highlight ? 'ring-2 ring-amber-400 -translate-y-2 shadow-[0_0_0_4px_rgba(251,191,36,.18)]' : '',
    interactive
      ? 'cursor-pointer hover:-translate-y-2 hover:border-sky-300 hover:shadow-[0_10px_18px_rgba(14,165,233,.2)] active:translate-y-0'
      : '',
    disabled ? 'cursor-not-allowed opacity-40 saturate-50' : ''
  ]
    .filter(Boolean)
    .join(' ');

  if (!interactive) {
    return (
      <span className={classes} role="img" aria-label={tileName(tile)}>
        {face}
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
      {face}
    </button>
  );
}

/** Face-down tile, used for opponents' concealed hands and the wall. */
export function TileBack({ size = 'md' }: { size?: TileSize }) {
  return (
    <span
      className={`inline-block border-2 border-emerald-200/70 bg-[linear-gradient(135deg,#34d399,#0f766e)] shadow-[inset_0_0_0_2px_rgba(255,255,255,.18),0_3px_6px_rgba(15,118,110,.28)] ${SIZE_CLASS[size]}`}
      aria-hidden="true"
    />
  );
}
