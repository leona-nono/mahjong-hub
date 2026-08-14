/**
 * Solitaire items (E11) — Hint / Undo / Shuffle / Rescue.
 * Design: mahjong-solitaire-items.md v0.1
 */

import type { Board } from './board';
import { isDead, findHint, undo } from './solver';
import { rescue, reshuffle } from './generator';

export type ItemType = 'hint' | 'undo' | 'shuffle' | 'rescue';

export const ITEM_TYPES: ItemType[] = ['hint', 'undo', 'shuffle', 'rescue'];

/** Points price [PLACEHOLDER] — relative ladder locked. */
export const ITEM_PRICE: Record<ItemType, number> = {
  hint: 200,
  undo: 200,
  shuffle: 300,
  rescue: 500
};

/** First-enter starter pack (permanent inventory). */
export const STARTER_PACK: Record<ItemType, number> = {
  hint: 3,
  undo: 3,
  shuffle: 1,
  rescue: 0
};

/** Per-level ad caps (design §4 / §7). */
export const AD_CAP_TOOL_PER_LEVEL = 3;
export const AD_CAP_RESCUE_PER_LEVEL = 2;

export type ItemInventory = Record<ItemType, number>;

export function emptyInventory(): ItemInventory {
  return { hint: 0, undo: 0, shuffle: 0, rescue: 0 };
}

export function starterInventory(): ItemInventory {
  return { ...STARTER_PACK };
}

export function balanceOf(inv: ItemInventory, type: ItemType): number {
  return Math.max(0, inv[type] ?? 0);
}

export function withDelta(
  inv: ItemInventory,
  type: ItemType,
  delta: number
): ItemInventory | null {
  const next = balanceOf(inv, type) + delta;
  if (next < 0) return null;
  return { ...inv, [type]: next };
}

export type ApplyHintResult =
  | { ok: true; pair: [number, number] }
  | { ok: false; reason: 'no_moves' };

export function applyHint(board: Board): ApplyHintResult {
  const pair = findHint(board);
  if (!pair) return { ok: false, reason: 'no_moves' };
  return { ok: true, pair };
}

export type ApplyUndoResult =
  | { ok: true; board: Board; usedFree: boolean }
  | { ok: false; reason: 'empty' | 'need_item' };

/**
 * Undo: prefer free budget, else require `spendItem` (caller consumes inventory).
 */
export function applyUndo(
  board: Board,
  opts?: { spendItem?: boolean }
): ApplyUndoResult {
  if (board.freeUndosLeft > 0) {
    const r = undo(board);
    if (!r.ok) return { ok: false, reason: 'empty' };
    return { ok: true, board: r.board, usedFree: true };
  }
  if (!opts?.spendItem) return { ok: false, reason: 'need_item' };
  const r = undo(board, { force: true });
  if (!r.ok) return { ok: false, reason: 'empty' };
  return { ok: true, board: r.board, usedFree: false };
}

export type ApplyShuffleResult =
  | { ok: true; board: Board }
  | { ok: false; reason: 'empty_board' };

/** Active shuffle — solvable re-deal of remaining tiles; clears undo stack. */
export function applyShuffle(board: Board, seed?: number): ApplyShuffleResult {
  if (board.remaining <= 0) return { ok: false, reason: 'empty_board' };
  return { ok: true, board: reshuffle(board, seed ?? Date.now()) };
}

export type ApplyRescueResult =
  | { ok: true; board: Board }
  | { ok: false; reason: 'not_dead' | 'empty_board' };

/**
 * Rescue = dead-only solvable shuffle (same primitive, different gate/pricing).
 */
export function applyRescue(board: Board, seed?: number): ApplyRescueResult {
  if (board.remaining <= 0) return { ok: false, reason: 'empty_board' };
  if (!isDead(board)) return { ok: false, reason: 'not_dead' };
  return { ok: true, board: rescue(board, seed ?? Date.now()) };
}

/** Unlock rules (design §3): soft gate by progress. */
export function isItemUnlocked(
  type: ItemType,
  ctx: { lessonsCleared: number; seenDeadEnd: boolean; freePlay: boolean }
): boolean {
  if (type === 'hint' || type === 'undo') return true;
  if (type === 'shuffle') {
    return ctx.freePlay || ctx.lessonsCleared >= 3 || ctx.seenDeadEnd;
  }
  // Rescue unlocked the first time a dead end appears (or free play)
  if (type === 'rescue') return ctx.freePlay || ctx.seenDeadEnd;
  return false;
}

export function starsForLevel(opts: {
  cleared: boolean;
  itemUses: number;
}): 0 | 1 | 2 | 3 {
  if (!opts.cleared) return 0;
  if (opts.itemUses <= 0) return 3;
  if (opts.itemUses <= 2) return 2;
  return 1;
}
