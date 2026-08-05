'use client';

import { useCallback } from 'react';

import MahjongTable from './MahjongTable';
import MahjongConnect from './MahjongConnect';
import MahjongSolitaire from './MahjongSolitaire';
import { awardPoints } from '@/lib/points';
import type { NativeGame, NativeRuleset } from '@/data/games';

export interface NativeGameMountProps {
  native: NativeGame;
  ruleset?: NativeRuleset;
  slug: string;
}

/**
 * Mounts an in-house game and routes its win callback into the site-wide points
 * system. Keeping this wrapper thin means the game components stay pure and
 * reusable — they know nothing about accounts or points.
 */
export default function NativeGameMount({
  native,
  ruleset,
  slug
}: NativeGameMountProps) {
  const handleWin = useCallback(
    (points: number) => {
      // Cap the award so a long session cannot farm points from one board.
      awardPoints(Math.min(Math.max(points, 1), 50), `win:${slug}`);
    },
    [slug]
  );

  if (native === 'mahjong-table') {
    return <MahjongTable defaultRuleset={ruleset ?? 'hongkong'} onWin={handleWin} />;
  }

  if (native === 'mahjong-connect') {
    return <MahjongConnect onWin={handleWin} />;
  }

  if (native === 'mahjong-solitaire') {
    return <MahjongSolitaire onWin={handleWin} />;
  }

  return null;
}
