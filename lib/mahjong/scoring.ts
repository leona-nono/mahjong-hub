/**
 * Hand scoring.
 *
 * The three rulesets we ship score on different scales, but they recognise a
 * largely overlapping set of patterns. Rather than maintain three separate
 * tables, we detect patterns once and look the value up per ruleset.
 *
 * This is a deliberately pragmatic subset — the common, recognisable patterns
 * that cover the overwhelming majority of real hands. It is not a tournament
 * scorer, and the value tables are the first thing to extend when we add a
 * competitive mode. Patterns are returned alongside the total so the UI can
 * show players *why* they scored, which is the main teaching moment in a hand.
 */

import {
  isDragon,
  isHonour,
  isSimple,
  isTerminalOrHonour,
  tileIndex,
  tileRank,
  tileSuit,
  toCounts,
  type Suit,
  type Tile
} from './tiles';
import {
  decomposeWin,
  shantenSevenPairs,
  shantenThirteenOrphans,
  type HandSet
} from './shanten';
import type { GameState, Seat, Ruleset } from './engine';
import { calculateRiichiPayment, countDora, roundFu, uraDoraIndicators, visibleDoraIndicators } from './riichi';

export interface ScorePattern {
  id: string;
  label: string;
  value: number;
}

export interface ScoreResult {
  total: number;
  patterns: ScorePattern[];
  /** True when the hand is a limit hand for the ruleset. */
  limit: boolean;
  /** Riichi requires at least one yaku. */
  legalYaku?: boolean;
  han?: number;
  fu?: number;
  points?: number;
  paymentLabel?: string;
}

/** Fan values per ruleset. Missing entries fall back to the Hong Kong value. */
const VALUES: Record<string, Partial<Record<Ruleset, number>> & { base: number }> = {
  chickenHand: { base: 1, riichi: 0, 'chinese-official': 0 },
  selfDraw: { base: 1, 'chinese-official': 1, riichi: 1 },
  riichi: { base: 0, riichi: 1 },
  ippatsu: { base: 0, riichi: 1 },
  pinfu: { base: 0, riichi: 1 },
  iipeikou: { base: 0, riichi: 1 },
  ryanpeikou: { base: 0, riichi: 3 },
  ittsuu: { base: 0, riichi: 2 },
  sanshokuDoujun: { base: 0, riichi: 2 },
  sanshokuDoukou: { base: 0, riichi: 2 },
  chanta: { base: 0, riichi: 2 },
  junchan: { base: 0, riichi: 3 },
  honroutou: { base: 0, riichi: 2 },
  sanankou: { base: 0, riichi: 2 },
  sankantsu: { base: 0, riichi: 2 },
  smallFourWinds: { base: 0, riichi: 13 },
  bigFourWinds: { base: 0, riichi: 13 },
  allTerminals: { base: 0, riichi: 13 },
  allGreen: { base: 0, riichi: 13 },
  fourKans: { base: 0, riichi: 13 },
  concealed: { base: 1, 'chinese-official': 2, riichi: 1 },
  allSimples: { base: 1, 'chinese-official': 2, riichi: 1 },
  allSequences: { base: 1, 'chinese-official': 2, riichi: 1 },
  dragonTriplet: { base: 1, 'chinese-official': 2, riichi: 1 },
  seatWind: { base: 1, 'chinese-official': 2, riichi: 1 },
  roundWind: { base: 1, 'chinese-official': 2, riichi: 1 },
  allTriplets: { base: 3, 'chinese-official': 6, riichi: 2 },
  halfFlush: { base: 3, 'chinese-official': 6, riichi: 2 },
  sevenPairs: { base: 4, 'chinese-official': 24, riichi: 2 },
  littleThreeDragons: { base: 5, 'chinese-official': 6, riichi: 2 },
  fullFlush: { base: 7, 'chinese-official': 24, riichi: 6 },
  allTerminalsHonours: { base: 10, 'chinese-official': 32, riichi: 13 },
  allHonours: { base: 10, 'chinese-official': 64, riichi: 13 },
  bigThreeDragons: { base: 8, 'chinese-official': 88, riichi: 13 },
  fourConcealedTriplets: { base: 10, 'chinese-official': 64, riichi: 13 },
  thirteenOrphans: { base: 10, 'chinese-official': 88, riichi: 13 }
};

const LIMIT: Record<Ruleset, number> = {
  hongkong: 10,
  riichi: 13,
  'chinese-official': 88
};

function value(id: keyof typeof VALUES, ruleset: Ruleset): number {
  const entry = VALUES[id];
  return entry[ruleset] ?? entry.base;
}

export interface ScoreInput {
  state: GameState;
  seat: Seat;
  winningTile: Tile;
  selfDrawn: boolean;
}

export function scoreHand(input: ScoreInput): ScoreResult {
  const { state, seat, selfDrawn, winningTile } = input;
  const ruleset = state.ruleset;
  const player = state.players[seat];
  const patterns: ScorePattern[] = [];

  // A self-drawn win already holds the winning tile; a discard win (ron) does
  // not — the claimed tile leaves the discard pile and completes the hand.
  const concealedTiles = selfDrawn ? [...player.hand] : [...player.hand, winningTile];
  const meldTiles = player.melds.flatMap((m) => m.tiles);
  const allTiles = [...concealedTiles, ...meldTiles];
  const counts = toCounts(concealedTiles);
  const isConcealed = player.melds.every((m) => m.concealed);

  const push = (id: keyof typeof VALUES, label: string) => {
    patterns.push({ id, label, value: value(id, ruleset) });
  };

  if (ruleset === 'riichi' && player.declaredReady && isConcealed) {
    push('riichi', 'Riichi');
    if (player.ippatsuEligible) {
      push('ippatsu', 'Ippatsu');
    }
  }

  // --- Limit hands checked first; they short-circuit everything else. -------
  if (isConcealed && shantenThirteenOrphans(counts) === -1) {
    push('thirteenOrphans', 'Thirteen Orphans');
    return finalise(patterns, ruleset, true);
  }

  const sets = decomposeWin(counts, player.melds.length);
  const isSevenPairs =
    isConcealed && sets === null && shantenSevenPairs(counts, ruleset) === -1;

  if (isSevenPairs) {
    push('sevenPairs', 'Seven Pairs');
  }

  // --- Suit composition ----------------------------------------------------
  const suitsUsed = new Set<Suit>();
  let honourCount = 0;
  for (const tile of allTiles) {
    const suit = tileSuit(tile);
    if (suit === 'z') honourCount += 1;
    else suitsUsed.add(suit);
  }

  if (honourCount === allTiles.length) {
    push('allHonours', 'All Honours');
    return finalise(patterns, ruleset, true);
  }
  if (suitsUsed.size === 1 && honourCount === 0) {
    if (ruleset === 'riichi') patterns.push({ id: 'fullFlush', label: 'Full Flush', value: isConcealed ? 6 : 5 });
    else push('fullFlush', 'Full Flush');
  } else if (suitsUsed.size === 1 && honourCount > 0) {
    if (ruleset === 'riichi') patterns.push({ id: 'halfFlush', label: 'Half Flush', value: isConcealed ? 3 : 2 });
    else push('halfFlush', 'Half Flush');
  }

  if (allTiles.every(isTerminalOrHonour)) {
    if (ruleset === 'riichi') {
      const noHonours = allTiles.every((tile) => tileSuit(tile) !== 'z');
      if (noHonours) {
        push('allTerminals', 'All Terminals');
        return finalise(patterns, ruleset, true);
      }
      push('honroutou', 'All Terminals and Honours');
    } else {
      push('allTerminalsHonours', 'All Terminals and Honours');
    }
  }
  if (ruleset === 'riichi' && allTiles.every(isGreenTile)) {
    push('allGreen', 'All Green');
    return finalise(patterns, ruleset, true);
  }
  if (allTiles.every(isSimple)) {
    push('allSimples', 'All Simples');
  }

  // --- Dragons -------------------------------------------------------------
  const allCounts = toCounts(allTiles);
  let dragonSets = 0;
  let dragonPairs = 0;
  for (const tile of ['z5', 'z6', 'z7'] as Tile[]) {
    const n = allCounts[tileIndex(tile)];
    if (n >= 3) dragonSets += 1;
    else if (n === 2) dragonPairs += 1;
  }
  if (dragonSets === 3) {
    push('bigThreeDragons', 'Big Three Dragons');
    return finalise(patterns, ruleset, true);
  }

  if (ruleset === 'riichi') {
    const windCounts = (['z1', 'z2', 'z3', 'z4'] as Tile[]).map((tile) => allCounts[tileIndex(tile)]);
    if (windCounts.filter((count) => count >= 3).length === 4) {
      push('bigFourWinds', 'Big Four Winds');
      return finalise(patterns, ruleset, true);
    }
    if (windCounts.filter((count) => count >= 3).length === 3 && windCounts.some((count) => count === 2)) {
      push('smallFourWinds', 'Little Four Winds');
      return finalise(patterns, ruleset, true);
    }
  }
  if (dragonSets === 2 && dragonPairs === 1) {
    push('littleThreeDragons', 'Little Three Dragons');
  } else {
    for (let i = 0; i < dragonSets; i += 1) {
      push('dragonTriplet', 'Dragon Triplet');
    }
  }

  // --- Winds ---------------------------------------------------------------
  if (allCounts[tileIndex(player.seatWind)] >= 3) {
    push('seatWind', 'Seat Wind Triplet');
  }
  if (
    state.roundWind !== player.seatWind &&
    allCounts[tileIndex(state.roundWind)] >= 3
  ) {
    push('roundWind', 'Round Wind Triplet');
  }

  // --- Set-structure patterns (standard hands only) ------------------------
  if (sets) {
    const blocks: HandSet[] = [
      ...sets,
      ...player.melds.map((m) => ({
        kind: (m.kind === 'chi' ? 'run' : 'triplet') as HandSet['kind'],
        tile: m.tiles[0],
        open: !m.concealed
      }))
    ];
    const tripletBlocks = blocks.filter((b) => b.kind === 'triplet');
    const runBlocks = blocks.filter((b) => b.kind === 'run');

    if (tripletBlocks.length === 4) {
      const concealedTriplets = tripletBlocks.filter((b) => !b.open).length;
      if (concealedTriplets === 4 && isConcealed) {
        push('fourConcealedTriplets', 'Four Concealed Triplets');
        return finalise(patterns, ruleset, true);
      }
      push('allTriplets', 'All Triplets');
    }
    if (ruleset === 'riichi') {
      const pair = sets.find((block) => block.kind === 'pair')?.tile;
      const valuePair = Boolean(pair && (isDragon(pair) || pair === player.seatWind || pair === state.roundWind));
      const twoSidedWait = hasTwoSidedWait(sets, winningTile);
      if (runBlocks.length === 4 && isConcealed && !valuePair && twoSidedWait) {
        push('pinfu', 'Pinfu');
      }
      const identicalRunPairs = countIdenticalRunPairs(runBlocks);
      if (isConcealed && identicalRunPairs >= 2) push('ryanpeikou', 'Two Identical Sequences');
      else if (isConcealed && identicalRunPairs >= 1) push('iipeikou', 'One Identical Sequence');
      if (hasIttsuu(runBlocks)) push('ittsuu', 'Pure Straight');
      if (hasSanshokuDoujun(runBlocks)) push('sanshokuDoujun', 'Mixed Triple Sequence');
      if (hasSanshokuDoukou(tripletBlocks)) push('sanshokuDoukou', 'Triple Triplets');
      if (hasJunchan(blocks)) push('junchan', 'Pure Outside Hand');
      else if (hasChanta(blocks)) push('chanta', 'Mixed Outside Hand');
      if (tripletBlocks.filter((block) => !block.open).length >= 3) push('sanankou', 'Three Concealed Triplets');
      if (player.melds.filter((meld) => meld.kind === 'kan').length >= 4) {
        push('fourKans', 'Four Kans');
        return finalise(patterns, ruleset, true);
      }
      if (player.melds.filter((meld) => meld.kind === 'kan').length >= 3) push('sankantsu', 'Three Kans');
    } else if (runBlocks.length === 4 && isConcealed) {
      push('allSequences', 'All Sequences');
    }
  }

  // --- Conditions of the win itself ----------------------------------------
  if (selfDrawn && (ruleset !== 'riichi' || isConcealed)) push('selfDraw', 'Self Draw');
  if (isConcealed && ruleset !== 'riichi') push('concealed', 'Fully Concealed');

  // Beginner-friendly product mode: a structurally complete zero-Fan hand
  // becomes a one-Fan chicken hand, so it settles for a non-zero score.
  if (
    ruleset === 'hongkong' &&
    state.hongKongMode === 'casual' &&
    patterns.reduce((sum, pattern) => sum + pattern.value, 0) === 0
  ) {
    push('chickenHand', 'Chicken Hand (Casual)');
  }

  if (ruleset === 'riichi') {
    const visible = countDora(allTiles, visibleDoraIndicators(state));
    if (visible > 0) patterns.push({ id: 'dora', label: 'Dora', value: visible });
    if (player.declaredReady) {
      const ura = countDora(allTiles, uraDoraIndicators(state));
      if (ura > 0) patterns.push({ id: 'uraDora', label: 'Ura Dora', value: ura });
    }

    const pair = sets?.find((block) => block.kind === 'pair')?.tile;
    const isPinfu = Boolean(
      sets &&
      isConcealed &&
      sets.filter((block) => block.kind === 'run').length === 4 &&
      pair &&
      !isDragon(pair) &&
      pair !== player.seatWind &&
      pair !== state.roundWind &&
      hasTwoSidedWait(sets, winningTile)
    );
    let fu = isSevenPairs ? 25 : 20;
    if (!isSevenPairs) {
      if (isConcealed && !selfDrawn) fu += 10;
      if (selfDrawn && !isPinfu) fu += 2;
      if (pair && isDragon(pair)) fu += 2;
      if (pair === player.seatWind) fu += 2;
      if (pair === state.roundWind) fu += 2;
      for (const block of sets ?? []) {
        if (block.kind !== 'triplet') continue;
        fu += isSimple(block.tile) ? 4 : 8;
      }
      for (const meld of player.melds) {
        if (meld.kind === 'chi') continue;
        const terminal = !isSimple(meld.tiles[0]);
        if (meld.kind === 'pon') fu += terminal ? 4 : 2;
        if (meld.kind === 'kan') {
          fu += meld.concealed ? (terminal ? 32 : 16) : (terminal ? 16 : 8);
        }
      }
      fu += waitFu(sets ?? [], winningTile);
      if (!isConcealed && fu === 20) fu = 30;
      fu = roundFu(fu);
    }
    const han = patterns.reduce((sum, pattern) => sum + pattern.value, 0);
    const payment = calculateRiichiPayment({
      han,
      fu,
      winner: seat,
      dealer: state.dealer,
      selfDrawn
    });
    return finalise(patterns, ruleset, false, fu, payment.winnerGain, payment.label);
  }
  return finalise(patterns, ruleset, false);
}

function isGreenTile(tile: Tile): boolean {
  return (['s2', 's3', 's4', 's6', 's8', 'z6'] as Tile[]).includes(tile);
}

function countIdenticalRunPairs(blocks: HandSet[]): number {
  const count = new Map<string, number>();
  for (const block of blocks) {
    if (block.kind !== 'run') continue;
    count.set(block.tile, (count.get(block.tile) ?? 0) + 1);
  }
  return [...count.values()].reduce((total, value) => total + Math.floor(value / 2), 0);
}

function hasIttsuu(blocks: HandSet[]): boolean {
  for (const suit of ['m', 'p', 's']) {
    if ([1, 4, 7].every((rank) => blocks.some((block) => block.kind === 'run' && block.tile === `${suit}${rank}`))) return true;
  }
  return false;
}

function hasSanshokuDoujun(blocks: HandSet[]): boolean {
  for (let rank = 1; rank <= 7; rank += 1) {
    if (['m', 'p', 's'].every((suit) => blocks.some((block) => block.kind === 'run' && block.tile === `${suit}${rank}`))) return true;
  }
  return false;
}

function hasSanshokuDoukou(blocks: HandSet[]): boolean {
  for (let rank = 1; rank <= 9; rank += 1) {
    if (['m', 'p', 's'].every((suit) => blocks.some((block) => block.kind === 'triplet' && block.tile === `${suit}${rank}`))) return true;
  }
  return false;
}

function isOutsideBlock(block: HandSet, allowHonours: boolean): boolean {
  if (block.kind === 'run') return tileRank(block.tile) === 1 || tileRank(block.tile) === 7;
  return allowHonours ? isTerminalOrHonour(block.tile) : tileSuit(block.tile) !== 'z' && !isSimple(block.tile);
}

function hasChanta(blocks: HandSet[]): boolean {
  return blocks.some((block) => block.kind === 'run') && blocks.every((block) => isOutsideBlock(block, true));
}

function hasJunchan(blocks: HandSet[]): boolean {
  return blocks.some((block) => block.kind === 'run') && blocks.every((block) => isOutsideBlock(block, false));
}

function hasTwoSidedWait(sets: HandSet[], winningTile: Tile): boolean {
  if (tileSuit(winningTile) === 'z') return false;
  const rank = tileRank(winningTile);
  return sets.some((block) => {
    if (block.kind !== 'run' || tileSuit(block.tile) !== tileSuit(winningTile)) return false;
    const start = tileRank(block.tile);
    return (rank === start && start > 1) || (rank === start + 2 && start < 7);
  });
}

function waitFu(sets: HandSet[], winningTile: Tile): number {
  if (sets.some((block) => block.kind === 'pair' && block.tile === winningTile)) return 2;
  if (tileSuit(winningTile) === 'z') return 0;
  const rank = tileRank(winningTile);
  const hasBadRun = sets.some((block) => {
    if (block.kind !== 'run' || tileSuit(block.tile) !== tileSuit(winningTile)) return false;
    const start = tileRank(block.tile);
    return rank === start + 1 || (start === 1 && rank === 3) || (start === 7 && rank === 7);
  });
  return hasBadRun ? 2 : 0;
}

function finalise(
  patterns: ScorePattern[],
  ruleset: Ruleset,
  forcedLimit: boolean,
  fu?: number,
  points?: number,
  paymentLabel?: string
): ScoreResult {
  const raw = patterns.reduce((sum, p) => sum + p.value, 0);
  const cap = LIMIT[ruleset];
  const total = Math.min(raw, cap);
  return {
    total,
    patterns,
    limit: forcedLimit || raw >= cap,
    legalYaku: ruleset !== 'riichi' || forcedLimit || patterns.some(
      (pattern) => pattern.id !== 'dora' && pattern.id !== 'uraDora'
    ),
    han: ruleset === 'riichi' ? raw : undefined,
    fu,
    points,
    paymentLabel
  };
}

/** Convenience for the UI: a one-line summary of a score result. */
export function describeScore(result: ScoreResult): string {
  if (result.patterns.length === 0) return 'No scoring patterns';
  return result.patterns.map((p) => `${p.label} (+${p.value})`).join(' · ');
}

/** Re-exported so callers do not need to reach into tiles.ts for this check. */
export { isDragon, isHonour };
