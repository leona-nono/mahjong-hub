/**
 * Mahjong Solitaire (单人麻将消除) — deal generation.
 *
 * Deals are guaranteed solvable by construction: the tiles are assigned by a
 * reverse-removal pass — repeatedly pick two exposed slots, remove both, record
 * the pair, and give both members of each pair the same face. Clearing those
 * pairs in the reverse order is then a valid solution, because removing tiles
 * can only expose more tiles.
 *
 * A random scatter-and-check deal is deliberately avoided: it produces many
 * dead boards. This module depends only on layout geometry (layouts.ts) and the
 * board state shape (board.ts); it never mutates a board.
 */

import { createRng, tileFromIndex, type Tile } from '../mahjong/tiles';
import { getNeighbors, isExposedFor, positionsFor, type Pos, type SolitaireLayout } from './layouts';
import type { Board } from './board';

export interface BoardOptions {
  layout?: SolitaireLayout;
  seed?: number;
}

/**
 * Reverse-removal deal. `present` marks which slots hold a tile in the final
 * board (the initial deal marks all of them; a reshuffle keeps cleared slots
 * empty). Tiles are assigned afterwards, so the deal always has a solution.
 * Returns null when the layout gets stuck (fewer than two exposed slots).
 */
function dealSolvable(
  positions: Pos[],
  nb: ReturnType<typeof getNeighbors>,
  rng: () => number,
  present: boolean[]
): (Tile | null)[] | null {
  const n = positions.length;
  const state = [...present];
  const total = state.reduce((sum, v) => sum + (v ? 1 : 0), 0);
  if (total % 2 !== 0) return null;
  const totalPairs = total / 2;
  const kinds = Math.min(34, Math.ceil(totalPairs));

  const pairs: [number, number][] = [];
  while (pairs.length < totalPairs) {
    const exposed: number[] = [];
    for (let i = 0; i < n; i += 1) {
      if (state[i] && isExposedFor(nb, state, i)) exposed.push(i);
    }
    if (exposed.length < 2) return null;

    const ia = Math.floor(rng() * exposed.length);
    let ib = Math.floor(rng() * (exposed.length - 1));
    if (ib >= ia) ib += 1;
    const a = exposed[ia];
    const b = exposed[ib];
    pairs.push([a, b]);
    state[a] = false;
    state[b] = false;
  }

  const tiles: (Tile | null)[] = new Array(n).fill(null);
  pairs.forEach(([a, b], i) => {
    const tile = tileFromIndex(i % kinds);
    tiles[a] = tile;
    tiles[b] = tile;
  });
  return tiles;
}

/** A fresh solvable board for the given layout, seeded for reproducibility. */
export function createBoard(options: BoardOptions = {}): Board {
  const layout = options.layout ?? 'turtle';
  const seed = options.seed ?? Math.floor(Math.random() * 2 ** 31);
  const positions = positionsFor(layout);
  const nb = getNeighbors(layout);

  let tiles: (Tile | null)[] | null = null;
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const rng = createRng(seed + attempt);
    const present = new Array<boolean>(positions.length).fill(true);
    tiles = dealSolvable(positions, nb, rng, present);
    if (tiles) break;
  }
  if (!tiles) {
    throw new Error(`could not deal a solvable ${layout} board`);
  }

  return {
    layout,
    positions,
    tiles,
    remaining: positions.length,
    history: []
  };
}

/**
 * Re-deal the remaining tiles over the remaining slots, keeping cleared slots
 * empty and the deal solvable. Falls back to a full restart only when the
 * remaining slots are structurally unsolvable (rare).
 */
export function reshuffle(board: Board, seed = Date.now()): Board {
  const positions = board.positions;
  const nb = getNeighbors(board.layout);
  const present = board.tiles.map((t) => t !== null);

  for (let attempt = 0; attempt < 200; attempt += 1) {
    const rng = createRng(seed + attempt);
    const tiles = dealSolvable(positions, nb, rng, present);
    if (tiles) return { ...board, tiles, history: [] };
  }
  return createBoard({ layout: board.layout, seed: seed + 200 });
}
