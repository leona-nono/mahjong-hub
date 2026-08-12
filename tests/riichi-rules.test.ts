import { describe, expect, it } from 'vitest';

import {
  calculateRiichiPayment,
  countDora,
  nextDora,
  riichiBasePoints,
  roundFu
} from '@/lib/mahjong/riichi';
import { scoreHand } from '@/lib/mahjong/scoring';
import {
  createGame,
  discard,
  isPermanentFuriten,
  submitClaim,
  type Seat
} from '@/lib/mahjong/engine';
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

describe('Riichi yaku and fu', () => {
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
});
