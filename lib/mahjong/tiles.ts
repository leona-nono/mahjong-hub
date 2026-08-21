/**
 * Tile model for the in-house mahjong engine.
 *
 * Clean-room implementation: rules are public-domain game mechanics, all code
 * here is written from scratch. Nothing is copied from a third-party engine.
 *
 * Encoding
 * --------
 * A tile is a string id: suit letter + rank.
 *   'm1'..'m9'  characters / 万 (man)
 *   'p1'..'p9'  dots / 筒 (pin)
 *   's1'..'s9'  bamboo / 条 (sou)
 *   'z1'..'z7'  honours: E S W N (winds), White Red Green (dragons)
 *
 * Internally most algorithms use a 34-length count array indexed by
 * `tileIndex()`, which is far cheaper than juggling strings.
 */

export type Suit = 'm' | 'p' | 's' | 'z';

export type Tile = string; // e.g. 'm1', 'z7'

/** Cosmetic-only flower tiles used by Mahjong Solitaire, never by four-player rules. */
/** Solitaire-only tiles: four seasons followed by four opera-mask specials. */
export const FLOWERS: Tile[] = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'];

export function isFlower(tile: Tile): boolean {
  return tile[0] === 'f';
}

export function isSpecialFace(tile: Tile): boolean {
  return isFlower(tile) && tileRank(tile) >= 5;
}

/** Seasons match seasons; the four opera-mask specials match each other. */
export function canSolitaireMatch(a: Tile, b: Tile): boolean {
  if (a === b) return true;
  if (!isFlower(a) || !isFlower(b)) return false;
  return (tileRank(a) <= 4) === (tileRank(b) <= 4);
}

/** Number of distinct tile kinds (9 * 3 suits + 7 honours). */
export const TILE_KINDS = 34;

/** Copies of each tile kind in a standard wall. */
export const COPIES_PER_TILE = 4;

export const SUITS: Suit[] = ['m', 'p', 's', 'z'];

const SUIT_OFFSET: Record<Suit, number> = { m: 0, p: 9, s: 18, z: 27 };

/** Wind honours in seat order: East, South, West, North. */
export const WINDS: Tile[] = ['z1', 'z2', 'z3', 'z4'];

/** Dragon honours: White (haku), Green (hatsu), Red (chun). */
export const DRAGONS: Tile[] = ['z5', 'z6', 'z7'];

export function makeTile(suit: Suit, rank: number): Tile {
  return `${suit}${rank}`;
}

export function tileSuit(tile: Tile): Suit {
  return tile[0] as Suit;
}

export function tileRank(tile: Tile): number {
  return Number(tile.slice(1));
}

/** Map a tile id to its 0..33 index. */
export function tileIndex(tile: Tile): number {
  if (isFlower(tile)) return 34 + tileRank(tile) - 1;
  return SUIT_OFFSET[tileSuit(tile)] + tileRank(tile) - 1;
}

/** Inverse of {@link tileIndex}. */
export function tileFromIndex(index: number): Tile {
  if (index < 9) return makeTile('m', index + 1);
  if (index < 18) return makeTile('p', index - 9 + 1);
  if (index < 27) return makeTile('s', index - 18 + 1);
  return makeTile('z', index - 27 + 1);
}

export function isHonour(tile: Tile): boolean {
  return tileSuit(tile) === 'z';
}

export function isWind(tile: Tile): boolean {
  return isHonour(tile) && tileRank(tile) <= 4;
}

export function isDragon(tile: Tile): boolean {
  return isHonour(tile) && tileRank(tile) >= 5;
}

/** Terminals are the 1s and 9s of the numbered suits. */
export function isTerminal(tile: Tile): boolean {
  if (isHonour(tile)) return false;
  const r = tileRank(tile);
  return r === 1 || r === 9;
}

/** "Yaochuu" — terminals plus honours. */
export function isTerminalOrHonour(tile: Tile): boolean {
  return isHonour(tile) || isTerminal(tile);
}

/** Simples are 2..8 of the numbered suits. */
export function isSimple(tile: Tile): boolean {
  return !isTerminalOrHonour(tile);
}

/** The 13 tile kinds needed for Thirteen Orphans. */
export const ORPHAN_TILES: Tile[] = [
  'm1',
  'm9',
  'p1',
  'p9',
  's1',
  's9',
  'z1',
  'z2',
  'z3',
  'z4',
  'z5',
  'z6',
  'z7'
];

/**
 * Build a fresh 136-tile wall (no flowers/seasons — those are cosmetic in the
 * rulesets we ship and only add bookkeeping).
 */
export function buildWall(): Tile[] {
  const wall: Tile[] = [];
  for (let i = 0; i < TILE_KINDS; i += 1) {
    const tile = tileFromIndex(i);
    for (let c = 0; c < COPIES_PER_TILE; c += 1) wall.push(tile);
  }
  return wall;
}

/** A seeded PRNG so games are reproducible in tests and replays. */
export function createRng(seed: number): () => number {
  // mulberry32 — small, fast, good enough for shuffling a wall.
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates, in place, using the supplied RNG. */
export function shuffle<T>(items: T[], rng: () => number): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/** Convert a hand of tiles into a 34-length count array. */
export function toCounts(tiles: Tile[]): number[] {
  const counts = new Array<number>(TILE_KINDS).fill(0);
  for (const tile of tiles) counts[tileIndex(tile)] += 1;
  return counts;
}

/** Convert a count array back into a sorted tile list. */
export function fromCounts(counts: number[]): Tile[] {
  const tiles: Tile[] = [];
  for (let i = 0; i < TILE_KINDS; i += 1) {
    for (let c = 0; c < counts[i]; c += 1) tiles.push(tileFromIndex(i));
  }
  return tiles;
}

/** Sort tiles into conventional display order (m, p, s, z; ascending rank). */
export function sortTiles(tiles: Tile[]): Tile[] {
  return [...tiles].sort((a, b) => tileIndex(a) - tileIndex(b));
}

const SUIT_LABEL: Record<Suit, string> = {
  m: '万',
  p: '筒',
  s: '条',
  z: ''
};

const HONOUR_LABEL: Record<number, string> = {
  1: '東',
  2: '南',
  3: '西',
  4: '北',
  5: '白',
  6: '發',
  7: '中'
};

/** Short CJK face label used on the tile faces in the UI. */
export function tileFace(tile: Tile): string {
  if (isFlower(tile)) return ['春', '夏', '秋', '冬', '生', '旦', '淨', '丑'][tileRank(tile) - 1];
  const suit = tileSuit(tile);
  const rank = tileRank(tile);
  if (suit === 'z') return HONOUR_LABEL[rank];
  return `${rank}${SUIT_LABEL[suit]}`;
}

const HONOUR_NAME: Record<number, string> = {
  1: 'East',
  2: 'South',
  3: 'West',
  4: 'North',
  5: 'White Dragon',
  6: 'Green Dragon',
  7: 'Red Dragon'
};

const SUIT_NAME: Record<Suit, string> = {
  m: 'Characters',
  p: 'Dots',
  s: 'Bamboo',
  z: 'Honour'
};

/** Accessible English name, used for aria-labels and alt text (also good SEO). */
export function tileName(tile: Tile): string {
  if (isFlower(tile)) return ['Spring', 'Summer', 'Autumn', 'Winter', 'Sheng Mask', 'Dan Mask', 'Jing Mask', 'Chou Mask'][tileRank(tile) - 1];
  const suit = tileSuit(tile);
  const rank = tileRank(tile);
  if (suit === 'z') return HONOUR_NAME[rank];
  return `${rank} of ${SUIT_NAME[suit]}`;
}
