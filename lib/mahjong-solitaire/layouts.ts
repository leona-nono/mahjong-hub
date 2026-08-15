/**
 * Mahjong Solitaire layout geometry.
 *
 * Layouts:
 * - `flat36` (36) — single-layer teaching boards (levels 1–2)
 * - `mini` (72) — early / mid teaching
 * - `turtle` (74) — legacy compact turtle (kept for continuity)
 * - `classic` (144) — full Shanghai stack (P0 target)
 * - `pyramid` (90) — alternate shape
 */

export type SolitaireLayout =
  | 'flat36'
  | 'mini'
  | 'turtle'
  | 'classic'
  | 'pyramid'
  | 'fish'
  | 'butterfly'
  | 'gate';

export interface Pos {
  row: number;
  col: number;
  layer: number;
}

interface LayerSpec {
  rowOffset: number;
  colOffset?: number;
  rows: string[];
}

function positionsFromLayers(layers: LayerSpec[]): Pos[] {
  const positions: Pos[] = [];
  layers.forEach((layer, layerIdx) => {
    const colOff = layer.colOffset ?? 0;
    layer.rows.forEach((rowStr, r) => {
      const row = layer.rowOffset + r;
      for (let col = 0; col < rowStr.length; col += 1) {
        if (rowStr[col] === 'X') {
          positions.push({ row, col: col + colOff, layer: layerIdx });
        }
      }
    });
  });
  return positions;
}

/** Single-layer teaching board: 6×6 = 36. */
const FLAT36_LAYERS: LayerSpec[] = [
  {
    rowOffset: 0,
    rows: ['XXXXXX', 'XXXXXX', 'XXXXXX', 'XXXXXX', 'XXXXXX', 'XXXXXX']
  }
];

/** Teaching board: 72 tiles, 2 layers. */
const MINI_LAYERS: LayerSpec[] = [
  {
    rowOffset: 0,
    rows: [
      '..XXXXXX..',
      '.XXXXXXXX.',
      'XXXXXXXXXX',
      'XXXXXXXXXX',
      '.XXXXXXXX.',
      '..XXXXXX..'
    ]
  },
  {
    rowOffset: 1,
    colOffset: 1,
    rows: [
      '..XXXX..',
      '.XXXXXX.',
      '.XXXXXX.',
      '..XXXX..'
    ]
  }
];

/** Compact turtle (74) — existing product layout. */
const TURTLE_LAYERS: LayerSpec[] = [
  {
    rowOffset: 0,
    rows: [
      '....XX....',
      '...XXXX...',
      '..XXXXXX..',
      '.XXXXXXXX.',
      'XXXXXXXXXX',
      '.XXXXXXXX.',
      '..XXXXXX..',
      '...XXXX...',
      '....XX....'
    ]
  },
  {
    rowOffset: 2,
    rows: [
      '..XXXX..',
      '.XXXXXX.',
      '.XXXXXX.',
      '..XXXX..'
    ]
  },
  {
    rowOffset: 3,
    rows: ['..XX..', '..XX..']
  }
];

/**
 * Classic 144 stack: 80 + 48 + 16.
 * Each upper layer sits inside the one below (no floating tiles).
 */
const CLASSIC_LAYERS: LayerSpec[] = [
  {
    rowOffset: 0,
    rows: [
      'XXXXXXXXXX',
      'XXXXXXXXXX',
      'XXXXXXXXXX',
      'XXXXXXXXXX',
      'XXXXXXXXXX',
      'XXXXXXXXXX',
      'XXXXXXXXXX',
      'XXXXXXXXXX'
    ]
  },
  {
    rowOffset: 1,
    colOffset: 1,
    rows: [
      'XXXXXXXX',
      'XXXXXXXX',
      'XXXXXXXX',
      'XXXXXXXX',
      'XXXXXXXX',
      'XXXXXXXX'
    ]
  },
  {
    rowOffset: 2,
    colOffset: 3,
    rows: ['XXXX', 'XXXX', 'XXXX', 'XXXX']
  }
];

const PYRAMID_SIDES = [11, 9, 7, 5, 3];
const PYRAMID_COL_CENTER = 6;

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

/** Fish silhouette — 60 tiles (even). */
const FISH_LAYERS: LayerSpec[] = [
  {
    rowOffset: 0,
    rows: [
      '....XXXX....',
      '...XXXXXX...',
      '..XXXXXXXX..',
      '.XXXXXXXXXX.',
      '..XXXXXXXX..',
      '...XXXXXX...',
      '....XXXX....'
    ]
  },
  {
    rowOffset: 2,
    colOffset: 2,
    rows: ['..XXXX..', '.XXXXXX.', '..XXXX..']
  }
];

/** Butterfly wings — 60 tiles. */
const BUTTERFLY_LAYERS: LayerSpec[] = [
  {
    rowOffset: 0,
    rows: [
      'XX......XX',
      'XXX....XXX',
      'XXXX..XXXX',
      'XXXXXXXXXX',
      'XXXX..XXXX',
      'XXX....XXX',
      'XX......XX'
    ]
  },
  {
    rowOffset: 2,
    colOffset: 1,
    rows: ['..XXXX..', '.XXXXXX.', '..XXXX..']
  }
];

/** Gate / wall strip — 72 tiles. */
const GATE_LAYERS: LayerSpec[] = [
  {
    rowOffset: 0,
    rows: [
      'XXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXX'
    ]
  },
  {
    rowOffset: 0,
    colOffset: 2,
    rows: ['XXXXXXXXXXXX', 'XXXXXXXXXXXX']
  }
];

const LAYOUTS: Record<SolitaireLayout, Pos[]> = {
  flat36: positionsFromLayers(FLAT36_LAYERS),
  mini: positionsFromLayers(MINI_LAYERS),
  turtle: positionsFromLayers(TURTLE_LAYERS),
  classic: positionsFromLayers(CLASSIC_LAYERS),
  pyramid: positionsForPyramid(),
  fish: positionsFromLayers(FISH_LAYERS),
  butterfly: positionsFromLayers(BUTTERFLY_LAYERS),
  gate: positionsFromLayers(GATE_LAYERS)
};

/** Named free-play layouts shown in the picker (excludes tiny teaching boards). */
export const FREE_PLAY_LAYOUTS: SolitaireLayout[] = [
  'classic',
  'turtle',
  'pyramid',
  'fish',
  'butterfly',
  'gate',
  'mini'
];

export function positionsFor(layout: SolitaireLayout): Pos[] {
  return LAYOUTS[layout];
}

export function layoutTileCount(layout: SolitaireLayout): number {
  return LAYOUTS[layout].length;
}

export interface NeighborMaps {
  above: Int32Array;
  left: Int32Array;
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
