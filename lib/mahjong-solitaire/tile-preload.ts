/**
 * Warm solitaire tile art in the browser decode cache so level switches
 * do not wait on PNG/SVG network + decode for ~36 faces × many copies.
 */

'use client';

import { useEffect } from 'react';
import { tileFromIndex, BONUS_TILES, type Tile } from '@/lib/mahjong/tiles';
import { tileArtSrc } from './tiles';

/** One URL per distinct face (34 suited/honours + 8 bonus). */
export const SOLITAIRE_TILE_SRCS: string[] = (() => {
  const tiles: Tile[] = [];
  for (let i = 0; i < 34; i += 1) tiles.push(tileFromIndex(i));
  for (const t of BONUS_TILES) tiles.push(t);
  return tiles.map((t) => tileArtSrc(t));
})();

const warmed = new Set<string>();

/** Fire-and-forget decode; safe to call repeatedly. */
export function warmSolitaireTileArt(srcs: string[] = SOLITAIRE_TILE_SRCS): void {
  if (typeof window === 'undefined') return;
  for (const src of srcs) {
    if (warmed.has(src)) continue;
    warmed.add(src);
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
  }
}

/** Idle-preload after the first board paints. */
export function useSolitaireTilePreload(enabled = true): void {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    const run = () => warmSolitaireTileArt();
    const idle = window.requestIdleCallback?.(run, { timeout: 800 });
    if (idle === undefined) {
      const timer = window.setTimeout(run, 40);
      return () => window.clearTimeout(timer);
    }
    return () => window.cancelIdleCallback?.(idle);
  }, [enabled]);
}
