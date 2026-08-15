'use client';

import { useCallback } from 'react';

import MahjongTable from './MahjongTable';
import MahjongConnect from './MahjongConnect';
import MahjongSolitaire from './MahjongSolitaire';
import AmericanMahjongTable from './AmericanMahjongTable';
import { trackMahjongEvent } from '@/lib/mahjong/telemetry';
import type { NativeGame, NativeRuleset } from '@/data/games';

export interface NativeGameMountProps {
  native: NativeGame;
  ruleset?: NativeRuleset;
  slug: string;
  /** Solitaire: open on daily / campaign / teach id */
  defaultLevelId?: string;
}

/**
 * Mounts an in-house game. A browser-only result must never mint account value:
 * points are reserved for a future server-verified settlement receipt. Keeping
 * this wrapper thin means the game components stay pure and reusable.
 */
export default function NativeGameMount({
  native,
  ruleset,
  slug,
  defaultLevelId
}: NativeGameMountProps) {
  const handleWin = useCallback((points: number) => {
    trackMahjongEvent('mahjong_hand_completed', { game: slug, displayed_points: Math.min(Math.max(points, 1), 50) });
  }, [slug]);

  if (native === 'mahjong-table') {
    return <MahjongTable defaultRuleset={ruleset ?? 'hongkong'} onWin={handleWin} />;
  }

  if (native === 'american-mahjong') {
    return <AmericanMahjongTable onWin={handleWin} />;
  }

  if (native === 'mahjong-connect') {
    return <MahjongConnect onWin={handleWin} />;
  }

  if (native === 'mahjong-solitaire') {
    // Campaign/daily points go through /api/solitaire/complete (not the generic cap).
    return <MahjongSolitaire defaultLevelId={defaultLevelId} />;
  }

  return null;
}
