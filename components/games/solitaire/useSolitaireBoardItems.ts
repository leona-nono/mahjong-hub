'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';
import type { useTranslations } from 'next-intl';

import type { Board } from '@/lib/mahjong-solitaire/board';
import { FREE_UNDO_PER_LEVEL } from '@/lib/mahjong-solitaire/tiles';
import {
  applyHint,
  applyRescue,
  applyShuffle,
  applyUndo,
  type ItemType
} from '@/lib/mahjong-solitaire/items';
import {
  type PayChannel,
  useSolitaireItems
} from '@/lib/solitaire-items';
import { trackSolitaireEvent } from '@/features/solitaire/telemetry';

export type OfferState = {
  item: ItemType;
  /** After paying, run this effect */
  run: (channel: PayChannel) => Promise<void>;
} | null;

type Translate = ReturnType<typeof useTranslations<'solitaire'>>;

type ItemsApi = ReturnType<typeof useSolitaireItems>;

type UseSolitaireBoardItemsArgs = {
  board: Board;
  setBoard: Dispatch<SetStateAction<Board>>;
  status: 'playing' | 'won' | 'dead';
  setStatus: Dispatch<SetStateAction<'playing' | 'won' | 'dead'>>;
  paused: boolean;
  setSelected: Dispatch<SetStateAction<number | null>>;
  setHint: Dispatch<SetStateAction<[number, number] | null>>;
  setStatusMsg: Dispatch<SetStateAction<string | null>>;
  levelId: string;
  items: ItemsApi;
  t: Translate;
};

/**
 * Gameplay item apply/consume (hint / undo / shuffle / rescue).
 * Distinct from `@/lib/solitaire-items` inventory hook `useSolitaireItems`.
 */
export function useSolitaireBoardItems({
  board,
  setBoard,
  status,
  setStatus,
  paused,
  setSelected,
  setHint,
  setStatusMsg,
  levelId,
  items,
  t
}: UseSolitaireBoardItemsArgs) {
  const [itemUses, setItemUses] = useState(0);
  const [offer, setOffer] = useState<OfferState>(null);

  const resetItemMeta = () => {
    setItemUses(0);
    setOffer(null);
  };

  const bumpItemUse = (type: ItemType) => {
    setItemUses((n) => n + 1);
    trackSolitaireEvent('solitaire_item_use', { levelId, item: type });
  };

  const runHint = async (channel: PayChannel) => {
    if (status !== 'playing' || paused) return;
    let paid = await items.tryConsume('hint', channel);
    if (!paid.ok && channel === 'inventory') {
      paid = await items.tryConsume('hint', 'daily_free');
    }
    if (!paid.ok) {
      if (paid.reason === 'empty' || paid.reason === 'daily_free_exhausted') {
        setOffer({ item: 'hint', run: runHint });
      }
      return;
    }
    const r = applyHint(board);
    if (!r.ok) {
      setStatusMsg(t('noMoves'));
      return;
    }
    setHint(r.pair);
    bumpItemUse('hint');
    setOffer(null);
  };

  const runUndo = async (channel: PayChannel) => {
    // Free undos first — no inventory
    const freeTry = applyUndo(board);
    if (freeTry.ok && freeTry.usedFree) {
      setBoard(freeTry.board);
      setSelected(null);
      setHint(null);
      setStatusMsg(null);
      if (status === 'won' || status === 'dead') setStatus('playing');
      setOffer(null);
      return;
    }
    if (freeTry.ok && !freeTry.usedFree) {
      // shouldn't happen without spendItem
    }

    let paid = await items.tryConsume('undo', channel);
    if (!paid.ok && channel === 'inventory') {
      paid = await items.tryConsume('undo', 'daily_free');
    }
    if (!paid.ok) {
      if (paid.reason === 'empty' || paid.reason === 'daily_free_exhausted' || paid.reason === undefined) {
        setOffer({ item: 'undo', run: runUndo });
        setStatusMsg(t('noFreeUndo', { n: FREE_UNDO_PER_LEVEL }));
      }
      return;
    }
    const r = applyUndo(board, { spendItem: true });
    if (!r.ok) {
      setStatusMsg(null);
      return;
    }
    setBoard(r.board);
    setSelected(null);
    setHint(null);
    bumpItemUse('undo');
    setOffer(null);
    if (status === 'won' || status === 'dead') setStatus('playing');
  };

  const runShuffle = async (channel: PayChannel) => {
    if (status !== 'playing' && status !== 'dead') return;
    let paid = await items.tryConsume('shuffle', channel);
    if (!paid.ok && channel === 'inventory') {
      paid = await items.tryConsume('shuffle', 'daily_free');
    }
    if (!paid.ok) {
      if (paid.reason === 'empty' || paid.reason === 'daily_free_exhausted') {
        setOffer({ item: 'shuffle', run: runShuffle });
      }
      return;
    }
    const r = applyShuffle(board);
    if (!r.ok) return;
    setBoard(r.board);
    setSelected(null);
    setHint(null);
    setStatus('playing');
    bumpItemUse('shuffle');
    setOffer(null);
  };

  const runRescue = async (channel: PayChannel) => {
    if (status !== 'dead') return;
    let paid = await items.tryConsume('rescue', channel);
    if (!paid.ok && channel === 'inventory') {
      paid = await items.tryConsume('rescue', 'daily_free');
    }
    if (!paid.ok) {
      if (paid.reason === 'empty' || paid.reason === 'daily_free_exhausted') {
        setOffer({ item: 'rescue', run: runRescue });
      }
      return;
    }
    const r = applyRescue(board);
    if (!r.ok) return;
    setBoard(r.board);
    setSelected(null);
    setHint(null);
    setStatus('playing');
    bumpItemUse('rescue');
    setOffer(null);
  };

  return {
    itemUses,
    offer,
    setOffer,
    resetItemMeta,
    runHint,
    runUndo,
    runShuffle,
    runRescue
  };
}
