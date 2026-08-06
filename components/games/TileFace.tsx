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
  // The cutter contact sheet is ordered by suit: bamboo, characters, dots,
  // winds/dragons, then flowers and blanks. Every face is a unique source file.
  m1: '004.png', m2: '005.png', m3: '006.png', m4: '010.png', m5: '011.png', m6: '012.png', m7: '016.png', m8: '017.png', m9: '018.png',
  p1: '019.png', p2: '020.png', p3: '021.png', p4: '025.png', p5: '026.png', p6: '027.png', p7: '032.png', p8: '033.png', p9: '034.png',
  s1: '002.png', s2: '003.png', s3: '007.png', s4: '008.png', s5: '009.png', s6: '013.png', s7: '014.png', s8: '015.png', s9: '001.png',
  z1: '022.png', z2: '023.png', z3: '024.png', z4: '039.png', z5: '042.png', z6: '041.png', z7: '040.png'
};

function traditionalTileSrc(tile: Tile): string {
  const file = TRADITIONAL_TILE_FILES[tile];
  return file
    ? '/assets/mahjong-hongkong/tiles/' + file
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
