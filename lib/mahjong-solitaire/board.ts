/**
 * Mahjong Solitaire (单人麻将消除) — board model.
 *
 * A board is a set of slots (from {@link layouts}) each holding a tile or being
 * empty. Two exposed tiles with the same face can be matched and cleared; the
 * goal is to clear the whole layout. This module owns the state shape and the
 * click/pair predicates. It does not know how a deal is generated (see
 * generator.ts) or how to search for hints / undo (see solver.ts).
 *
 * Written from scratch; the rules are public game mechanics.
 */

import { type Tile } from '../mahjong/tiles';
import { getNeighbors, isExposedFor, type Pos, type SolitaireLayout } from './layouts';

export interface HistoryEntry {
  a: number;
  b: number;
  tileA: Tile;
  tileB: Tile;
}

export interface Board {
  layout: SolitaireLayout;
  /** All slots of the layout, in a fixed order; parallel to `tiles`. */
  positions: Pos[];
  /** null once the slot has been cleared. */
  tiles: (Tile | null)[];
  remaining: number;
  /** Removed pairs, oldest first, so the last entry is what `undo` restores. */
  history: HistoryEntry[];
}

/**
 * Whether slot `i` is selectable: it holds a tile, nothing rests on top of it,
 * and at least one of its left/right neighbours at the same layer is empty.
 */
export function isExposed(board: Board, index: number): boolean {
  if (board.tiles[index] === null) return false;
  const present = board.tiles.map((t) => t !== null);
  return isExposedFor(getNeighbors(board.layout), present, index);
}

/** Indices of every currently selectable tile. */
export function exposedIndices(board: Board): number[] {
  const nb = getNeighbors(board.layout);
  const present = board.tiles.map((t) => t !== null);
  const out: number[] = [];
  for (let i = 0; i < present.length; i += 1) {
    if (present[i] && isExposedFor(nb, present, i)) out.push(i);
  }
  return out;
}

/** A pair may be removed iff it is two distinct exposed tiles of the same face. */
export function canRemove(board: Board, a: number, b: number): boolean {
  if (a === b) return false;
  const tileA = board.tiles[a];
  const tileB = board.tiles[b];
  if (tileA === null || tileB === null || tileA !== tileB) return false;
  return isExposed(board, a) && isExposed(board, b);
}

/** Remove a matching exposed pair, returning a new board (input untouched). */
export function removePair(board: Board, a: number, b: number): Board {
  const tileA = board.tiles[a];
  const tileB = board.tiles[b];
  if (a === b) throw new Error('cannot match a tile with itself');
  if (tileA === null || tileB === null) throw new Error('tile already removed');
  if (tileA !== tileB) throw new Error('tiles do not match');
  if (!isExposed(board, a) || !isExposed(board, b)) {
    throw new Error('tile is not exposed');
  }

  const tiles = [...board.tiles];
  tiles[a] = null;
  tiles[b] = null;
  const history = [...board.history, { a, b, tileA, tileB }];
  return { ...board, tiles, remaining: board.remaining - 2, history };
}

/** True when every tile has been cleared. */
export function isCleared(board: Board): boolean {
  return board.remaining === 0;
}
