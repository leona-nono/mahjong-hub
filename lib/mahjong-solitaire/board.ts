/**
 * Mahjong Solitaire board model — exposure, match (incl. flower wild), remove.
 */

import { type Tile } from '../mahjong/tiles';
import { getNeighbors, isExposedFor, type Pos, type SolitaireLayout } from './layouts';
import { FREE_UNDO_PER_LEVEL, canMatchTiles } from './tiles';

export interface HistoryEntry {
  a: number;
  b: number;
  tileA: Tile;
  tileB: Tile;
}

export interface Board {
  layout: SolitaireLayout;
  positions: Pos[];
  tiles: (Tile | null)[];
  remaining: number;
  history: HistoryEntry[];
  /** Free undos remaining this level (design: 3). */
  freeUndosLeft: number;
  seed: number;
}

export function isExposed(board: Board, index: number): boolean {
  if (board.tiles[index] === null) return false;
  const present = board.tiles.map((t) => t !== null);
  return isExposedFor(getNeighbors(board.layout), present, index);
}

export function exposedIndices(board: Board): number[] {
  const nb = getNeighbors(board.layout);
  const present = board.tiles.map((t) => t !== null);
  const out: number[] = [];
  for (let i = 0; i < present.length; i += 1) {
    if (present[i] && isExposedFor(nb, present, i)) out.push(i);
  }
  return out;
}

/** Alias for design docs / external API. */
export const isFree = isExposed;

export function canMatch(board: Board, a: number, b: number): boolean {
  if (a === b) return false;
  const tileA = board.tiles[a];
  const tileB = board.tiles[b];
  if (tileA === null || tileB === null) return false;
  if (!canMatchTiles(tileA, tileB)) return false;
  return isExposed(board, a) && isExposed(board, b);
}

/** @deprecated use canMatch — kept for older call sites */
export function canRemove(board: Board, a: number, b: number): boolean {
  return canMatch(board, a, b);
}

export function removePair(board: Board, a: number, b: number): Board {
  const tileA = board.tiles[a];
  const tileB = board.tiles[b];
  if (!canMatch(board, a, b) || tileA === null || tileB === null) {
    throw new Error('illegal match');
  }
  const tiles = [...board.tiles];
  tiles[a] = null;
  tiles[b] = null;
  const history = [...board.history, { a, b, tileA, tileB }];
  return { ...board, tiles, remaining: board.remaining - 2, history };
}

export function isCleared(board: Board): boolean {
  return board.remaining === 0;
}

export function withFreshUndoBudget(board: Board): Board {
  return { ...board, freeUndosLeft: FREE_UNDO_PER_LEVEL };
}
