/**
 * Hand scoring orchestrator.
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
  isSimple,
  isRedFive,
  isTerminalOrHonour,
  tileFromIndex,
  tileIndex,
  tileRank,
  tileSuit,
  toCounts,
  type Suit,
  type Tile
} from '../tiles';
import {
  decomposeWin,
  decomposeWins,
  shantenSevenPairs,
  shantenThirteenOrphans,
  type HandSet
} from '../shanten';
import type { Ruleset } from '../engine';
import { calculateRiichiPayment, countDora, roundFu, uraDoraIndicators, visibleDoraIndicators } from '../riichi';
import type { ScoreInput, ScorePattern, ScoreResult } from './types';
import { LIMIT, value, type ValueId } from './values';
import {
  hasChanta,
  hasIttsuu,
  hasJunchan,
  hasSanshokuDoujun,
  hasSanshokuDoukou,
  hasTwoSidedWait,
  isGreenTile,
  isNineGates,
  isReversibleTile,
  isSevenShiftedPairs,
  countIdenticalRunPairs
} from './shapes';
import { waitFu } from './fu';
import { noDiscardHasOccurred, selectBestRiichiDecomposition } from './yaku-riichi';
import {
  applyMcrDirectExclusions,
  isLastCopy,
  mcrWaitFan,
  pushMcrStructuralPatterns,
  selectBestMcrDecomposition,
  withMcrChickenHand
} from './fans-mcr';
import { isHongKongCasualChickenHand } from './fans-hongkong';

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

  const push = (id: ValueId, label: string) => {
    patterns.push({ id, label, value: value(id, ruleset) });
  };
  const pushYakuman = (id: ValueId, label: string) => {
    patterns.push({ id, label, value: value(id, ruleset), yakuman: true });
  };
  const pushRiichiValue = (id: string, label: string, closedValue: number, openValue = closedValue) => {
    patterns.push({ id, label, value: isConcealed ? closedValue : openValue });
  };

  // MCR awards one point for every exposed Flower / Season. These are real
  // settlement points, but cannot be used to satisfy the 8-point declaration
  // threshold by themselves (or in combination with fewer than 8 hand points).
  if (ruleset === 'chinese-official') {
    for (const flower of player.flowers) {
      patterns.push({ id: 'flower', label: `Flower / Season (${flower})`, value: 1 });
    }
  }

  if (ruleset === 'riichi' && player.declaredReady && isConcealed) {
    if (player.doubleReady) push('doubleRiichi', 'Double Riichi');
    else push('riichi', 'Riichi');
    if (player.ippatsuEligible) {
      push('ippatsu', 'Ippatsu');
    }
  }

  // --- Limit hands checked first; they short-circuit everything else. -------
  if (isConcealed && shantenThirteenOrphans(counts) === -1) {
    if (ruleset === 'riichi') pushYakuman('thirteenOrphans', 'Thirteen Orphans');
    else push('thirteenOrphans', 'Thirteen Orphans');
    return finalise(patterns, ruleset, true);
  }

  const decompositions = ruleset === 'riichi' || ruleset === 'chinese-official'
    ? decomposeWins(counts, player.melds.length)
    : (() => {
        const one = decomposeWin(counts, player.melds.length);
        return one ? [one] : [];
      })();
  const sets = ruleset === 'riichi'
    ? selectBestRiichiDecomposition(decompositions, player.melds, winningTile, selfDrawn, isConcealed, player.seatWind, state.roundWind)
    : ruleset === 'chinese-official'
      ? selectBestMcrDecomposition(decompositions, player.melds, winningTile, selfDrawn)
    : decompositions[0] ?? null;
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
    if (ruleset === 'riichi') pushYakuman('allHonours', 'All Honours');
    else {
      push('allHonours', 'All Honours');
      return finalise(patterns, ruleset, true);
    }
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
        pushYakuman('allTerminals', 'All Terminals');
      } else {
        push('honroutou', 'All Terminals and Honours');
      }
    } else if (allTiles.every((tile) => tileSuit(tile) !== 'z')) {
      push('allTerminals', 'All Terminals');
      if (ruleset === 'hongkong') return finalise(patterns, ruleset, true);
    } else {
      push('allTerminalsHonours', 'All Terminals and Honours');
    }
  }
  if (ruleset === 'riichi' && allTiles.every(isGreenTile)) {
    pushYakuman('allGreen', 'All Green');
  }
  if (allTiles.every(isSimple)) {
    push('allSimples', 'All Simples');
  }
  if (ruleset === 'chinese-official') {
    if (suitsUsed.size === 2) push('oneVoidedSuit', 'One Voided Suit');
    if (honourCount === 0) push('noHonours', 'No Honors');
    const hasWind = allTiles.some((tile) => ['z1', 'z2', 'z3', 'z4'].includes(tile));
    const hasDragon = allTiles.some((tile) => ['z5', 'z6', 'z7'].includes(tile));
    if (suitsUsed.size === 3 && hasWind && hasDragon) push('allTypes', 'All Types');
    if (allTiles.every((tile) => tileSuit(tile) !== 'z' && tileRank(tile) >= 7)) push('upperTiles', 'Upper Tiles');
    else if (allTiles.every((tile) => tileSuit(tile) !== 'z' && tileRank(tile) >= 6)) push('upperFour', 'Upper Four');
    if (allTiles.every((tile) => tileSuit(tile) !== 'z' && tileRank(tile) >= 4 && tileRank(tile) <= 6)) push('middleTiles', 'Middle Tiles');
    if (allTiles.every((tile) => tileSuit(tile) !== 'z' && tileRank(tile) <= 3)) push('lowerTiles', 'Lower Tiles');
    else if (allTiles.every((tile) => tileSuit(tile) !== 'z' && tileRank(tile) <= 4)) push('lowerFour', 'Lower Four');
    if (allTiles.every(isReversibleTile)) push('reversibleTiles', 'Reversible Tiles');
    if (allTiles.every(isGreenTile)) push('allGreen', 'All Green');
    if (isConcealed && isNineGates(counts)) push('nineGates', 'Nine Gates');
    if (isConcealed && isSevenShiftedPairs(counts)) push('sevenShiftedPairs', 'Seven Shifted Pairs');
    // 四归一: all four copies of a kind used without ever forming a Kong.
    const kongTiles = new Set(player.melds.filter((meld) => meld.kind === 'kan').map((meld) => meld.tiles[0]));
    if (toCounts(allTiles).some((count, index) => count === 4 && !kongTiles.has(tileFromIndex(index)))) {
      push('tileHog', 'Tile Hog');
    }
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
    if (ruleset === 'riichi') pushYakuman('bigThreeDragons', 'Big Three Dragons');
    else {
      push('bigThreeDragons', 'Big Three Dragons');
      return finalise(patterns, ruleset, true);
    }
  }

  // Every ruleset scores the four-wind hands. MCR keeps accumulating fans
  // afterwards (its Account-Once table resolves the overlap with the lesser
  // wind fans), while Hong Kong settles immediately at its limit.
  const windCounts = (['z1', 'z2', 'z3', 'z4'] as Tile[]).map((tile) => allCounts[tileIndex(tile)]);
  if (windCounts.filter((count) => count >= 3).length === 4) {
    if (ruleset === 'riichi') pushYakuman('bigFourWinds', 'Big Four Winds');
    else if (ruleset === 'chinese-official') push('bigFourWinds', 'Big Four Winds');
    else {
      push('bigFourWinds', 'Big Four Winds');
      return finalise(patterns, ruleset, true);
    }
  }
  if (windCounts.filter((count) => count >= 3).length === 3 && windCounts.some((count) => count === 2)) {
    if (ruleset === 'riichi') pushYakuman('smallFourWinds', 'Little Four Winds');
    else if (ruleset === 'chinese-official') push('smallFourWinds', 'Little Four Winds');
    else {
      push('smallFourWinds', 'Little Four Winds');
      return finalise(patterns, ruleset, true);
    }
  }
  // 大三风 has no Riichi or Hong Kong equivalent; MCR's Account-Once table
  // removes it again whenever a four-wind fan is also present.
  if (ruleset === 'chinese-official' && windCounts.filter((count) => count >= 3).length === 3) {
    push('bigThreeWinds', 'Big Three Winds');
  }
  if (dragonSets === 2 && dragonPairs === 1) {
    push('littleThreeDragons', 'Little Three Dragons');
  } else {
    // MCR names the two-Dragon shape in its own right; its Account-Once entry
    // then removes the individual Dragon Pungs it covers.
    if (ruleset === 'chinese-official' && dragonSets === 2) {
      push('twoDragonPungs', 'Two Dragon Pungs');
    }
    for (let i = 0; i < dragonSets; i += 1) {
      push('dragonTriplet', 'Dragon Triplet');
    }
  }

  // --- Winds ---------------------------------------------------------------
  if (allCounts[tileIndex(player.seatWind)] >= 3) {
    push('seatWind', 'Seat Wind Triplet');
  }
  if (allCounts[tileIndex(state.roundWind)] >= 3) {
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
    const pair = sets.find((block) => block.kind === 'pair')?.tile;
    // WRC treats the ron-completed triplet as open for Sanankou/Suuankou and
    // fu. Hong Kong's product table preserves an otherwise concealed pung
    // hand on a discard win, so keep that treatment ruleset-specific.
    const concealedTriplets = tripletBlocks.filter((block) =>
      !block.open && (ruleset !== 'riichi' || selfDrawn || block.tile !== winningTile)
    ).length;

    if (tripletBlocks.length === 4) {
      if (concealedTriplets === 4 && isConcealed && (ruleset !== 'riichi' || selfDrawn || pair === winningTile)) {
        if (ruleset === 'riichi') pushYakuman('fourConcealedTriplets', 'Four Concealed Triplets');
        else {
          push('fourConcealedTriplets', 'Four Concealed Triplets');
          return finalise(patterns, ruleset, true);
        }
      }
      if (ruleset !== 'chinese-official') push('allTriplets', 'All Triplets');
    }
    if (ruleset === 'riichi') {
      const valuePair = Boolean(pair && (isDragon(pair) || pair === player.seatWind || pair === state.roundWind));
      const twoSidedWait = hasTwoSidedWait(sets, winningTile);
      if (runBlocks.length === 4 && isConcealed && !valuePair && twoSidedWait) {
        push('pinfu', 'Pinfu');
      }
      const identicalRunPairs = countIdenticalRunPairs(runBlocks);
      if (isConcealed && identicalRunPairs >= 2) push('ryanpeikou', 'Two Identical Sequences');
      else if (isConcealed && identicalRunPairs >= 1) push('iipeikou', 'One Identical Sequence');
      if (hasIttsuu(runBlocks)) pushRiichiValue('ittsuu', 'Pure Straight', 2, 1);
      if (hasSanshokuDoujun(runBlocks)) pushRiichiValue('sanshokuDoujun', 'Mixed Triple Sequence', 2, 1);
      if (hasSanshokuDoukou(tripletBlocks)) push('sanshokuDoukou', 'Triple Triplets');
      if (hasJunchan(blocks)) pushRiichiValue('junchan', 'Pure Outside Hand', 3, 2);
      else if (hasChanta(blocks)) pushRiichiValue('chanta', 'Mixed Outside Hand', 2, 1);
      if (concealedTriplets >= 3) push('sanankou', 'Three Concealed Triplets');
      if (player.melds.filter((meld) => meld.kind === 'kan').length >= 4) {
        pushYakuman('fourKans', 'Four Kans');
      }
      if (player.melds.filter((meld) => meld.kind === 'kan').length >= 3) push('sankantsu', 'Three Kans');
    } else if (ruleset === 'chinese-official') {
      pushMcrStructuralPatterns(push, blocks, runBlocks, tripletBlocks, concealedTriplets);
    } else if (runBlocks.length === 4 && isConcealed) {
      push('allSequences', 'All Sequences');
    }

  }

  // --- Conditions of the win itself ----------------------------------------
  if (ruleset === 'hongkong' && state.wallIndex === state.deadWallIndex && !player.lastDrawWasReplacement) {
    push('lastTileWin', selfDrawn ? 'Last Tile Draw' : 'Last Tile Claim');
  }
  if (ruleset === 'chinese-official' && isConcealed) {
    // MCR separates Concealed Hand (ron, 2) from Fully Concealed Hand
    // (self-draw, 4). The latter includes the self-draw condition, so it
    // replaces — rather than stacks with — the two lower entries.
    if (selfDrawn) push('fullyConcealed', 'Fully Concealed Hand');
    else push('concealed', 'Concealed Hand');
  } else {
    if (selfDrawn && (ruleset !== 'riichi' || isConcealed)) push('selfDraw', 'Self Draw');
    if (isConcealed && ruleset !== 'riichi') push('concealed', 'Fully Concealed');
  }
  if (ruleset === 'hongkong' && selfDrawn && player.lastDrawWasReplacement) {
    push('replacementWin', 'Win on Kong Replacement');
  }
  if (ruleset === 'riichi' && selfDrawn && player.lastDrawWasReplacement) {
    push('rinshanKaihou', 'Rinshan Kaihou');
  }
  if (ruleset === 'riichi' && state.deadWallIndex === state.wallIndex && !player.lastDrawWasReplacement) {
    if (selfDrawn) push('haiteiRaoyue', 'Haitei Raoyue');
    else push('houteiRaoyui', 'Houtei Raoyui');
  }
  if (state.winContext === 'rob-kong') {
    push('robbingKong', 'Robbing the Kong');
  }

  if (ruleset === 'chinese-official') {
    const wallExhausted = state.wallIndex === state.deadWallIndex;
    if (selfDrawn && player.lastDrawWasReplacement) push('outWithReplacement', 'Out With Replacement Tile');
    else if (wallExhausted && selfDrawn) push('lastTileDraw', 'Last Tile Draw');
    else if (wallExhausted && !selfDrawn) push('lastTileClaim', 'Last Tile Claim');

    // 和绝张: the winning tile's other three copies are already on the table.
    if (isLastCopy(state, seat, winningTile, selfDrawn)) push('lastTile', 'Last Tile');

    // MCR counts Kongs by concealment, unlike Riichi's sankantsu ladder.
    const kongs = player.melds.filter((meld) => meld.kind === 'kan');
    const concealedKongs = kongs.filter((meld) => meld.concealed).length;
    const meldedKongs = kongs.length - concealedKongs;
    if (kongs.length >= 4) push('fourKongs', 'Four Kongs');
    else if (kongs.length === 3) push('threeKongs', 'Three Kongs');
    else {
      if (concealedKongs >= 2) push('twoConcealedKongs', 'Two Concealed Kongs');
      else if (concealedKongs === 1) push('concealedKong', 'Concealed Kong');
      if (meldedKongs >= 2) push('twoMeldedKongs', 'Two Melded Kongs');
      else if (meldedKongs === 1) push('meldedKong', 'Melded Kong');
    }

    if (sets) {
      // 全求人: every set was claimed from a discard and the pair is completed
      // by the winning discard.
      const pairTile = sets.find((block) => block.kind === 'pair')?.tile;
      if (!selfDrawn && player.melds.length === 4 &&
        player.melds.every((meld) => !meld.concealed) && pairTile === winningTile) {
        push('meldedHand', 'Melded Hand');
      }
      const wait = mcrWaitFan(sets, winningTile);
      if (wait) push(wait.id, wait.label);
    }
  }

  // Beginner-friendly product mode: a structurally complete zero-Fan hand
  // becomes a one-Fan chicken hand, so it settles for a non-zero score.
  if (ruleset === 'hongkong' && isHongKongCasualChickenHand(state.hongKongMode, patterns)) {
    push('chickenHand', 'Chicken Hand (Casual)');
  }

  if (ruleset === 'riichi') {
    if (isConcealed && isNineGates(counts)) {
      pushYakuman('nineGates', 'Nine Gates');
    }
    if (isConcealed && selfDrawn && seat === state.dealer && noDiscardHasOccurred(state) && !state.callsMade) {
      pushYakuman('heavenlyHand', 'Heavenly Hand');
    }
    if (isConcealed && selfDrawn && seat !== state.dealer && player.discards.length === 0 && !state.callsMade) {
      pushYakuman('earthlyHand', 'Earthly Hand');
    }
    if (isConcealed && !selfDrawn && seat !== state.dealer && player.discards.length === 0 && !state.callsMade && state.winContext !== 'rob-kong') {
      // WRC Renhou is a non-cumulative 5 Han yakuman-like event: it replaces
      // all ordinary yaku and dora, but still uses the hand's normal fu.
      patterns.splice(0, patterns.length);
      push('renhou', 'Renhou');
    }
    const visible = countDora(allTiles, visibleDoraIndicators(state));
    if (!patterns.some((pattern) => pattern.id === 'renhou') && visible > 0) patterns.push({ id: 'dora', label: 'Dora', value: visible });
    // Red fives are counted from the tiles themselves, not from an indicator,
    // so they are added once rather than again under the ura indicators.
    const red = allTiles.filter(isRedFive).length;
    if (!patterns.some((pattern) => pattern.id === 'renhou') && red > 0) {
      patterns.push({ id: 'akaDora', label: 'Red Five', value: red });
    }
    if (!patterns.some((pattern) => pattern.id === 'renhou') && player.declaredReady) {
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
      else if (pair === player.seatWind || pair === state.roundWind) fu += 2;
      for (const block of sets ?? []) {
        if (block.kind !== 'triplet') continue;
        const ronCompletedTriplet = !selfDrawn && block.tile === winningTile;
        if (ronCompletedTriplet) fu += isSimple(block.tile) ? 2 : 4;
        else fu += isSimple(block.tile) ? 4 : 8;
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
    const yakumanCount = patterns.filter((pattern) => pattern.yakuman).length;
    const payment = calculateRiichiPayment({
      han,
      fu,
      winner: seat,
      dealer: state.dealer,
      selfDrawn,
      yakumanCount
    });
    return finalise(patterns, ruleset, yakumanCount > 0, fu, payment.winnerGain, payment.label);
  }
  return finalise(patterns, ruleset, false);
}

function finalise(
  patterns: ScorePattern[],
  ruleset: Ruleset,
  forcedLimit: boolean,
  fu?: number,
  points?: number,
  paymentLabel?: string
): ScoreResult {
  const effectivePatterns = ruleset === 'chinese-official'
    ? withMcrChickenHand(applyMcrDirectExclusions(patterns))
    : patterns;
  const raw = effectivePatterns.reduce((sum, p) => sum + p.value, 0);
  const qualifyingRaw = ruleset === 'chinese-official'
    ? effectivePatterns.filter((pattern) => pattern.id !== 'flower').reduce((sum, pattern) => sum + pattern.value, 0)
    : raw;
  const yakumanCount = effectivePatterns.filter((pattern) => pattern.yakuman).length;
  const cap = LIMIT[ruleset];
  // MCR has 88-point individual fans, not an 88-point total cap. A legal
  // hand may combine compatible fans above 88, so preserve the full total.
  const total = ruleset === 'riichi' && yakumanCount > 0
    ? 13 * yakumanCount
    : ruleset === 'chinese-official'
      ? raw
      : Math.min(raw, cap);
  return {
    total,
    qualifyingTotal: ruleset === 'chinese-official' ? qualifyingRaw : undefined,
    patterns: effectivePatterns,
    limit: forcedLimit || raw >= cap || yakumanCount > 0,
    legalYaku: ruleset !== 'riichi' || forcedLimit || yakumanCount > 0 || patterns.some(
      (pattern) => pattern.id !== 'dora' && pattern.id !== 'uraDora' && pattern.id !== 'akaDora'
    ),
    han: ruleset === 'riichi' ? (yakumanCount > 0 ? 13 : raw) : undefined,
    fu,
    points,
    paymentLabel,
    yakumanCount: yakumanCount || undefined
  };
}

export function describeScore(result: ScoreResult): string {
  if (result.patterns.length === 0) return 'No scoring patterns';
  return result.patterns.map((p) => `${p.label} (+${p.value})`).join(' · ');
}
