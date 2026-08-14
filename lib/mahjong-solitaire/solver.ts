/**
 * Hints, undo (with free budget), dead-end detection.
 */

import { canMatch, exposedIndices, type Board } from './board';

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
      if (canMatch(board, a, b)) {
        pairs.push([a, b]);
        if (pairs.length >= limit) return pairs;
      }
    }
  }
  return pairs;
}

/** Design-doc alias for `findPairs`. */
export const availableMoves = findPairs;

export function findHint(board: Board): [number, number] | null {
  return findPairs(board, 1)[0] ?? null;
}

export function isDead(board: Board): boolean {
  return board.remaining > 0 && findPairs(board, 1).length === 0;
}

export type UndoResult =
  | { ok: true; board: Board; usedFree: boolean }
  | { ok: false; reason: 'empty' | 'no_free_undo' };

/**
 * Undo one move. Consumes a free undo when available.
 * When freeUndosLeft is 0, returns no_free_undo (caller may spend points/ad).
 */
export function undo(board: Board, opts?: { force?: boolean }): UndoResult {
  const last = board.history[board.history.length - 1];
  if (!last) return { ok: false, reason: 'empty' };
  if (!opts?.force && board.freeUndosLeft <= 0) {
    return { ok: false, reason: 'no_free_undo' };
  }
  const tiles = [...board.tiles];
  tiles[last.a] = last.tileA;
  tiles[last.b] = last.tileB;
  const usedFree = !opts?.force && board.freeUndosLeft > 0;
  return {
    ok: true,
    usedFree,
    board: {
      ...board,
      tiles,
      remaining: board.remaining + 2,
      history: board.history.slice(0, -1),
      freeUndosLeft: usedFree
        ? board.freeUndosLeft - 1
        : board.freeUndosLeft
    }
  };
}

/** Legacy helper — always undoes when history exists (tests / force). */
export function undoForce(board: Board): Board {
  const r = undo(board, { force: true });
  return r.ok ? r.board : board;
}
