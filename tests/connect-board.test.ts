import { describe, expect, it } from 'vitest';

import {
  createBoard,
  findAllPairs,
  findPath,
  isCleared,
  removePair,
  reshuffle,
  type Board
} from '@/lib/connect/board';
import type { Tile } from '@/lib/mahjong/tiles';

/** Build a board directly from a layout, using '.' for an empty cell. */
function boardFrom(layout: string[]): Board {
  const rows = layout.length;
  const cols = layout[0].split(' ').length;
  const grid: (Tile | null)[][] = Array.from({ length: rows + 2 }, () =>
    Array.from({ length: cols + 2 }, () => null)
  );
  let remaining = 0;
  layout.forEach((line, r) => {
    line.split(' ').forEach((token, c) => {
      if (token !== '.') {
        grid[r + 1][c + 1] = token as Tile;
        remaining += 1;
      }
    });
  });
  return { rows, cols, grid, remaining };
}

describe('createBoard', () => {
  it('fills every cell and pairs every face', () => {
    const board = createBoard({ rows: 6, cols: 8, kinds: 12, seed: 1 });
    expect(board.remaining).toBe(48);

    const counts = new Map<string, number>();
    for (let r = 1; r <= board.rows; r += 1) {
      for (let c = 1; c <= board.cols; c += 1) {
        const tile = board.grid[r][c]!;
        counts.set(tile, (counts.get(tile) ?? 0) + 1);
      }
    }
    for (const count of counts.values()) {
      expect(count % 2).toBe(0);
    }
  });

  it('is reproducible for a given seed', () => {
    const a = createBoard({ rows: 6, cols: 8, seed: 5 });
    const b = createBoard({ rows: 6, cols: 8, seed: 5 });
    expect(a.grid).toEqual(b.grid);
  });

  it('rejects layouts with an odd number of cells', () => {
    expect(() => createBoard({ rows: 3, cols: 3 })).toThrow();
  });

  it('supports shaped two-dimensional boards without filling their open lanes', () => {
    const board = createBoard({
      rows: 4,
      cols: 4,
      slots: [
        { row: 1, col: 2 }, { row: 1, col: 3 },
        { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 },
        { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 },
        { row: 4, col: 2 }, { row: 4, col: 3 }
      ],
      seed: 12
    });
    expect(board.remaining).toBe(12);
    expect(board.grid[1][1]).toBeNull();
    expect(board.grid[4][4]).toBeNull();
  });
});

describe('findPath', () => {
  it('connects two adjacent identical tiles', () => {
    const board = boardFrom(['m1 m1']);
    const path = findPath(board, { row: 1, col: 1 }, { row: 1, col: 2 });
    expect(path).not.toBeNull();
  });

  it('refuses tiles with different faces', () => {
    const board = boardFrom(['m1 m2']);
    expect(findPath(board, { row: 1, col: 1 }, { row: 1, col: 2 })).toBeNull();
  });

  it('connects along a clear straight line', () => {
    const board = boardFrom(['m1 . . m1']);
    expect(findPath(board, { row: 1, col: 1 }, { row: 1, col: 4 })).not.toBeNull();
  });

  it('is blocked when a tile is fully enclosed', () => {
    const board = boardFrom(['. . p1 . .', '. p2 m1 p3 .', '. . p4 . m1']);
    expect(findPath(board, { row: 2, col: 3 }, { row: 3, col: 5 })).toBeNull();
  });

  it('routes around the outside border', () => {
    // Same column, blocked in the middle — the only route is around the edge,
    // which costs exactly two turns and is therefore legal.
    const board = boardFrom(['m1 p1 p2', 'p3 p4 p5', 'm1 p6 p7']);
    expect(findPath(board, { row: 1, col: 1 }, { row: 3, col: 1 })).not.toBeNull();
  });

  it('rejects a route that would need three turns', () => {
    // Opposite corners of a solid block: any route round the outside has to
    // turn three times, so the pair is not playable.
    const board = boardFrom([
      'm1 p1 p2 p3',
      'p4 p5 p6 p7',
      'p8 p9 s1 s2',
      's3 s4 s5 m1'
    ]);
    expect(findPath(board, { row: 1, col: 1 }, { row: 4, col: 4 })).toBeNull();
  });

  it('returns null for the same cell twice', () => {
    const board = boardFrom(['m1 m1']);
    expect(findPath(board, { row: 1, col: 1 }, { row: 1, col: 1 })).toBeNull();
  });
});

describe('board mutation', () => {
  it('removes a pair without touching the original board', () => {
    const board = boardFrom(['m1 m1']);
    const next = removePair(board, { row: 1, col: 1 }, { row: 1, col: 2 });
    expect(next.remaining).toBe(0);
    expect(isCleared(next)).toBe(true);
    expect(board.remaining).toBe(2); // original untouched
  });

  it('keeps the same multiset of tiles after a reshuffle', () => {
    const board = createBoard({ rows: 6, cols: 8, seed: 9 });
    const shuffled = reshuffle(board, 3);
    const flatten = (b: typeof board) =>
      b.grid.flat().filter(Boolean).sort().join(',');
    expect(flatten(shuffled)).toBe(flatten(board));
    expect(shuffled.remaining).toBe(board.remaining);
  });

  it('finds at least one playable pair on a fresh board', () => {
    const board = createBoard({ rows: 8, cols: 10, seed: 21 });
    expect(findAllPairs(board, 1).length).toBeGreaterThan(0);
  });

  it('reports no pairs when the only match is enclosed', () => {
    const board = boardFrom(['. . p1 . .', '. p2 m1 p3 .', '. . p4 . m1']);
    expect(findAllPairs(board)).toHaveLength(0);
  });
});
