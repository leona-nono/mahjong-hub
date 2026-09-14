import {
  isTerminalOrHonour,
  tileRank,
  tileSuit,
  type Suit,
  type Tile
} from '../tiles';
import type { HandSet } from '../shanten';
import type { GameState, Seat } from '../engine';
import { applyDirectMcrExclusions, type McrFanId } from '../mcr-catalog';
import type { ScorePattern } from './types';
import { value, type ValueId } from './values';
import {
  countIdenticalRunPairs,
  hasIttsuu,
  hasSanshokuDoujun,
  hasSanshokuDoukou,
  isOutsideBlock
} from './shapes';

/**
 * 和绝张: the winning tile is the fourth and last copy, the other three being
 * already visible in a discard pile or an exposed meld. A concealed hand tile
 * is not visible to the table and therefore does not count.
 */
export function isLastCopy(state: GameState, seat: Seat, winningTile: Tile, selfDrawn: boolean): boolean {
  let seen = 0;
  for (const player of state.players) {
    for (const tile of player.discards) if (tile === winningTile) seen += 1;
    for (const meld of player.melds) {
      for (const tile of meld.tiles) if (tile === winningTile) seen += 1;
    }
  }
  // On a discard win the claimed tile is still sitting in the discard pile, so
  // it must not be counted twice against the winning tile itself.
  if (!selfDrawn) seen = Math.max(0, seen - 1);
  // The winner's own concealed copies are hidden, so only count what the hand
  // must additionally hold beyond the winning tile itself.
  const concealedCopies = state.players[seat].hand.filter((tile) => tile === winningTile).length;
  return seen + (selfDrawn ? concealedCopies - 1 : concealedCopies) >= 3;
}

/**
 * MCR's three one-point wait fans. They are mutually exclusive and read off
 * the partition the scorer selected: an edge wait completes 123 on the 3 or
 * 789 on the 7, a closed wait fills the middle of a chow, and a single wait
 * completes the pair.
 */
export function mcrWaitFan(sets: HandSet[], winningTile: Tile): { id: ValueId; label: string } | null {
  if (sets.some((block) => block.kind === 'pair' && block.tile === winningTile)) {
    return { id: 'singleWait', label: 'Single Wait' };
  }
  if (tileSuit(winningTile) === 'z') return null;
  const rank = tileRank(winningTile);
  for (const block of sets) {
    if (block.kind !== 'run' || tileSuit(block.tile) !== tileSuit(winningTile)) continue;
    const start = tileRank(block.tile);
    if (rank === start + 1) return { id: 'closedWait', label: 'Closed Wait' };
    if ((start === 1 && rank === 3) || (start === 7 && rank === 7)) {
      return { id: 'edgeWait', label: 'Edge Wait' };
    }
  }
  return null;
}

function hasPureTripleChow(blocks: HandSet[]): boolean {
  const count = new Map<string, number>();
  for (const block of blocks) {
    if (block.kind !== 'run') continue;
    count.set(block.tile, (count.get(block.tile) ?? 0) + 1);
  }
  return [...count.values()].some((amount) => amount >= 3);
}

function hasQuadrupleChow(blocks: HandSet[]): boolean {
  const count = new Map<string, number>();
  for (const block of blocks) {
    if (block.kind !== 'run') continue;
    count.set(block.tile, (count.get(block.tile) ?? 0) + 1);
  }
  return [...count.values()].some((amount) => amount >= 4);
}

/** Consecutive same-suit pungs, e.g. 222/333/444 or four shifted pungs. */
function hasShiftedPungs(blocks: HandSet[], required: number): boolean {
  for (const suit of ['m', 'p', 's']) {
    const ranks = new Set(blocks.filter((block) => block.kind === 'triplet' && tileSuit(block.tile) === suit).map((block) => tileRank(block.tile)));
    for (let start = 1; start <= 10 - required; start += 1) {
      if (Array.from({ length: required }, (_, offset) => start + offset).every((rank) => ranks.has(rank))) return true;
    }
  }
  return false;
}

/** Consecutive same-suit chow starts, e.g. 123/234/345. */
function hasShiftedChows(blocks: HandSet[], required: number): boolean {
  for (const suit of ['m', 'p', 's']) {
    const ranks = new Set(blocks.filter((block) => block.kind === 'run' && tileSuit(block.tile) === suit).map((block) => tileRank(block.tile)));
    for (let start = 1; start <= 8 - required; start += 1) {
      if (Array.from({ length: required }, (_, offset) => start + offset).every((rank) => ranks.has(rank))) return true;
    }
  }
  return false;
}

function hasMixedDoubleChow(blocks: HandSet[]): boolean {
  for (let rank = 1; rank <= 7; rank += 1) {
    const matches = ['m', 'p', 's'].filter((suit) => blocks.some((block) => block.kind === 'run' && block.tile === `${suit}${rank}`));
    if (matches.length >= 2) return true;
  }
  return false;
}

function hasShortStraight(blocks: HandSet[]): boolean {
  for (const suit of ['m', 'p', 's']) {
    const starts = blocks
      .filter((block) => block.kind === 'run' && tileSuit(block.tile) === suit)
      .map((block) => tileRank(block.tile));
    if (starts.some((start) => starts.includes(start + 3))) return true;
  }
  return false;
}

/** Three chows in all suits whose starts are consecutive in any suit order. */
function hasMixedShiftedChows(blocks: HandSet[]): boolean {
  const startsBySuit = new Map<Suit, number[]>();
  for (const suit of ['m', 'p', 's'] as Suit[]) {
    startsBySuit.set(suit, blocks.filter((block) => block.kind === 'run' && tileSuit(block.tile) === suit).map((block) => tileRank(block.tile)));
  }
  for (let start = 1; start <= 5; start += 1) {
    const needed = [start, start + 1, start + 2];
    const suits = ['m', 'p', 's'] as Suit[];
    if (suits.some((suit) => needed.some((rank) => startsBySuit.get(suit)!.includes(rank))) &&
      needed.every((rank) => suits.some((suit) => startsBySuit.get(suit)!.includes(rank)))) {
      const assignments = suits.flatMap((suit) => startsBySuit.get(suit)!.filter((rank) => needed.includes(rank)).map((rank) => `${suit}${rank}`));
      if (assignments.length >= 3) {
        for (const a of suits) for (const b of suits) for (const c of suits) {
          if (new Set([a, b, c]).size === 3 && startsBySuit.get(a)!.includes(start) && startsBySuit.get(b)!.includes(start + 1) && startsBySuit.get(c)!.includes(start + 2)) return true;
        }
      }
    }
  }
  return false;
}

function hasDoublePungs(blocks: HandSet[]): boolean {
  for (let rank = 1; rank <= 9; rank += 1) {
    if (['m', 'p', 's'].filter((suit) => blocks.some((block) => block.kind === 'triplet' && block.tile === `${suit}${rank}`)).length >= 2) return true;
  }
  return false;
}

/**
 * MCR may have more than one legal 4-meld + pair partition.  Unlike the old
 * first-match implementation, choose the partition with the highest value
 * among the MCR structure fans that this scorer can currently recognise.
 *
 * Global fans (flushes, flowers, winds and win circumstances) are identical
 * for every partition, so intentionally do not appear here.  This keeps the
 * selection deterministic while avoiding a false claim that unimplemented
 * catalogue entries are being evaluated.
 */
export function selectBestMcrDecomposition(
  candidates: HandSet[][],
  melds: Array<{ kind: 'chi' | 'pon' | 'kan'; tiles: Tile[]; concealed?: boolean }>,
  winningTile: Tile,
  selfDrawn: boolean
): HandSet[] | null {
  if (candidates.length === 0) return null;
  const withMelds = (sets: HandSet[]) => [
    ...sets,
    ...melds.map((meld) => ({
      kind: (meld.kind === 'chi' ? 'run' : 'triplet') as HandSet['kind'],
      tile: meld.tiles[0],
      open: !meld.concealed
    }))
  ];
  const potential = (sets: HandSet[]) => {
    const blocks = withMelds(sets);
    const runs = blocks.filter((block) => block.kind === 'run');
    const trips = blocks.filter((block) => block.kind === 'triplet');
    const concealedTrips = trips.filter((block) => !block.open && (selfDrawn || block.tile !== winningTile)).length;
    return mcrStructuralValue(blocks, runs, trips, concealedTrips);
  };
  return candidates.reduce((best, candidate) => potential(candidate) > potential(best) ? candidate : best);
}

/** 123 and 789 of the same suit, the shape behind several chow fans. */
function terminalChowSuits(runs: HandSet[]): Suit[] {
  return (['m', 'p', 's'] as Suit[]).filter((suit) =>
    runs.some((block) => block.tile === `${suit}1`) && runs.some((block) => block.tile === `${suit}7`)
  );
}

/** 123 / 456 / 789 spread across all three suits, in any order. */
function hasMixedStraight(runs: HandSet[]): boolean {
  const suits = ['m', 'p', 's'] as Suit[];
  for (const a of suits) {
    for (const b of suits) {
      for (const c of suits) {
        if (new Set([a, b, c]).size !== 3) continue;
        if (
          runs.some((block) => block.tile === `${a}1`) &&
          runs.some((block) => block.tile === `${b}4`) &&
          runs.some((block) => block.tile === `${c}7`)
        ) return true;
      }
    }
  }
  return false;
}

/** Three pungs, one per suit, on consecutive ranks. */
function hasMixedShiftedPungs(trips: HandSet[]): boolean {
  const suits = ['m', 'p', 's'] as Suit[];
  for (let start = 1; start <= 7; start += 1) {
    for (const a of suits) {
      for (const b of suits) {
        for (const c of suits) {
          if (new Set([a, b, c]).size !== 3) continue;
          if (
            trips.some((block) => block.tile === `${a}${start}`) &&
            trips.some((block) => block.tile === `${b}${start + 1}`) &&
            trips.some((block) => block.tile === `${c}${start + 2}`)
          ) return true;
        }
      }
    }
  }
  return false;
}

/** Every set and the pair contains a five. */
function isAllFivesBlock(block: HandSet): boolean {
  if (tileSuit(block.tile) === 'z') return false;
  const rank = tileRank(block.tile);
  return block.kind === 'run' ? rank >= 3 && rank <= 5 : rank === 5;
}

/**
 * The MCR fans that depend on how a winning hand is partitioned.
 *
 * There is a single list so scoring and decomposition selection can never
 * disagree: `mcrStructuralValue` sums it, `pushMcrStructuralPatterns` emits it.
 * Fans that are identical for every partition (flushes, winds, Flowers and the
 * circumstances of the win) are deliberately scored by the main scorer instead.
 */
function mcrStructuralFans(
  blocks: HandSet[],
  runs: HandSet[],
  trips: HandSet[],
  concealedTrips: number
): Array<{ id: ValueId; label: string }> {
  const fans: Array<{ id: ValueId; label: string }> = [];
  const add = (id: ValueId, label: string) => fans.push({ id, label });
  const pair = blocks.find((block) => block.kind === 'pair');
  const terminalSuits = terminalChowSuits(runs);

  if (trips.length === 4) add('allTriplets', 'All Pungs');
  if (runs.length === 4 && blocks.length === 5) add('allSequences', 'All Chows');

  // 一色双龙会 / 三色双龙会 both sit on 123 + 789 plus a pair of fives.
  const pairIsFive = Boolean(pair && tileSuit(pair.tile) !== 'z' && tileRank(pair.tile) === 5);
  if (runs.length === 4 && pairIsFive && terminalSuits.length === 1 &&
    runs.filter((block) => block.tile === `${terminalSuits[0]}1`).length === 2 &&
    runs.filter((block) => block.tile === `${terminalSuits[0]}7`).length === 2) {
    add('pureTerminalChows', 'Pure Terminal Chows');
  } else if (runs.length === 4 && pairIsFive && terminalSuits.length === 2 &&
    pair && !terminalSuits.includes(tileSuit(pair.tile))) {
    add('threeSuitedTerminalChows', 'Three-Suited Terminal Chows');
  } else if (terminalSuits.length > 0) {
    add('twoTerminalChows', 'Two Terminal Chows');
  }

  if (hasQuadrupleChow(runs)) add('quadrupleChow', 'Quadruple Chow');
  if (hasShiftedPungs(trips, 4)) add('fourShiftedPungs', 'Four Shifted Pungs');
  else if (hasShiftedPungs(trips, 3)) add('pureShiftedPungs', 'Pure Shifted Pungs');
  if (hasShiftedChows(runs, 4)) add('fourShiftedChows', 'Four Shifted Chows');
  else if (hasShiftedChows(runs, 3)) add('pureShiftedChows', 'Pure Shifted Chows');
  if (trips.length === 4 && blocks.every((block) => tileSuit(block.tile) !== 'z' && tileRank(block.tile) % 2 === 0)) add('allEvenPungs', 'All Even Pungs');
  if (blocks.every(isAllFivesBlock)) add('allFives', 'All Fives');
  if (hasPureTripleChow(runs)) add('pureTripleChow', 'Pure Triple Chow');
  else if (countIdenticalRunPairs(runs) > 0) add('pureDoubleChow', 'Pure Double Chow');
  if (hasIttsuu(runs)) add('pureStraight', 'Pure Straight');
  if (hasMixedStraight(runs)) add('mixedStraight', 'Mixed Straight');
  if (hasSanshokuDoujun(runs)) add('mixedTripleChow', 'Mixed Triple Chow');
  if (hasMixedShiftedChows(runs)) add('mixedShiftedChows', 'Mixed Shifted Chows');
  if (hasMixedDoubleChow(runs)) add('mixedDoubleChow', 'Mixed Double Chow');
  if (hasShortStraight(runs)) add('shortStraight', 'Short Straight');
  if (hasSanshokuDoukou(trips)) add('triplePung', 'Triple Pung');
  if (hasMixedShiftedPungs(trips)) add('mixedShiftedPungs', 'Mixed Shifted Pungs');
  if (hasDoublePungs(trips)) add('doublePungs', 'Double Pungs');
  if (trips.some((block) => isTerminalOrHonour(block.tile))) add('pungTerminalsHonours', 'Pung of Terminals or Honors');
  if (blocks.every((block) => isOutsideBlock(block, true))) add('outsideHand', 'Outside Hand');
  if (concealedTrips >= 3) add('threeConcealedPungs', 'Three Concealed Pungs');
  else if (concealedTrips >= 2) add('twoConcealedPungs', 'Two Concealed Pungs');
  return fans;
}

function mcrStructuralValue(blocks: HandSet[], runs: HandSet[], trips: HandSet[], concealedTrips: number): number {
  return mcrStructuralFans(blocks, runs, trips, concealedTrips)
    .reduce((total, fan) => total + value(fan.id, 'chinese-official'), 0);
}

export function pushMcrStructuralPatterns(
  push: (id: ValueId, label: string) => void,
  blocks: HandSet[],
  runs: HandSet[],
  trips: HandSet[],
  concealedTrips: number
): void {
  for (const fan of mcrStructuralFans(blocks, runs, trips, concealedTrips)) push(fan.id, fan.label);
}

/** Existing detector identifiers mapped to the official MCR catalogue ids. */
const MCR_PATTERN_IDS: Readonly<Record<string, McrFanId>> = {
  flower: 'flower-tiles',
  selfDraw: 'self-drawn',
  concealed: 'concealed-hand',
  fullyConcealed: 'fully-concealed-hand',
  allSimples: 'all-simples',
  allSequences: 'all-chows',
  dragonTriplet: 'dragon-pung',
  seatWind: 'seat-wind',
  roundWind: 'prevalent-wind',
  allTriplets: 'all-pungs',
  pureStraight: 'pure-straight',
  mixedTripleChow: 'mixed-triple-chow',
  mixedShiftedChows: 'mixed-shifted-chows',
  triplePung: 'triple-pung',
  pureTripleChow: 'pure-triple-chow',
  pureDoubleChow: 'pure-double-chow',
  mixedDoubleChow: 'mixed-double-chow',
  shortStraight: 'short-straight',
  doublePungs: 'double-pungs',
  pungTerminalsHonours: 'pung-terminals-honors',
  threeConcealedPungs: 'three-concealed-pungs',
  twoConcealedPungs: 'two-concealed-pungs',
  bigFourWinds: 'big-four-winds',
  smallFourWinds: 'little-four-winds',
  bigThreeWinds: 'big-three-winds',
  twoDragonPungs: 'two-dragon-pungs',
  allTerminals: 'all-terminals',
  allGreen: 'all-green',
  nineGates: 'nine-gates',
  sevenShiftedPairs: 'seven-shifted-pairs',
  outsideHand: 'outside-hand',
  allFives: 'all-fives',
  upperFour: 'upper-four',
  lowerFour: 'lower-four',
  mixedStraight: 'mixed-straight',
  reversibleTiles: 'reversible-tiles',
  mixedShiftedPungs: 'mixed-shifted-pungs',
  tileHog: 'tile-hog',
  meldedHand: 'melded-hand',
  twoTerminalChows: 'two-terminal-chows',
  threeSuitedTerminalChows: 'three-suited-terminal-chows',
  pureTerminalChows: 'pure-terminal-chows',
  mcrChickenHand: 'chicken-hand',
  robbingKong: 'robbing-kong',
  lastTileDraw: 'last-tile-draw',
  lastTileClaim: 'last-tile-claim',
  outWithReplacement: 'out-with-replacement',
  lastTile: 'last-tile',
  edgeWait: 'edge-wait',
  closedWait: 'closed-wait',
  singleWait: 'single-wait',
  meldedKong: 'melded-kong',
  concealedKong: 'concealed-kong',
  twoMeldedKongs: 'two-melded-kongs',
  twoConcealedKongs: 'two-concealed-kongs',
  threeKongs: 'three-kongs',
  fourKongs: 'four-kongs',
  allTypes: 'all-types',
  oneVoidedSuit: 'one-voided-suit',
  noHonours: 'no-honors',
  quadrupleChow: 'quadruple-chow',
  fourShiftedPungs: 'four-shifted-pungs',
  fourShiftedChows: 'four-shifted-chows',
  allEvenPungs: 'all-even-pungs',
  pureShiftedPungs: 'pure-shifted-pungs',
  pureShiftedChows: 'pure-shifted-chows',
  upperTiles: 'upper-tiles',
  middleTiles: 'middle-tiles',
  lowerTiles: 'lower-tiles',
  halfFlush: 'half-flush',
  sevenPairs: 'seven-pairs',
  littleThreeDragons: 'little-three-dragons',
  fullFlush: 'full-flush',
  allTerminalsHonours: 'all-terminals-honors',
  allHonours: 'all-honors',
  bigThreeDragons: 'big-three-dragons',
  fourConcealedTriplets: 'four-concealed-pungs',
  thirteenOrphans: 'thirteen-orphans'
};

/**
 * Apply only exclusions whose source and target have already been detected.
 * Structural alternatives (for example overlapping chow arrangements) are
 * selected separately as their detectors are implemented.
 */
export function applyMcrDirectExclusions(patterns: ScorePattern[]): ScorePattern[] {
  const mapped = patterns
    .map((pattern) => ({ pattern, mcrId: MCR_PATTERN_IDS[pattern.id] }))
    .filter((entry): entry is { pattern: ScorePattern; mcrId: McrFanId } => Boolean(entry.mcrId));
  const retainedMcr = new Set(applyDirectMcrExclusions(mapped.map((entry) => ({
    id: entry.mcrId,
    points: entry.pattern.value
  }))).map((entry) => entry.id));
  return patterns.filter((pattern) => {
    const mcrId = MCR_PATTERN_IDS[pattern.id];
    return !mcrId || retainedMcr.has(mcrId);
  });
}

/**
 * 无番和: a legal hand that scores no fan at all is worth eight points, which
 * is exactly the declaration threshold. Flowers are bonus points and never
 * make a hand non-chicken, so they are ignored here.
 */
export function withMcrChickenHand(patterns: ScorePattern[]): ScorePattern[] {
  if (patterns.some((pattern) => pattern.id !== 'flower')) return patterns;
  return [
    ...patterns,
    { id: 'mcrChickenHand', label: 'Chicken Hand', value: value('mcrChickenHand', 'chinese-official') }
  ];
}
