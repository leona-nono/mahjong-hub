/**
 * Mahjong Connect (Onet / 连连看) board model.
 *
 * Two tiles may be removed when they show the same face and can be joined by a
 * path of empty cells that turns at most twice. The board carries a one-cell
 * empty border so paths are allowed to route around the outside, which is how
 * every well-known implementation of this game behaves.
 *
 * Written from scratch; the rules are public game mechanics.
 */

import { createRng, shuffle, tileFromIndex, type Tile } from '../mahjong/tiles';

export interface Cell {
  row: number;
  col: number;
}

export interface Board {
  rows: number;
  cols: number;
  /** (rows + 2) x (cols + 2) grid; null means empty. Index [row][col] with border. */
  grid: (Tile | null)[][];
  remaining: number;
}

export interface BoardOptions {
  rows?: number;
  cols?: number;
  /** How many distinct tile faces to draw from. */
  kinds?: number;
  seed?: number;
}

const DIRECTIONS: Cell[] = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 }
];

/** Build a board with every face placed an even number of times. */
export function createBoard(options: BoardOptions = {}): Board {
  const rows = options.rows ?? 8;
  const cols = options.cols ?? 10;
  const kinds = options.kinds ?? 18;
  const seed = options.seed ?? Math.floor(Math.random() * 2 ** 31);
  const rng = createRng(seed);

  const total = rows * cols;
  if (total % 2 !== 0) {
    throw new Error('Mahjong Connect needs an even number of cells');
  }

  const pool: Tile[] = [];
  for (let i = 0; i < total / 2; i += 1) {
    const tile = tileFromIndex(i % kinds);
    pool.push(tile, tile);
  }
  shuffle(pool, rng);

  const grid: (Tile | null)[][] = Array.from({ length: rows + 2 }, () =>
    Array.from({ length: cols + 2 }, () => null)
  );

  let index = 0;
  for (let r = 1; r <= rows; r += 1) {
    for (let c = 1; c <= cols; c += 1) {
      grid[r][c] = pool[index];
      index += 1;
    }
  }

  return { rows, cols, grid, remaining: total };
}

function inBounds(board: Board, row: number, col: number): boolean {
  return row >= 0 && row < board.rows + 2 && col >= 0 && col < board.cols + 2;
}

function isEmpty(board: Board, row: number, col: number): boolean {
  return inBounds(board, row, col) && board.grid[row][col] === null;
}

/**
 * Find a connecting path between two occupied cells, or null.
 * BFS over (cell, direction, turns) — small enough to be instant, and much
 * easier to keep correct than the hand-rolled three-case version.
 */
export function findPath(board: Board, a: Cell, b: Cell): Cell[] | null {
  const tileA = board.grid[a.row]?.[a.col];
  const tileB = board.grid[b.row]?.[b.col];
  if (!tileA || !tileB) return null;
  if (a.row === b.row && a.col === b.col) return null;
  if (tileA !== tileB) return null;

  const width = board.cols + 2;
  const key = (row: number, col: number, dir: number) =>
    (row * width + col) * 4 + dir;

  const visited = new Map<number, { turns: number; prev: number | null }>();
  const queue: { row: number; col: number; dir: number; turns: number }[] = [];

  for (let dir = 0; dir < DIRECTIONS.length; dir += 1) {
    const row = a.row + DIRECTIONS[dir].row;
    const col = a.col + DIRECTIONS[dir].col;
    if (!inBounds(board, row, col)) continue;
    const isTarget = row === b.row && col === b.col;
    if (!isTarget && !isEmpty(board, row, col)) continue;
    visited.set(key(row, col, dir), { turns: 0, prev: null });
    queue.push({ row, col, dir, turns: 0 });
  }

  const parents = new Map<number, number | null>();
  for (const [k, v] of visited) parents.set(k, v.prev);

  let found: number | null = null;

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.row === b.row && current.col === b.col) {
      found = key(current.row, current.col, current.dir);
      break;
    }

    for (let dir = 0; dir < DIRECTIONS.length; dir += 1) {
      const turns = dir === current.dir ? current.turns : current.turns + 1;
      if (turns > 2) continue;

      const row = current.row + DIRECTIONS[dir].row;
      const col = current.col + DIRECTIONS[dir].col;
      if (!inBounds(board, row, col)) continue;

      const isTarget = row === b.row && col === b.col;
      if (!isTarget && !isEmpty(board, row, col)) continue;

      const k = key(row, col, dir);
      const seen = visited.get(k);
      if (seen && seen.turns <= turns) continue;

      visited.set(k, { turns, prev: key(current.row, current.col, current.dir) });
      parents.set(k, key(current.row, current.col, current.dir));
      queue.push({ row, col, dir, turns });
    }
  }

  if (found === null) return null;

  // Walk the parent chain back to the start.
  const path: Cell[] = [];
  let cursor: number | null = found;
  while (cursor !== null && cursor !== undefined) {
    const cell = Math.floor(cursor / 4);
    path.push({ row: Math.floor(cell / width), col: cell % width });
    cursor = parents.get(cursor) ?? null;
  }
  path.push({ row: a.row, col: a.col });
  return path.reverse();
}

/** All currently removable pairs. Used for hints and dead-board detection. */
export function findAllPairs(board: Board, limit = Infinity): [Cell, Cell][] {
  const positions: Cell[] = [];
  for (let r = 1; r <= board.rows; r += 1) {
    for (let c = 1; c <= board.cols; c += 1) {
      if (board.grid[r][c]) positions.push({ row: r, col: c });
    }
  }

  const pairs: [Cell, Cell][] = [];
  for (let i = 0; i < positions.length; i += 1) {
    for (let j = i + 1; j < positions.length; j += 1) {
      const a = positions[i];
      const b = positions[j];
      if (board.grid[a.row][a.col] !== board.grid[b.row][b.col]) continue;
      if (findPath(board, a, b)) {
        pairs.push([a, b]);
        if (pairs.length >= limit) return pairs;
      }
    }
  }
  return pairs;
}

/** Remove a matched pair, returning a new board. */
export function removePair(board: Board, a: Cell, b: Cell): Board {
  const grid = board.grid.map((row) => [...row]);
  grid[a.row][a.col] = null;
  grid[b.row][b.col] = null;
  return { ...board, grid, remaining: board.remaining - 2 };
}

/** Reshuffle the remaining tiles in place — used when the board is deadlocked. */
export function reshuffle(board: Board, seed = Date.now()): Board {
  const rng = createRng(seed);
  const tiles: Tile[] = [];
  const slots: Cell[] = [];

  for (let r = 1; r <= board.rows; r += 1) {
    for (let c = 1; c <= board.cols; c += 1) {
      const tile = board.grid[r][c];
      if (tile) {
        tiles.push(tile);
        slots.push({ row: r, col: c });
      }
    }
  }

  shuffle(tiles, rng);
  const grid = board.grid.map((row) => [...row]);
  slots.forEach((slot, i) => {
    grid[slot.row][slot.col] = tiles[i];
  });

  return { ...board, grid };
}

export function isCleared(board: Board): boolean {
  return board.remaining === 0;
}
