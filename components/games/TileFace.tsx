'use client';

import { useEffect } from 'react';
import { isBonusTile, isRedFive, normalTile, tileFace, tileName, tileRank, tileSuit, type Tile } from '@/lib/mahjong/tiles';

export type TileSize = 'xs' | 'sm' | 'md' | 'lg' | 'table' | 'xl';

const SIZE_CLASS: Record<TileSize, string> = {
  sm: 'h-9 w-7 text-xs rounded-md',
  xs: 'h-10 w-6 text-[10px] rounded',
  md: 'h-14 w-10 text-lg rounded-lg',
  lg: 'h-[4.5rem] w-14 text-2xl rounded-xl',
  table: 'h-12 w-9 text-sm rounded-md',
  xl: 'h-24 w-[4.25rem] text-3xl rounded-lg'
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
  // Exact source order in majiangmeishuziyuan1: Characters, Dots,
  // Bamboo, Winds, then Dragons. Flowers and Seasons are never mapped.
  m1: '001.png', m2: '002.png', m3: '003.png', m4: '004.png', m5: '005.png', m6: '006.png', m7: '007.png', m8: '008.png', m9: '009.png',
  p1: '010.png', p2: '011.png', p3: '012.png', p4: '013.png', p5: '014.png', p6: '015.png', p7: '016.png', p8: '017.png', p9: '018.png',
  s1: '019.png', s2: '020.png', s3: '021.png', s4: '022.png', s5: '023.png', s6: '024.png', s7: '025.png', s8: '026.png', s9: '027.png',
  z1: '028.png', z2: '029.png', z3: '030.png', z4: '031.png',
  z5: '034.png', z6: '033.png', z7: '032.png',
  // Existing project-owned artwork: Spring/Summer/Autumn/Winter, then
  // Plum/Orchid/Bamboo/Chrysanthemum. These are only enabled by MCR.
  f1: '037.png', f2: '038.png', f3: '039.png', f4: '040.png',
  f5: '041.png', f6: '042.png', f7: '043.png', f8: '044.png'
};

function traditionalTilePngSrc(tile: Tile): string {
  const file = TRADITIONAL_TILE_FILES[tile];
  return file
    ? `/assets/mahjong-hongkong/${isBonusTile(tile) ? 'tiles' : 'tiles-display'}/` + file
    : '/assets/mahjong-chinese/source-5-crops/tile-42.png';
}

function traditionalTileWebpSrc(tile: Tile): string {
  const file = TRADITIONAL_TILE_FILES[tile];
  return file && !isBonusTile(tile)
    ? '/assets/mahjong-hongkong/tiles-webp-v1/' + file.replace(/\.png$/, '.webp')
    : traditionalTilePngSrc(tile);
}

const TRADITIONAL_TILE_SRCS = Object.keys(TRADITIONAL_TILE_FILES).map((tile) => traditionalTileWebpSrc(tile));

/** Warm the browser's decoded image cache after the table becomes interactive. */
export function useTraditionalTilePreload(enabled = true): void {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    const warm = () => {
      for (const src of TRADITIONAL_TILE_SRCS) {
        const image = new Image();
        image.decoding = 'async';
        image.src = src;
      }
    };
    const idle = window.requestIdleCallback?.(warm, { timeout: 1200 });
    if (idle === undefined) {
      const timer = window.setTimeout(warm, 180);
      return () => window.clearTimeout(timer);
    }
    return () => window.cancelIdleCallback?.(idle);
  }, [enabled]);
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
  // A red five shares the five's artwork; the red is carried by the frame.
  const art = normalTile(tile);
  const face = traditional ? (
    <picture>
      {!isBonusTile(art) && <source srcSet={traditionalTileWebpSrc(art)} type="image/webp" />}
      <img
        src={traditionalTilePngSrc(art)}
        alt=""
        width={150}
        height={210}
        className="block h-full w-full object-contain"
        decoding="async"
        fetchPriority={highlight ? 'high' : 'auto'}
        draggable={false}
      />
    </picture>
  ) : tileFace(tile);

  const classes = [
    'inline-flex select-none items-center justify-center border-2 font-bold shadow-[0_3px_0_rgba(148,163,184,.35),0_7px_12px_rgba(15,23,42,.12)] transition duration-150',
    SIZE_CLASS[size],
    SUIT_CLASS[suit] ?? 'text-gray-700',
    muted ? 'border-slate-200 bg-slate-100 opacity-45 saturate-50' : 'border-slate-200 bg-gradient-to-b from-white to-slate-50',
    isRedFive(tile) && !muted ? 'border-rose-400 shadow-[inset_0_0_0_2px_rgba(244,63,94,.35)]' : '',
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
      <span data-mahjong-tile className={classes} role="img" aria-label={tileName(tile)}>
        {face}
      </span>
    );
  }

  return (
    <button
      type="button"
      data-mahjong-tile
      className={classes}
      onClick={() => onClick?.(tile)}
      aria-label={tileName(tile)}
    >
      {face}
    </button>
  );
}

/** Face-down tile, used for opponents' concealed hands and the wall. */
export function TileBack({ size = 'md', className = '' }: { size?: TileSize; className?: string }) {
  return (
    <span
      data-mahjong-tile
      className={`inline-block border-2 border-emerald-200/70 bg-[image:var(--mahjong-tile-back-image)] bg-cover bg-center shadow-[inset_0_0_0_2px_rgba(255,255,255,.18),0_3px_6px_rgba(15,118,110,.28)] ${SIZE_CLASS[size]} ${className}`}
      aria-hidden="true"
    />
  );
}
