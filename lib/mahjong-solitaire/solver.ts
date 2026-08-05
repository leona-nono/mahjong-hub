/**
 * Mahjong Solitaire (单人麻将消除) — hints and undo.
 *
 * `findPairs` / `findHint` answer "is there a removable pair right now?" by
 * scanning exposed tiles for matching faces. `isDead` is a dead-board check.
 * `undo` pops the most recent removal off the history stack. All functions are
 * pure: they read or return new boards and never mutate the input.
 */

import { exposedIndices, type Board } from './board';

/** Every currently removable pair, up to `limit` (default: all). */
export function findPairs(
  board: Board,
  limit = Infinity
): [number, number][] {
  const exposed = exposedIndices(board);
  const pairs: [number, number][] = [];
  for (let i = 0; i < exposed.length; i += 1) {
    const a = exposed[i];
    for (let j = i + 1; j < exposed.length; j += 1) {
      const b = exposed[j];
      if (board.tiles[a] === board.tiles[b]) {
        pairs.push([a, b]);
        if (pairs.length >= limit) return pairs;
      }
    }
  }
  return pairs;
}

/** One removable pair to suggest, or null when none exists. */
export function findHint(board: Board): [number, number] | null {
  return findPairs(board, 1)[0] ?? null;
}

/** True when tiles remain but no pair can be removed (a dead end). */
export function isDead(board: Board): boolean {
  return board.remaining > 0 && findPairs(board, 1).length === 0;
}

/** Undo the most recent removal (a no-op on a fresh board). */
export function undo(board: Board): Board {
  const last = board.history[board.history.length - 1];
  if (!last) return board;
  const tiles = [...board.tiles];
  tiles[last.a] = last.tileA;
  tiles[last.b] = last.tileB;
  return {
    ...board,
    tiles,
    remaining: board.remaining + 2,
    history: board.history.slice(0, -1)
  };
}
