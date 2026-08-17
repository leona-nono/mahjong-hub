import { describe, expect, it } from 'vitest';

import {
  calculateRiichiPayment,
  countDora,
  nextDora,
  riichiBasePoints,
  roundFu,
  visibleDoraIndicators
} from '@/lib/mahjong/riichi';
import { scoreHand } from '@/lib/mahjong/scoring';
import {
  availableConcealedKans,
  availableAddedKans,
  calculateRiichiMatchResult,
  canDeclareNineTerminals,
  createGame,
  declareNineTerminals,
  isAbortiveDraw,
  declareAddedKan,
  declareConcealedKan,
  declareRiichi,
  discard,
  drawTile,
  isPermanentFuriten,
  startNextHand,
  submitClaim,
  type Seat
} from '@/lib/mahjong/engine';
import { chooseMove } from '@/lib/mahjong/ai';
import type { Tile } from '@/lib/mahjong/tiles';

const hand = (value: string): Tile[] => value.split(' ') as Tile[];

describe('WRC Riichi helpers', () => {
  it('wraps suit, wind and dragon dora indicators', () => {
    expect(nextDora('m9')).toBe('m1');
    expect(nextDora('z4')).toBe('z1');
    expect(nextDora('z7')).toBe('z5');
  });

  it('counts every matching dora copy', () => {
    expect(countDora(hand('m1 m1 p4 z5'), ['m9', 'p3', 'z7'])).toBe(4);
  });

  it('applies mangan and limit thresholds', () => {
    expect(riichiBasePoints(3, 70)).toBe(2000);
    expect(riichiBasePoints(5, 30)).toBe(2000);
    expect(riichiBasePoints(8, 30)).toBe(4000);
    expect(riichiBasePoints(13, 30)).toBe(8000);
  });

  it('rounds fu and preserves seven-pairs 25 fu', () => {
    expect(roundFu(22)).toBe(30);
    expect(roundFu(32)).toBe(40);
    expect(roundFu(25)).toBe(25);
  });

  it('settles non-dealer ron and tsumo by dealer status', () => {
    const ron = calculateRiichiPayment({
      han: 3,
      fu: 40,
      winner: 1,
      dealer: 0,
      selfDrawn: false
    });
    expect(ron.winnerGain).toBe(5200);

    const tsumo = calculateRiichiPayment({
      han: 3,
      fu: 40,
      winner: 1,
      dealer: 0,
      selfDrawn: true
    });
    expect(tsumo.payments[0]).toBe(2600);
    expect(tsumo.payments[2]).toBe(1300);
    expect(tsumo.winnerGain).toBe(5200);
  });

  it('adds honba to ron and each tsumo payment', () => {
    expect(calculateRiichiPayment({
      han: 1, fu: 30, winner: 1, dealer: 0, selfDrawn: false, honba: 2
    }).winnerGain).toBe(1600);

    const tsumo = calculateRiichiPayment({
      han: 1, fu: 30, winner: 0, dealer: 0, selfDrawn: true, honba: 2
    });
    expect(tsumo.payments[1]).toBe(700);
  });
});

describe('WRC furiten', () => {
  it('locks a declared Riichi hand to its drawn tile', () => {
    const state = createGame({ ruleset: 'riichi', seed: 6 });
    state.turn = 0;
    state.phase = 'discard';
    state.players[0].declaredReady = true;
    state.players[0].hand = hand('m1 m2 m3 m4 m5 m6 p2 p3 p4 s6 s7 s8 z1 m9');
    state.players[0].lastDrawn = 'm9';

    expect(discard(state, 'm1')).toBe(state);
    expect(discard(state, 'm9').players[0].discards).toContain('m9');
  });

  it('blocks ron when one of the current waits is in the player discard river', () => {
    const state = createGame({ ruleset: 'riichi', seed: 1 });
    state.players[0].hand = hand('m1 m2 m3 m4 m5 m6 p2 p3 p4 s6 s7 s8 z1');
    state.players[0].discards = ['z1'];
    expect(isPermanentFuriten(state, 0)).toBe(true);
  });

  it('marks temporary furiten after passing a legal ron', () => {
    let state = createGame({ ruleset: 'riichi', seed: 1 });
    state.players[0].hand = hand('m1 m2 m3 m4 m5 m6 m7 m8 m9 z5 z5 z5 z1');
    state.players[0].declaredReady = true;
    state.players[1].hand = hand('z1 m5 m6 m7 m8 m9 p3 p4 p5 s4 s5 s6 z2');
    state.turn = 1 as Seat;
    state.phase = 'discard';
    state = discard(state, 'z1', 1000);
    expect(state.claims[0]?.some((claim) => claim.kind === 'ron')).toBe(true);
    state = submitClaim(state, 0, { kind: 'pass', tiles: [] });
    expect(state.players[0].temporaryFuriten).toBe(true);
  });
});

describe('WRC Riichi turn locks', () => {
  it('records Double Riichi only before any call and on the first discard', () => {
    let state = createGame({ ruleset: 'riichi', seed: 13 });
    state.turn = 0;
    state.phase = 'discard';
    state.players[0].hand = hand('m1 m2 m3 m4 m5 m6 p2 p3 p4 s6 s7 s8 z1 m9');
    state = declareRiichi(state, 0);
    state = discard(state, 'm9');

    expect(state.players[0].declaredReady).toBe(true);
    expect(state.players[0].doubleReady).toBe(true);
  });

  it('uses ordinary Riichi after a call has occurred', () => {
    let state = createGame({ ruleset: 'riichi', seed: 131 });
    state.turn = 0;
    state.phase = 'discard';
    state.callsMade = true;
    state.players[0].hand = hand('m1 m2 m3 m4 m5 m6 p2 p3 p4 s6 s7 s8 z1 m9');
    state = declareRiichi(state, 0);
    state = discard(state, 'm9');

    expect(state.players[0].doubleReady).toBe(false);
  });

  it('makes a Riichi bot tsumogiri the drawn tile', () => {
    const state = createGame({ ruleset: 'riichi', seed: 14 });
    state.turn = 1 as Seat;
    state.phase = 'discard';
    state.players[1].declaredReady = true;
    state.players[1].lastDrawn = 'p9';
    state.players[1].hand = hand('m1 m2 m3 m4 m5 m6 p2 p3 p4 s6 s7 s8 z1 p9');

    expect(chooseMove(state, 1)).toEqual({ type: 'discard', tile: 'p9' });
  });

  it('cancels ippatsu after a concealed kan', () => {
    const state = createGame({ ruleset: 'riichi', seed: 15 });
    state.turn = 0;
    state.phase = 'discard';
    state.players[0].hand = hand('m1 m1 m1 m1 m2 m3 m4 p2 p3 p4 s6 s7 s8 z1');
    state.players[1].ippatsuEligible = true;

    const afterKan = declareConcealedKan(state, 0, 'm1');
    expect(afterKan.players[1].ippatsuEligible).toBe(false);
  });

  it('continues after four identical first-wind discards under strict WRC', () => {
    const state = createGame({ ruleset: 'riichi', seed: 16 });
    state.turn = 3 as Seat;
    state.phase = 'discard';
    for (const player of state.players) player.hand = hand('m1 m2 m3 m4 m5 m6 p1 p2 p3 s1 s2 s3 z2');
    state.players[0].discards = ['z1'];
    state.players[1].discards = ['z1'];
    state.players[2].discards = ['z1'];
    state.players[3].hand = hand('z1');

    const result = discard(state, 'z1');
    expect(result.phase).toBe('draw');
    expect(result.result).toBeNull();
  });

  it('continues after four Riichi declarations under strict WRC', () => {
    const state = createGame({ ruleset: 'riichi', seed: 17 });
    state.turn = 3 as Seat;
    state.phase = 'discard';
    for (const player of state.players) {
      player.hand = hand('m1 m2 m3 m4 m5 m6 p1 p2 p3 s1 s2 s3 z2');
      player.declaredReady = true;
    }
    state.players[3].hand = hand('z1');
    state.players[3].lastDrawn = 'z1';

    const result = discard(state, 'z1');
    expect(result.phase).toBe('draw');
    expect(result.result).toBeNull();
  });
});

describe('WRC kan flow', () => {
  it('allows a Riichi concealed kan only when its waits remain unchanged', () => {
    const state = createGame({ ruleset: 'riichi', seed: 18 });
    state.turn = 0;
    state.phase = 'discard';
    state.players[0].declaredReady = true;
    state.players[0].lastDrawn = 'm1';
    state.players[0].hand = hand('m1 m1 m1 m1 m2 m3 m4 p2 p3 p4 s6 s7 s8 z1');

    expect(availableConcealedKans(state, 0)).toEqual(['m1']);
    const result = declareConcealedKan(state, 0, 'm1');
    expect(result.players[0].melds).toMatchObject([{ kind: 'kan', tiles: ['m1', 'm1', 'm1', 'm1'] }]);
  });

  it('opens a chankan window for a Riichi added kan and counts it as yaku', () => {
    const state = createGame({ ruleset: 'riichi', seed: 19 });
    state.turn = 0;
    state.phase = 'discard';
    state.players[0].melds = [{ kind: 'pon', tiles: hand('m1 m1 m1'), from: 2 }];
    state.players[0].hand = hand('m1 m2 m2 m3 m3 m4 m4 p1 p2 p3 s1');
    state.players[1].hand = hand('m2 m3 m4 p2 p3 p4 s2 s3 s4 z1 z1 z1 m1');

    expect(availableAddedKans(state, 0)).toContain('m1');
    const opened = declareAddedKan(state, 0, 'm1', 1000);
    expect(opened.phase).toBe('added-kan-claim');
    const ron = opened.claims[1]?.find((claim) => claim.kind === 'ron');
    expect(ron).toBeDefined();
    const result = submitClaim(opened, 1, ron!);
    expect(result.result?.winner).toBe(1);
    expect(result.result?.score?.patterns.map((pattern) => pattern.id)).toContain('robbingKong');
  });

  it('counts a self-drawn replacement win as Rinshan Kaihou', () => {
    const state = createGame({ ruleset: 'riichi', seed: 20 });
    state.players[0].melds = [{ kind: 'kan', tiles: hand('m1 m1 m1 m1'), concealed: true }];
    state.players[0].hand = hand('m2 m3 m4 p2 p3 p4 s2 s3 s4 z1 z1');
    state.players[0].lastDrawWasReplacement = true;

    const score = scoreHand({ state, seat: 0, winningTile: 'z1', selfDrawn: true });
    expect(score.patterns.map((pattern) => pattern.id)).toContain('rinshanKaihou');
  });

  it('reveals one additional Dora indicator after each completed kan', () => {
    const state = createGame({ ruleset: 'riichi', seed: 21 });
    state.players[0].melds = [{ kind: 'kan', tiles: hand('m1 m1 m1 m1'), concealed: true }];

    expect(visibleDoraIndicators(state)).toHaveLength(2);
  });

  it('continues after a fourth kan and prevents a fifth kan under strict WRC', () => {
    const state = createGame({ ruleset: 'riichi', seed: 23 });
    state.turn = 0;
    state.phase = 'discard';
    state.players[0].hand = hand('m1 m1 m1 m1 m2 m3 m4 p2 p3 p4 s6 s7 s8 z1');
    state.players[1].melds = [{ kind: 'kan', tiles: hand('p1 p1 p1 p1'), concealed: true }];
    state.players[2].melds = [{ kind: 'kan', tiles: hand('s1 s1 s1 s1'), concealed: true }];
    state.players[3].melds = [{ kind: 'kan', tiles: hand('z1 z1 z1 z1'), concealed: true }];

    const result = declareConcealedKan(state, 0, 'm1');
    expect(result.phase).toBe('discard');
    expect(result.result).toBeNull();
    expect(availableConcealedKans(result, 0)).toEqual([]);
  });

  it('allows one player to declare all four kans', () => {
    const state = createGame({ ruleset: 'riichi', seed: 24 });
    state.turn = 0;
    state.phase = 'discard';
    state.players[0].hand = hand('m1 m1 m1 m1 m2 m3 m4 p2 p3 p4 s6 s7 s8 z1');
    state.players[0].melds = [
      { kind: 'kan', tiles: hand('p1 p1 p1 p1'), concealed: true },
      { kind: 'kan', tiles: hand('s1 s1 s1 s1'), concealed: true },
      { kind: 'kan', tiles: hand('z1 z1 z1 z1'), concealed: true }
    ];

    const result = declareConcealedKan(state, 0, 'm1');
    expect(result.phase).toBe('discard');
    expect(result.result).toBeNull();
    expect(result.players[0].melds.filter((meld) => meld.kind === 'kan')).toHaveLength(4);
  });
});

describe('WRC 2025 responsibility payment (pao)', () => {
  it('makes the liable player pay a single yakuman in full on self draw', () => {
    const payment = calculateRiichiPayment({
      han: 13,
      fu: 40,
      winner: 0,
      dealer: 0,
      selfDrawn: true,
      liability: { seat: 2, yakumanCount: 1 }
    });
    expect(payment.payments).toEqual({ 2: 48000 });
    expect(payment.winnerGain).toBe(48000);
  });

  it('splits the liable yakuman with the discarder on ron', () => {
    const payment = calculateRiichiPayment({
      han: 13,
      fu: 40,
      winner: 0,
      dealer: 0,
      selfDrawn: false,
      loser: 1,
      liability: { seat: 2, yakumanCount: 1 }
    });
    expect(payment.payments).toEqual({ 2: 24000, 1: 24000 });
    expect(payment.winnerGain).toBe(48000);
  });
});

describe('WRC match lifecycle', () => {
  it('ends the match after South 4 when the dealer changes', () => {
    const state = createGame({ ruleset: 'riichi', seed: 26 });
    state.phase = 'over';
    state.handNumber = 7;
    state.dealer = 0;
    state.result = { kind: 'win', winner: 1 };

    const result = startNextHand(state);
    expect(result.matchEnded).toBe(true);
    expect(result.handNumber).toBe(7);
  });

  it('keeps South 4 when its dealer continues', () => {
    const state = createGame({ ruleset: 'riichi', seed: 27 });
    state.phase = 'over';
    state.handNumber = 7;
    state.dealer = 0;
    state.result = { kind: 'win', winner: 0 };

    const result = startNextHand(state);
    expect(result.matchEnded).toBe(false);
    expect(result.handNumber).toBe(7);
    expect(result.roundWind).toBe('z2');
  });

  it('settles WRC noten payment and keeps East when East is tenpai', () => {
    const state = createGame({ ruleset: 'riichi', seed: 271 });
    state.phase = 'draw';
    state.wallIndex = state.deadWallIndex;
    state.players[0].hand = hand('m1 m2 m3 m4 m5 m6 p2 p3 p4 s6 s7 s8 z1');
    state.players[1].hand = hand('m1 m1 m2 m3 m4 p1 p2 p3 s1 s2 s3 z2 z3');
    state.players[2].hand = hand('m1 m1 m2 m3 m4 p1 p2 p3 s1 s2 s3 z2 z3');
    state.players[3].hand = hand('m1 m1 m2 m3 m4 p1 p2 p3 s1 s2 s3 z2 z3');

    const drawn = drawTile(state);
    expect(drawn.result).toMatchObject({ kind: 'draw', reason: 'exhaustive', tenpaiSeats: [0] });
    expect(drawn.players[0].score).toBe(33000);
    expect(drawn.players[1].score).toBe(29000);
    expect(startNextHand(drawn).dealer).toBe(0);
  });

  it('calculates WRC uma and splits it when players tie', () => {
    const state = createGame({ ruleset: 'riichi', seed: 28 });
    state.players[0].score = 36000;
    state.players[1].score = 36000;
    state.players[2].score = 28000;
    state.players[3].score = 20000;
    state.riichiSticks = 2;

    const result = calculateRiichiMatchResult(state);
    expect(result.rankings.find((entry) => entry.seat === 0)).toMatchObject({ rank: 1, uma: 10, hanchanScore: 16 });
    expect(result.rankings.find((entry) => entry.seat === 1)).toMatchObject({ rank: 1, uma: 10, hanchanScore: 16 });
    expect(result.remainingRiichiSticks).toBe(2);
  });
});

describe('Riichi yaku and fu', () => {
  it('uses lower values for open ittsuu, sanshoku, chanta and junchan', () => {
    const state = createGame({ ruleset: 'riichi', seed: 211 });
    state.players[0].melds = [{ kind: 'chi', tiles: hand('m1 m2 m3'), from: 3 }];
    state.players[0].hand = hand('m4 m5 m6 m7 m8 m9 p1 p2 p3 z1 z1');
    const score = scoreHand({ state, seat: 0, winningTile: 'p3', selfDrawn: true });

    expect(score.patterns.find((pattern) => pattern.id === 'ittsuu')?.value).toBe(1);
  });

  it('adds Haitei on the final live-wall self draw', () => {
    const state = createGame({ ruleset: 'riichi', seed: 212 });
    state.wallIndex = state.deadWallIndex;
    state.players[0].hand = hand('m2 m3 m4 m3 m4 m5 p3 p4 p5 s5 s6 s7 p6 p6');
    const score = scoreHand({ state, seat: 0, winningTile: 's7', selfDrawn: true });

    expect(score.patterns.map((pattern) => pattern.id)).toContain('haiteiRaoyue');
  });
  it('scores closed pinfu tsumo at 20 fu', () => {
    const state = createGame({ ruleset: 'riichi', seed: 21 });
    state.players[0].hand = hand('m2 m3 m4 m3 m4 m5 p3 p4 p5 s5 s6 s7 p6 p6');
    const score = scoreHand({ state, seat: 0, winningTile: 's7', selfDrawn: true });

    expect(score.patterns.map((pattern) => pattern.id)).toContain('pinfu');
    expect(score.fu).toBe(20);
  });

  it('recognises a pure straight and its closed value', () => {
    const state = createGame({ ruleset: 'riichi', seed: 22 });
    state.players[0].hand = hand('m1 m2 m3 m4 m5 m6 m7 m8 m9 p1 p2 p3 z1 z1');
    const score = scoreHand({ state, seat: 0, winningTile: 'p3', selfDrawn: true });

    expect(score.patterns.map((pattern) => pattern.id)).toContain('ittsuu');
    expect(score.patterns.find((pattern) => pattern.id === 'ittsuu')?.value).toBe(2);
  });

  it('gives a double-wind pair only two fu, not four', () => {
    const state = createGame({ ruleset: 'riichi', seed: 29 });
    state.roundWind = 'z1';
    state.players[0].seatWind = 'z1';
    state.players[0].hand = hand('m1 m2 m3 m4 m5 m6 p1 p2 p3 s1 s2 s3 z1 z1');
    const score = scoreHand({ state, seat: 0, winningTile: 's3', selfDrawn: false });

    expect(score.fu).toBe(30);
  });

  it('treats a ron-completed concealed triplet as open for fu', () => {
    const state = createGame({ ruleset: 'riichi', seed: 30 });
    state.players[0].hand = hand('m1 m1 m2 m3 m4 p2 p3 p4 s2 s3 s4 z1 z1');
    const score = scoreHand({ state, seat: 0, winningTile: 'm1', selfDrawn: false });

    expect(score.fu).toBe(40);
  });

  it('requires an honour for Chanta', () => {
    const state = createGame({ ruleset: 'riichi', seed: 31 });
    state.players[0].hand = hand('m1 m2 m3 m7 m8 m9 p1 p2 p3 s7 s8 s9 m1 m1');
    const score = scoreHand({ state, seat: 0, winningTile: 'm1', selfDrawn: true });

    expect(score.patterns.map((pattern) => pattern.id)).not.toContain('chanta');
    expect(score.patterns.map((pattern) => pattern.id)).toContain('junchan');
  });

  it('scores genuine yakuman cumulatively in WRC', () => {
    const state = createGame({ ruleset: 'riichi', seed: 32 });
    state.players[1].discards = ['p1'];
    state.players[0].hand = hand('z1 z1 z1 z2 z2 z2 z3 z3 z3 z4 z4 z4 z5 z5');
    const score = scoreHand({ state, seat: 0, winningTile: 'z5', selfDrawn: true });

    expect(score.yakumanCount).toBe(3);
    // Non-dealer triple yakuman tsumo: each opponent pays 48,000.
    expect(score.points).toBe(144000);
  });

  it('recognises WRC Nine Gates', () => {
    const state = createGame({ ruleset: 'riichi', seed: 33 });
    state.players[1].discards = ['p1'];
    state.players[0].hand = hand('m1 m1 m1 m2 m3 m4 m5 m5 m6 m7 m8 m9 m9 m9');
    const score = scoreHand({ state, seat: 0, winningTile: 'm5', selfDrawn: true });

    expect(score.patterns.map((pattern) => pattern.id)).toContain('nineGates');
    expect(score.yakumanCount).toBe(1);
  });
});


describe('WRC abortive draws', () => {
  const nineTerminalHand = hand('m1 m9 p1 p9 s1 s9 z1 z2 z3 z4 z5 z6 z7 m5');

  const openWithSameWind = (ruleset: 'riichi' | 'hongkong') => {
    const state = createGame({ ruleset, seed: 5, riichiVariant: 'standard' });
    // One East each so nobody can Pon it, and scattered tiles elsewhere so
    // nobody is waiting on it either.
    state.players[0].hand = hand('z1 m1 m2 m4 m7 p1 p2 p4 p7 s1 s2 s4 s7');
    state.players[1].hand = hand('z1 m3 m5 m6 m9 p3 p5 p6 p9 s3 s5 s6 s9');
    state.players[2].hand = hand('z1 m1 m4 m7 m8 p1 p4 p7 p8 s1 s4 s7 s8');
    state.players[3].hand = hand('z1 m2 m3 m6 m9 p2 p3 p6 p9 s2 s3 s6 s9');
    state.turn = 0;
    state.phase = 'discard';
    return state;
  };

  it('lets an untouched first turn abandon a nine-terminal hand', () => {
    let state = createGame({ ruleset: 'riichi', seed: 9, riichiVariant: 'standard' });
    state.players[0].hand = nineTerminalHand;
    state.phase = 'discard';
    state.turn = 0;
    expect(canDeclareNineTerminals(state, 0)).toBe(true);

    state = declareNineTerminals(state, 0);
    expect(state.phase).toBe('over');
    expect(state.result).toMatchObject({ kind: 'draw', reason: 'nine-terminals' });
    expect(isAbortiveDraw(state.result)).toBe(true);
    expect(state.honba).toBe(1);
    // Nobody pays on an abortive draw.
    expect(state.players.map((player) => player.score)).toEqual([30000, 30000, 30000, 30000]);
    expect(startNextHand(state).dealer).toBe(state.dealer);
  });

  it('closes the nine-terminal window after a call or a second go-around', () => {
    const called = createGame({ ruleset: 'riichi', seed: 9, riichiVariant: 'standard' });
    called.players[0].hand = nineTerminalHand;
    called.phase = 'discard';
    called.callsMade = true;
    expect(canDeclareNineTerminals(called, 0)).toBe(false);

    const secondTurn = createGame({ ruleset: 'riichi', seed: 9, riichiVariant: 'standard' });
    secondTurn.players[0].hand = nineTerminalHand;
    secondTurn.phase = 'discard';
    secondTurn.players[2].discards = hand('m4 p7');
    expect(canDeclareNineTerminals(secondTurn, 0)).toBe(false);
  });

  it('is a Riichi rule only: Hong Kong plays a nine-terminal hand out', () => {
    const hk = createGame({ ruleset: 'hongkong', seed: 9, riichiVariant: 'standard' });
    hk.players[0].hand = nineTerminalHand;
    hk.phase = 'discard';
    expect(canDeclareNineTerminals(hk, 0)).toBe(false);
  });

  it('abandons the hand on four identical opening wind discards', () => {
    let state = openWithSameWind('riichi');
    for (let turn = 0; turn < 4 && !state.result; turn += 1) {
      state = discard(state, 'z1');
      if (state.result) break;
      // Nobody may claim an East nobody holds a second copy of.
      expect(state.claims).toEqual({});
      state.phase = 'discard';
    }
    expect(state.result).toMatchObject({ kind: 'draw', reason: 'four-winds' });
    expect(state.honba).toBe(1);
  });

  it('leaves Hong Kong to play the same four wind discards out', () => {
    let state = openWithSameWind('hongkong');
    for (let turn = 0; turn < 4 && !state.result; turn += 1) {
      state = discard(state, 'z1');
      if (state.result) break;
      state.phase = 'discard';
    }
    expect(state.result).toBeNull();
  });

  it('abandons the hand once a fourth Kong is spread across seats', () => {
    const state = createGame({ ruleset: 'riichi', seed: 12, riichiVariant: 'standard' });
    state.players[0].melds = [
      { kind: 'kan', tiles: hand('m1 m1 m1 m1'), concealed: true },
      { kind: 'kan', tiles: hand('m9 m9 m9 m9'), concealed: true }
    ];
    state.players[1].melds = [
      { kind: 'kan', tiles: hand('p1 p1 p1 p1'), concealed: true },
      { kind: 'kan', tiles: hand('p9 p9 p9 p9'), concealed: true }
    ];
    state.players[0].hand = hand('s1 s2 s3 s4 s5');
    state.turn = 0;
    state.phase = 'discard';
    const next = discard(state, 's1');
    expect(next.result).toMatchObject({ kind: 'draw', reason: 'four-kans' });
  });

  it('lets a single seat keep chasing all four Kongs', () => {
    const state = createGame({ ruleset: 'riichi', seed: 12, riichiVariant: 'standard' });
    state.players[0].melds = [
      { kind: 'kan', tiles: hand('m1 m1 m1 m1'), concealed: true },
      { kind: 'kan', tiles: hand('m9 m9 m9 m9'), concealed: true },
      { kind: 'kan', tiles: hand('p1 p1 p1 p1'), concealed: true },
      { kind: 'kan', tiles: hand('p9 p9 p9 p9'), concealed: true }
    ];
    state.players[0].hand = hand('s1 s2');
    state.turn = 0;
    state.phase = 'discard';
    expect(discard(state, 's1').result).toBeNull();
  });
});
