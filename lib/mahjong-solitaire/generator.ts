/**
 * Solvable deal generation — reverse placement + replay proof + solvable shuffle.
 * Adapted from the design reverse-generator (geometric bottom-up + free-pair fallback).
 */

import { createRng, type Tile } from '../mahjong/tiles';
import {
  getNeighbors,
  isExposedFor,
  positionsFor,
  type NeighborMaps,
  type Pos,
  type SolitaireLayout
} from './layouts';
import { type Board, withFreshUndoBudget, canMatch, removePair } from './board';
import {
  FLOWER_TILES,
  SEASON_TILES,
  buildWall144,
  canMatchTiles,
  toMatchKey
} from './tiles';

export interface BoardOptions {
  layout?: SolitaireLayout;
  seed?: number;
  /** Include season/flower tiles (default: true when board needs ≥18 pairs). */
  includeBonus?: boolean;
  /** Prefer excluding lookalike ranks 6 & 9 for early teaching. */
  avoidLookalikes?: boolean;
  /** Force at least one season wild pair + one flower wild pair when bonus is on. */
  forceFlowerPairs?: boolean;
  maxRetries?: number;
}

export interface PairEntry {
  matchKey: string;
  /** Concrete faces assigned to the two slots (may differ for season/flower). */
  a: Tile;
  b: Tile;
}

export interface GeneratedBoard {
  board: Board;
  /** Placement order; reverse is a legal clear path (replay proof). */
  solutionOrder: Array<[number, number]>;
  seed: number;
}

function shuffleInPlace<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function shuffleCopy<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr];
  shuffleInPlace(out, rng);
  return out;
}

const LOOKALIKE_RANKS = new Set([6, 9]);

function isLookalike(tile: Tile): boolean {
  const suit = tile[0];
  if (suit !== 'm' && suit !== 'p' && suit !== 's') return false;
  return LOOKALIKE_RANKS.has(Number(tile.slice(1)));
}

function resolveDealOpts(options: BoardOptions, pairCount: number) {
  const includeBonus = options.includeBonus ?? pairCount >= 18;
  return {
    includeBonus,
    avoidLookalikes: options.avoidLookalikes ?? false,
    forceFlowerPairs: options.forceFlowerPairs ?? false
  };
}

/** Build a multiset of matching pairs from the 144 wall under filters. */
export function buildPairPool(
  pairCount: number,
  rng: () => number,
  opts: {
    includeBonus: boolean;
    avoidLookalikes: boolean;
    forceFlowerPairs: boolean;
  }
): PairEntry[] | null {
  const wall = buildWall144().filter((t) => {
    if (!opts.includeBonus && (SEASON_TILES.includes(t) || FLOWER_TILES.includes(t))) {
      return false;
    }
    if (opts.avoidLookalikes && isLookalike(t)) return false;
    return true;
  });
  shuffleInPlace(wall, rng);

  const buckets = new Map<Tile, Tile[]>();
  for (const t of wall) {
    const list = buckets.get(t) ?? [];
    list.push(t);
    buckets.set(t, list);
  }

  const pairs: PairEntry[] = [];

  const takeExact = (id: Tile): boolean => {
    const list = buckets.get(id);
    if (!list || list.length < 2) return false;
    const a = list.pop()!;
    const b = list.pop()!;
    pairs.push({ matchKey: toMatchKey(a), a, b });
    return true;
  };

  const takeWild = (group: Tile[]): boolean => {
    const available = group.filter((id) => (buckets.get(id)?.length ?? 0) > 0);
    if (available.length < 2) {
      for (const id of group) {
        if ((buckets.get(id)?.length ?? 0) >= 2) return takeExact(id);
      }
      return false;
    }
    shuffleInPlace(available, rng);
    const ta = available[0];
    const tb = available[1];
    const a = buckets.get(ta)!.pop()!;
    const b = buckets.get(tb)!.pop()!;
    pairs.push({ matchKey: toMatchKey(a), a, b });
    return true;
  };

  if (opts.includeBonus && (opts.forceFlowerPairs || pairCount >= 20)) {
    takeWild(SEASON_TILES);
    takeWild(FLOWER_TILES);
  }

  const exactIds = [...buckets.keys()].filter(
    (id) => !SEASON_TILES.includes(id) && !FLOWER_TILES.includes(id)
  );
  shuffleInPlace(exactIds, rng);

  let guard = 0;
  while (pairs.length < pairCount && guard < 10000) {
    guard += 1;
    let progressed = false;
    for (const id of exactIds) {
      if (pairs.length >= pairCount) break;
      if (takeExact(id)) progressed = true;
    }
    if (!progressed) {
      if (opts.includeBonus && (takeWild(SEASON_TILES) || takeWild(FLOWER_TILES))) {
        continue;
      }
      break;
    }
  }

  if (pairs.length !== pairCount) return null;
  return pairs;
}

/**
 * Reverse deal: repeatedly pick two currently-free active slots (clear simulation),
 * then assign pair types in reverse so solutionOrder reverse-replays that path.
 */
function reverseGenerate(
  positions: Pos[],
  nb: NeighborMaps,
  active: boolean[],
  pairs: PairEntry[],
  rng: () => number
): { tiles: (Tile | null)[]; solutionOrder: Array<[number, number]> } | null {
  const n = positions.length;
  const state = [...active];
  const total = state.reduce((s, v) => s + (v ? 1 : 0), 0);
  if (total !== pairs.length * 2) return null;

  const clearOrder: Array<[number, number]> = [];
  while (clearOrder.length < pairs.length) {
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
    clearOrder.push([a, b]);
    state[a] = false;
    state[b] = false;
  }

  // Placement order = reverse of clear order (design: reverse = legal clear path)
  const solutionOrder = clearOrder.slice().reverse();
  const tiles: (Tile | null)[] = new Array(n).fill(null);
  solutionOrder.forEach(([a, b], i) => {
    tiles[a] = pairs[i].a;
    tiles[b] = pairs[i].b;
  });
  return { tiles, solutionOrder };
}

/**
 * Replay proof: reverse of solutionOrder must be a legal clear path
 * under free + match rules (including flower wilds).
 * Supports mid-game boards (already-cleared slots stay null).
 */
export function verifyByReplay(
  board: Board,
  solutionOrder: Array<[number, number]>
): boolean {
  let current: Board = {
    ...board,
    tiles: [...board.tiles],
    history: []
  };
  for (let k = solutionOrder.length - 1; k >= 0; k -= 1) {
    const [i, j] = solutionOrder[k];
    if (!canMatch(current, i, j)) return false;
    current = removePair(current, i, j);
  }
  return current.remaining === 0;
}

function boardFromTiles(
  layout: SolitaireLayout,
  positions: Pos[],
  tiles: (Tile | null)[],
  seed: number,
  freshUndo: boolean
): Board {
  const remaining = tiles.reduce((n, t) => n + (t !== null ? 1 : 0), 0);
  const base: Board = {
    layout,
    positions,
    tiles,
    remaining,
    history: [],
    freeUndosLeft: 0,
    seed
  };
  return freshUndo ? withFreshUndoBudget(base) : base;
}

/** Generate a solvable board with replay-proven solution order. */
export function generateSolvable(
  options: BoardOptions = {}
): GeneratedBoard | null {
  const layout = options.layout ?? 'classic';
  const seed = options.seed ?? Math.floor(Math.random() * 2 ** 31);
  const maxRetries = options.maxRetries ?? 500;
  const positions = positionsFor(layout);
  const nb = getNeighbors(layout);
  const pairCount = positions.length / 2;
  const dealOpts = resolveDealOpts(options, pairCount);
  const active = new Array<boolean>(positions.length).fill(true);

  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    const s = (seed + attempt * 2654435761) >>> 0;
    const rng = createRng(s);
    const pool = buildPairPool(pairCount, rng, dealOpts);
    if (!pool) continue;
    const pairs = shuffleCopy(pool, rng);
    const res = reverseGenerate(positions, nb, active, pairs, rng);
    if (!res) continue;
    const board = boardFromTiles(layout, positions, res.tiles, s, true);
    if (!verifyByReplay(board, res.solutionOrder)) continue;
    return { board, solutionOrder: res.solutionOrder, seed: s };
  }
  return null;
}

export function createBoard(options: BoardOptions = {}): Board {
  const generated = generateSolvable(options);
  if (!generated) {
    throw new Error(
      `could not deal a solvable ${options.layout ?? 'classic'} board`
    );
  }
  return generated.board;
}

/**
 * Solvable shuffle: keep remaining match-key multiset, reassign faces via reverse gen.
 */
export function shuffleSolvable(
  board: Board,
  seed = Date.now(),
  maxRetries = 500
): GeneratedBoard | null {
  const remainingIdx: number[] = [];
  for (let i = 0; i < board.tiles.length; i += 1) {
    if (board.tiles[i] !== null) remainingIdx.push(i);
  }
  if (remainingIdx.length % 2 !== 0) return null;
  if (remainingIdx.length === 0) {
    return { board, solutionOrder: [], seed };
  }

  // Rebuild pair pool from remaining match keys (preserve wild groups)
  const byKey = new Map<string, Tile[]>();
  for (const i of remainingIdx) {
    const t = board.tiles[i]!;
    const k = toMatchKey(t);
    const list = byKey.get(k) ?? [];
    list.push(t);
    byKey.set(k, list);
  }

  const pairs: PairEntry[] = [];
  for (const [k, list] of byKey) {
    if (list.length % 2 !== 0) return null;
    for (let p = 0; p < list.length; p += 2) {
      pairs.push({ matchKey: k, a: list[p], b: list[p + 1] });
    }
  }

  const positions = board.positions;
  const nb = getNeighbors(board.layout);
  const active = board.tiles.map((t) => t !== null);

  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    const s = (seed + attempt * 40503) >>> 0;
    const rng = createRng(s);
    const shuffled = shuffleCopy(pairs, rng);
    // Randomize wild concrete faces within each pair
    for (const p of shuffled) {
      if (p.matchKey === 'season' || p.matchKey === 'flower') {
        if (rng() < 0.5) {
          const tmp = p.a;
          p.a = p.b;
          p.b = tmp;
        }
      }
    }
    const res = reverseGenerate(positions, nb, active, shuffled, rng);
    if (!res) continue;

    // Keep cleared slots null; only rewrite remaining
    const tiles = board.tiles.map((t, i) => (active[i] ? res.tiles[i] : null));
    const next = {
      ...board,
      tiles,
      remaining: remainingIdx.length,
      history: [],
      seed: s
      // freeUndosLeft preserved
    };
    if (!verifyByReplay(next, res.solutionOrder)) continue;
    return { board: next, solutionOrder: res.solutionOrder, seed: s };
  }
  return null;
}

export function reshuffle(board: Board, seed = Date.now()): Board {
  const generated = shuffleSolvable(board, seed);
  if (generated) return generated.board;
  // Last resort: full new deal (resets undo budget)
  return createBoard({ layout: board.layout, seed: seed + 200 });
}

/** Dead-end rescue: reshuffle remaining tiles into a solvable state. */
export function rescue(board: Board, seed = Date.now()): Board {
  return reshuffle(board, seed);
}

export { canMatchTiles };
