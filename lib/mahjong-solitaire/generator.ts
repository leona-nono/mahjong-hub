/**
 * Solvable deal generation from the 144-tile multiset (or a subset for smaller layouts).
 */

import { createRng, type Tile } from '../mahjong/tiles';
import {
  getNeighbors,
  isExposedFor,
  positionsFor,
  type SolitaireLayout
} from './layouts';
import { type Board, withFreshUndoBudget } from './board';
import {
  FLOWER_TILES,
  SEASON_TILES,
  buildWall144,
  canMatchTiles
} from './tiles';

export interface BoardOptions {
  layout?: SolitaireLayout;
  seed?: number;
  /** Include season/flower tiles (default: true when board needs ≥20 pairs). */
  includeBonus?: boolean;
  /** Prefer excluding lookalike ranks 6 & 9 for early teaching. */
  avoidLookalikes?: boolean;
  /** Force at least one season wild pair + one flower wild pair when bonus is on. */
  forceFlowerPairs?: boolean;
}

function shuffleInPlace<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

const LOOKALIKE_RANKS = new Set([6, 9]);

function isLookalike(tile: Tile): boolean {
  const suit = tile[0];
  if (suit !== 'm' && suit !== 'p' && suit !== 's') return false;
  return LOOKALIKE_RANKS.has(Number(tile.slice(1)));
}

/**
 * Pick `pairCount` matching pairs from the 144 wall.
 * Returns null if the wall cannot supply enough pairs under the given filters.
 */
function pickFacePairs(
  pairCount: number,
  rng: () => number,
  opts: {
    includeBonus: boolean;
    avoidLookalikes: boolean;
    forceFlowerPairs: boolean;
  }
): Tile[] | null {
  const faces: Tile[] = [];
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

  const takeFromBucket = (id: Tile): boolean => {
    const list = buckets.get(id);
    if (!list || list.length < 2) return false;
    faces.push(list.pop()!, list.pop()!);
    return true;
  };

  const takeWild = (group: Tile[]): boolean => {
    const available = group.filter((id) => (buckets.get(id)?.length ?? 0) > 0);
    if (available.length < 2) {
      for (const id of group) {
        if ((buckets.get(id)?.length ?? 0) >= 2) return takeFromBucket(id);
      }
      return false;
    }
    shuffleInPlace(available, rng);
    const a = available[0];
    const b = available[1];
    faces.push(buckets.get(a)!.pop()!, buckets.get(b)!.pop()!);
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
  while (faces.length / 2 < pairCount && guard < 10000) {
    guard += 1;
    let progressed = false;
    for (const id of exactIds) {
      if (faces.length / 2 >= pairCount) break;
      if (takeFromBucket(id)) progressed = true;
    }
    if (!progressed) {
      if (
        opts.includeBonus &&
        (takeWild(SEASON_TILES) || takeWild(FLOWER_TILES))
      ) {
        continue;
      }
      break;
    }
  }

  if (faces.length !== pairCount * 2) return null;
  return faces;
}

function dealSolvable(
  positions: { row: number; col: number; layer: number }[],
  nb: ReturnType<typeof getNeighbors>,
  rng: () => number,
  present: boolean[],
  facePairs: Tile[]
): (Tile | null)[] | null {
  const n = positions.length;
  const state = [...present];
  const total = state.reduce((sum, v) => sum + (v ? 1 : 0), 0);
  if (total % 2 !== 0) return null;
  const totalPairs = total / 2;
  if (facePairs.length < totalPairs * 2) return null;

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
    tiles[a] = facePairs[i * 2];
    tiles[b] = facePairs[i * 2 + 1];
  });
  return tiles;
}

function resolveDealOpts(options: BoardOptions, pairCount: number) {
  const includeBonus = options.includeBonus ?? pairCount >= 18;
  return {
    includeBonus,
    avoidLookalikes: options.avoidLookalikes ?? false,
    forceFlowerPairs: options.forceFlowerPairs ?? false
  };
}

export function createBoard(options: BoardOptions = {}): Board {
  const layout = options.layout ?? 'classic';
  const seed = options.seed ?? Math.floor(Math.random() * 2 ** 31);
  const positions = positionsFor(layout);
  const nb = getNeighbors(layout);
  const pairCount = positions.length / 2;
  const dealOpts = resolveDealOpts(options, pairCount);

  let tiles: (Tile | null)[] | null = null;
  for (let attempt = 0; attempt < 240; attempt += 1) {
    const rng = createRng(seed + attempt);
    const faces = pickFacePairs(pairCount, rng, dealOpts);
    if (!faces) continue;
    const present = new Array<boolean>(positions.length).fill(true);
    tiles = dealSolvable(positions, nb, rng, present, faces);
    if (tiles) break;
  }
  if (!tiles) {
    throw new Error(`could not deal a solvable ${layout} board`);
  }

  return withFreshUndoBudget({
    layout,
    positions,
    tiles,
    remaining: positions.length,
    history: [],
    freeUndosLeft: 0,
    seed
  });
}

export function reshuffle(board: Board, seed = Date.now()): Board {
  const positions = board.positions;
  const nb = getNeighbors(board.layout);
  const present = board.tiles.map((t) => t !== null);
  const pairCount = present.filter(Boolean).length / 2;
  if (pairCount <= 0) return board;

  const dealOpts = resolveDealOpts({}, pairCount);
  // Keep leftover faces when possible (preserve bonus presence from current board)
  const hasBonus = board.tiles.some(
    (t) => t && (SEASON_TILES.includes(t) || FLOWER_TILES.includes(t))
  );
  dealOpts.includeBonus = hasBonus || pairCount >= 18;

  for (let attempt = 0; attempt < 200; attempt += 1) {
    const rng = createRng(seed + attempt);
    const faces = pickFacePairs(pairCount, rng, dealOpts);
    if (!faces) continue;
    const tiles = dealSolvable(positions, nb, rng, present, faces);
    if (tiles) {
      return {
        ...board,
        tiles,
        history: [],
        seed: seed + attempt
        // freeUndosLeft preserved — shuffle is a tool, not a new level
      };
    }
  }
  return createBoard({ layout: board.layout, seed: seed + 200 });
}

/** Dead-end rescue: reshuffle remaining tiles into a solvable state. */
export function rescue(board: Board, seed = Date.now()): Board {
  return reshuffle(board, seed);
}

export { canMatchTiles };
