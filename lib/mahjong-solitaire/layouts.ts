/**
 * Mahjong Solitaire (单人麻将消除) — layout geometry.
 *
 * A layout is a set of slots, each described by a (layer, row, col) triple.
 * Layer 0 is the base of the stack; a tile at (layer, row, col) rests directly
 * on the tile at (layer - 1, row, col), so every higher layer is strictly
 * contained in the one below it. This module only knows geometry — it does not
 * know about tile faces or game state — and exposes the shared exposure
 * primitive that both the board model and the generator use.
 *
 * Written from scratch; the rules are public game mechanics.
 */

export type SolitaireLayout = 'turtle' | 'pyramid';

export interface Pos {
  row: number;
  col: number;
  layer: number;
}

// ---------------------------------------------------------------------------
// Layout definitions
// ---------------------------------------------------------------------------

interface LayerSpec {
  /** Absolute row of the first string in `rows` (layer 0 starts at 0). */
  rowOffset: number;
  rows: string[];
}

/** Classic turtle (龟甲): a wide oval, a smaller oval on top, a little cap. */
const TURTLE_LAYERS: LayerSpec[] = [
  {
    rowOffset: 0,
    rows: [
      '....XX....', // 2
      '...XXXX...', // 4
      '..XXXXXX..', // 6
      '.XXXXXXXX.', // 8
      'XXXXXXXXXX', // 10
      '.XXXXXXXX.', // 8
      '..XXXXXX..', // 6
      '...XXXX...', // 4
      '....XX....' // 2  -> 50
    ]
  },
  {
    rowOffset: 2,
    rows: [
      '..XXXX..', // 4
      '.XXXXXX.', // 6
      '.XXXXXX.', // 6
      '..XXXX..' // 4  -> 20
    ]
  },
  {
    rowOffset: 3,
    rows: [
      '..XX..', // 2
      '..XX..' // 2  -> 4
    ]
  }
];

/** Pyramid (金字塔): centred triangles stacked so each sits inside the one below. */
const PYRAMID_SIDES = [11, 9, 7, 5, 3];
const PYRAMID_COL_CENTER = 6;

function positionsFromLayers(layers: LayerSpec[]): Pos[] {
  const positions: Pos[] = [];
  layers.forEach((layer, layerIdx) => {
    layer.rows.forEach((rowStr, r) => {
      const row = layer.rowOffset + r;
      for (let col = 0; col < rowStr.length; col += 1) {
        if (rowStr[col] === 'X') positions.push({ row, col, layer: layerIdx });
      }
    });
  });
  return positions;
}

function positionsForPyramid(): Pos[] {
  const positions: Pos[] = [];
  PYRAMID_SIDES.forEach((side, layer) => {
    const rows = (side + 1) / 2;
    for (let r = 0; r < rows; r += 1) {
      const count = side - 2 * r;
      const colStart = PYRAMID_COL_CENTER - Math.floor(count / 2);
      for (let c = colStart; c < colStart + count; c += 1) {
        positions.push({ row: r, col: c, layer });
      }
    }
  });
  return positions;
}

const LAYOUTS: Record<SolitaireLayout, Pos[]> = {
  turtle: positionsFromLayers(TURTLE_LAYERS),
  pyramid: positionsForPyramid()
};

/** All slots of a layout, in a fixed order (stable across boards). */
export function positionsFor(layout: SolitaireLayout): Pos[] {
  return LAYOUTS[layout];
}

// ---------------------------------------------------------------------------
// Neighbour lookup (pure geometry)
// ---------------------------------------------------------------------------

export interface NeighborMaps {
  /** Index of the tile directly above (same row/col, layer + 1), or -1. */
  above: Int32Array;
  /** Index of the tile to the left (same layer, col - 1), or -1. */
  left: Int32Array;
  /** Index of the tile to the right (same layer, col + 1), or -1. */
  right: Int32Array;
}

const neighborCache = new Map<SolitaireLayout, NeighborMaps>();

function buildNeighbors(positions: Pos[]): NeighborMaps {
  const n = positions.length;
  const above = new Int32Array(n);
  const left = new Int32Array(n);
  const right = new Int32Array(n);
  const byKey = new Map<string, number>();
  positions.forEach((p, i) => byKey.set(`${p.row},${p.col},${p.layer}`, i));
  for (let i = 0; i < n; i += 1) {
    const p = positions[i];
    above[i] = byKey.get(`${p.row},${p.col},${p.layer + 1}`) ?? -1;
    left[i] = byKey.get(`${p.row},${p.col - 1},${p.layer}`) ?? -1;
    right[i] = byKey.get(`${p.row},${p.col + 1},${p.layer}`) ?? -1;
  }
  return { above, left, right };
}

export function getNeighbors(layout: SolitaireLayout): NeighborMaps {
  let maps = neighborCache.get(layout);
  if (!maps) {
    maps = buildNeighbors(LAYOUTS[layout]);
    neighborCache.set(layout, maps);
  }
  return maps;
}

/**
 * The exposure rule — "左右有一侧空且顶部无遮挡": the tile is free on at least
 * one side at its own layer, and nothing rests directly on top of it.
 *
 * `present[i]` marks whether slot `i` currently holds a tile (removed slots and
 * never-filled slots both count as "empty"). This is the shared primitive the
 * board model and the solvable generator both reason over.
 */
export function isExposedFor(
  nb: NeighborMaps,
  present: boolean[],
  i: number
): boolean {
  const topFree = nb.above[i] === -1 || !present[nb.above[i]];
  const leftFree = nb.left[i] === -1 || !present[nb.left[i]];
  const rightFree = nb.right[i] === -1 || !present[nb.right[i]];
  return topFree && (leftFree || rightFree);
}
