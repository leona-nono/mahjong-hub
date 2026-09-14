'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { createBoard } from '@/lib/mahjong-solitaire/generator';
import type { SolitaireLayout } from '@/lib/mahjong-solitaire/layouts';
import { layoutTileCount } from '@/lib/mahjong-solitaire/layouts';
import {
  TEACHING_LEVELS,
  campaignOptions,
  createLevelBoard,
  getLevel,
  parseCampaignLevel,
  type LevelDef
} from '@/lib/mahjong-solitaire/levels';
import type { CatalogEntry } from '@/lib/mahjong-solitaire/difficulty';
import { parseDailyLevelId } from '@/lib/mahjong-solitaire/progress-rules';
import { trackSolitaireEvent } from '@/features/solitaire/telemetry';
import catalogFile from '@/lib/mahjong-solitaire/seed-catalog.json';
import type { Board } from '@/lib/mahjong-solitaire/board';

/** Same catalog the API serves — deal locally so level switches skip the network wait. */
export const SEED_CATALOG = (catalogFile.entries ?? []) as CatalogEntry[];

export function playableLevel(id: string): LevelDef | undefined {
  return getLevel(id, SEED_CATALOG);
}


export type PlayMode = 'level' | 'free';

type UseSolitaireCampaignArgs = {
  defaultLayout: SolitaireLayout;
  defaultLevelId: string;
  autoStart: boolean;
  compact: boolean;
  /** Reset selection / score / item-use meta when starting a round. */
  onRoundReset: () => void;
  /** Match original free-mode effect: only flip status back to playing. */
  onFreeModeDeal: () => void;
};

/**
 * Campaign / free-play level navigation: mode, layout, level board deals, coach gate.
 */
export function useSolitaireCampaign({
  defaultLayout,
  defaultLevelId,
  autoStart,
  compact,
  onRoundReset,
  onFreeModeDeal
}: UseSolitaireCampaignArgs) {
  const initialLevel = playableLevel(defaultLevelId) ?? TEACHING_LEVELS[0];

  const [mode, setMode] = useState<PlayMode>('level');
  const [level, setLevel] = useState<LevelDef>(initialLevel);
  const [layout, setLayout] = useState<SolitaireLayout>(defaultLayout);
  const [board, setBoard] = useState<Board>(() => createLevelBoard(initialLevel));
  const [coachDismissed, setCoachDismissed] = useState(autoStart || compact);
  const [dealReady, setDealReady] = useState(true);

  const onRoundResetRef = useRef(onRoundReset);
  onRoundResetRef.current = onRoundReset;
  const onFreeModeDealRef = useRef(onFreeModeDeal);
  onFreeModeDealRef.current = onFreeModeDeal;

  const campaignUpto = Math.max(12, parseCampaignLevel(level.id) ?? 0);
  const campaignLevels = useMemo(
    () => campaignOptions(campaignUpto, SEED_CATALOG),
    [campaignUpto]
  );

  const restartLevel = useCallback((next: LevelDef) => {
    const def = playableLevel(next.id) ?? next;
    setMode('level');
    setLevel(def);
    setCoachDismissed(false);
    setBoard(createLevelBoard(def));
    onRoundResetRef.current();
    setDealReady(true);
    const daily = parseDailyLevelId(def.id);
    trackSolitaireEvent(daily ? 'solitaire_daily_enter' : 'solitaire_level_enter', {
      levelId: def.id,
      layout: def.layout,
      alphabet: def.deal.alphabet ?? 0,
      remaining: layoutTileCount(def.layout)
    });
  }, []);

  const restartFree = useCallback(
    (nextLayout: SolitaireLayout = layout) => {
      setDealReady(true);
      setBoard(
        createBoard({
          layout: nextLayout,
          seed: Math.floor(Math.random() * 2 ** 31)
        })
      );
      onRoundResetRef.current();
    },
    [layout]
  );

  const enterFree = useCallback(() => {
    setMode('free');
    setLayout(defaultLayout);
    restartFree(defaultLayout);
    setCoachDismissed(true);
  }, [defaultLayout, restartFree]);

  useEffect(() => {
    if (mode !== 'free') return;
    setBoard(
      createBoard({
        layout: defaultLayout,
        seed: Math.floor(Math.random() * 2 ** 31)
      })
    );
    onFreeModeDealRef.current();
  }, [defaultLayout, mode]);

  useEffect(() => {
    if (!defaultLevelId || defaultLevelId.startsWith('teach-')) return;
    const next = playableLevel(defaultLevelId);
    if (next) restartLevel(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultLevelId]);

  return {
    mode,
    setMode,
    level,
    setLevel,
    layout,
    setLayout,
    board,
    setBoard,
    coachDismissed,
    setCoachDismissed,
    dealReady,
    setDealReady,
    campaignLevels,
    restartLevel,
    restartFree,
    enterFree,
    initialLevel
  };
}
