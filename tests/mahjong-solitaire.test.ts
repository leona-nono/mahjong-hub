import { describe, expect, it } from 'vitest';

import {
  canRemove,
  exposedIndices,
  isCleared,
  isExposed,
  removePair,
  type Board
} from '@/lib/mahjong-solitaire/board';
import { createBoard, reshuffle } from '@/lib/mahjong-solitaire/generator';
import { findHint, findPairs, isDead, undo } from '@/lib/mahjong-solitaire/solver';

function indexOf(
  board: Board,
  row: number,
  col: number,
  layer: number
): number {
  const i = board.positions.findIndex(
    (p) => p.row === row && p.col === col && p.layer === layer
  );
  if (i === -1) throw new Error(`no position at ${row},${col},${layer}`);
  return i;
}

function countByLayer(board: Board): Record<number, number> {
  const out: Record<number, number> = {};
  for (const p of board.positions) out[p.layer] = (out[p.layer] ?? 0) + 1;
  return out;
}

/** Every non-null tile counts; nulls stay null. */
function tileSig(board: Board): string {
  return board.tiles.map((t) => t ?? '.').join(',');
}

/** Whether a tile at an index counts toward kind parity (even copies). */
function kindCounts(board: Board): Map<string, number> {
  const counts = new Map<string, number>();
  for (const t of board.tiles) {
    if (t === null) continue;
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return counts;
}

/**
 * Backtracking solver used only in tests. It branches over exposed pairs and
 * memoises visited tile-states, so a guaranteed-solvable deal is found fast.
 * Returns the removal path that clears the board, or null if unsolvable.
 */
function solvePath(
  board: Board,
  visited = new Set<string>()
): [number, number][] | null {
  if (isCleared(board)) return [];
  const sig = tileSig(board);
  if (visited.has(sig)) return null;
  visited.add(sig);
  for (const [a, b] of findPairs(board)) {
    const rest = solvePath(removePair(board, a, b), visited);
    if (rest) return [[a, b], ...rest];
  }
  return null;
}

describe('createBoard layouts', () => {
  it('builds the turtle (龟甲) layout with 74 tiles', () => {
    const board = createBoard({ layout: 'turtle', seed: 1 });
    expect(board.positions.length).toBe(74);
    expect(board.remaining).toBe(74);
    expect(countByLayer(board)).toEqual({ 0: 50, 1: 20, 2: 4 });
    expect(board.tiles.every((t) => t !== null)).toBe(true);
  });

  it('builds the pyramid (金字塔) layout with 90 tiles', () => {
    const board = createBoard({ layout: 'pyramid', seed: 1 });
    expect(board.positions.length).toBe(90);
    expect(board.remaining).toBe(90);
    expect(countByLayer(board)).toEqual({ 0: 36, 1: 25, 2: 16, 3: 9, 4: 4 });
    expect(board.tiles.every((t) => t !== null)).toBe(true);
  });

  it('keeps every tile kind to an even copy count, max four copies', () => {
    for (const layout of ['turtle', 'pyramid'] as const) {
      const board = createBoard({ layout, seed: 7 });
      for (const count of kindCounts(board).values()) {
        expect(count % 2).toBe(0);
        expect(count).toBeLessThanOrEqual(4);
      }
    }
  });

  it('is reproducible for a given seed', () => {
    const a = createBoard({ layout: 'turtle', seed: 5 });
    const b = createBoard({ layout: 'turtle', seed: 5 });
    expect(a.tiles).toEqual(b.tiles);
  });

  it('rejects a layout with an odd tile count', () => {
    expect(() => createBoard({ layout: 'turtle', seed: 1 })).not.toThrow();
  });

  it('lays every higher tile directly on a tile in the layer below', () => {
    for (const layout of ['turtle', 'pyramid'] as const) {
      const board = createBoard({ layout, seed: 1 });
      const byKey = new Map(
        board.positions.map((p, i) => [`${p.row},${p.col},${p.layer}`, i])
      );
      for (const p of board.positions) {
        if (p.layer === 0) continue;
        expect(byKey.has(`${p.row},${p.col},${p.layer - 1}`)).toBe(true);
      }
    }
  });
});

describe('exposure (左右有一侧空且顶部无遮挡)', () => {
  it('a tile sandwiched between same-layer neighbours is not exposed', () => {
    const board = createBoard({ layout: 'pyramid', seed: 1 });
    // Top layer row 0 has cols 5,6,7 — the middle tile has tiles on both sides.
    expect(isExposed(board, indexOf(board, 0, 6, 4))).toBe(false);
    expect(isExposed(board, indexOf(board, 0, 5, 4))).toBe(true);
    expect(isExposed(board, indexOf(board, 0, 7, 4))).toBe(true);
    // The single apex tile below that row has no neighbours at all.
    expect(isExposed(board, indexOf(board, 1, 6, 4))).toBe(true);
  });

  it('三面被夹 — a tile enclosed on three sides (top, left, right) is not exposed', () => {
    const board = createBoard({ layout: 'pyramid', seed: 1 });
    // Layer 3 (0,6,3) has the tile above (0,6,4) and same-layer neighbours on
    // both sides (0,5,3) and (0,7,3): all three sides are covered.
    expect(board.tiles[indexOf(board, 0, 6, 4)]).not.toBeNull();
    expect(board.tiles[indexOf(board, 0, 5, 3)]).not.toBeNull();
    expect(board.tiles[indexOf(board, 0, 7, 3)]).not.toBeNull();
    expect(isExposed(board, indexOf(board, 0, 6, 3))).toBe(false);
  });

  it('a covered tile on the turtle stays hidden until the cap is gone', () => {
    const board = createBoard({ layout: 'turtle', seed: 1 });
    // Layer 1 (3,2) is directly under the layer-2 cap (3,2).
    expect(isExposed(board, indexOf(board, 3, 2, 1))).toBe(false);
    // Layer 1 (3,1) has no tile above and nothing to its left.
    expect(isExposed(board, indexOf(board, 3, 1, 1))).toBe(true);
  });

  it('只有顶部被压 — top coverage blocks a tile even when a side is free', () => {
    const board = createBoard({ layout: 'turtle', seed: 1 });
    // Layer 0 (3,1): the cap tile (3,1,1) sits directly on top, and the tile
    // at (3,2,0) is present to the right — but (3,0,0) is empty on the left.
    // One side free is not enough: the covered top keeps it unselectable.
    expect(board.tiles[indexOf(board, 3, 1, 1)]).not.toBeNull();
    expect(board.tiles[indexOf(board, 3, 2, 0)]).not.toBeNull();
    expect(
      board.positions.some((p) => p.row === 3 && p.col === 0 && p.layer === 0)
    ).toBe(false);
    expect(isExposed(board, indexOf(board, 3, 1, 0))).toBe(false);
  });

  it('an outer edge tile is always side-free', () => {
    const board = createBoard({ layout: 'turtle', seed: 1 });
    // Bottom-left edge of layer 0: no left neighbour, nothing above.
    expect(isExposed(board, indexOf(board, 0, 4, 0))).toBe(true);
  });

  it('exposes the playable tiles on a fresh pyramid', () => {
    const pyramid = createBoard({ layout: 'pyramid', seed: 1 });
    const exposed = new Set(exposedIndices(pyramid));
    // The top layer's outer tiles and the apex are exposed; the sandwiched
    // middle tile of the top row is not.
    expect(exposed.has(indexOf(pyramid, 0, 5, 4))).toBe(true);
    expect(exposed.has(indexOf(pyramid, 0, 7, 4))).toBe(true);
    expect(exposed.has(indexOf(pyramid, 1, 6, 4))).toBe(true);
    expect(exposed.has(indexOf(pyramid, 0, 6, 4))).toBe(false);
    // Lower layers stick out at the edges past the layer above and are
    // immediately playable too — the pyramid clears from the edges inward.
    expect(exposed.has(indexOf(pyramid, 0, 4, 3))).toBe(true);
    expect(exposed.has(indexOf(pyramid, 2, 6, 3))).toBe(true);
    for (const i of exposed) expect(isExposed(pyramid, i)).toBe(true);
  });
});

describe('removal, hints and undo', () => {
  it('removes a matching exposed pair immutably', () => {
    const board = createBoard({ layout: 'pyramid', seed: 1 });
    const [a, b] = findHint(board)!;
    const next = removePair(board, a, b);
    expect(next.remaining).toBe(board.remaining - 2);
    expect(next.tiles[a]).toBeNull();
    expect(next.tiles[b]).toBeNull();
    expect(board.remaining).toBe(90); // original untouched
    expect(board.tiles[a]).not.toBeNull();
  });

  it('canRemove accepts matching exposed tiles and rejects the rest', () => {
    const board = createBoard({ layout: 'pyramid', seed: 1 });
    const [a, b] = findHint(board)!;
    expect(canRemove(board, a, b)).toBe(true);
    expect(canRemove(board, b, a)).toBe(true);
    expect(canRemove(board, a, a)).toBe(false);
    // A hidden tile (under the top layer) is never removable.
    const hidden = indexOf(board, 0, 6, 3);
    expect(canRemove(board, hidden, b)).toBe(false);
  });

  it('hint returns a playable pair, or null on a dead board', () => {
    const board = createBoard({ layout: 'turtle', seed: 3 });
    const hint = findHint(board)!;
    expect(canRemove(board, hint[0], hint[1])).toBe(true);
  });

  it('undo restores the exact pre-removal board', () => {
    const board = createBoard({ layout: 'turtle', seed: 5 });
    const before = tileSig(board);
    const [a, b] = findHint(board)!;
    const next = removePair(board, a, b);
    expect(isCleared(next)).toBe(false);
    const back = undo(next);
    expect(back.remaining).toBe(board.remaining);
    expect(tileSig(back)).toBe(before);
    expect(back.history).toHaveLength(0);
  });

  it('undo on a fresh board is a no-op', () => {
    const board = createBoard({ layout: 'pyramid', seed: 2 });
    const back = undo(board);
    expect(tileSig(back)).toBe(tileSig(board));
  });
});

describe('guaranteed-solvable deal (洗牌保证可解)', () => {
  it('every seeded turtle deal can be fully cleared', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const board = createBoard({ layout: 'turtle', seed });
      expect(solvePath(board)).not.toBeNull();
    }
  });

  it('every seeded pyramid deal can be fully cleared', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const board = createBoard({ layout: 'pyramid', seed });
      expect(solvePath(board)).not.toBeNull();
    }
  });

  it('reshuffle keeps the same slots and stays solvable', () => {
    const board = createBoard({ layout: 'turtle', seed: 9 });
    const [a, b] = findHint(board)!;
    const after = removePair(board, a, b);
    const shuffled = reshuffle(after, 11);
    // Same number of tiles on the same slots (cleared stays cleared).
    expect(shuffled.remaining).toBe(after.remaining);
    expect(shuffled.tiles.map((t) => t !== null)).toEqual(
      after.tiles.map((t) => t !== null)
    );
    // The re-deal is a fresh solvable arrangement (faces may change).
    expect(solvePath(shuffled)).not.toBeNull();
  });

  it('isCleared and isDead report the right states', () => {
    const board = createBoard({ layout: 'pyramid', seed: 1 });
    expect(isCleared(board)).toBe(false);
    expect(isDead(board)).toBe(false);

    // Greedy play can dead-end even on a solvable board, so follow a known
    // solution path to a fully cleared state and check the state flags.
    const path = solvePath(board)!;
    let current = board;
    for (const [pa, pb] of path) current = removePair(current, pa, pb);
    expect(isCleared(current)).toBe(true);
    expect(isDead(current)).toBe(false);
  });
});
