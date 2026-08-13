import { describe, expect, it } from 'vitest';

import { calculateHongKongPayment, HONG_KONG_FAN_CAP } from '@/lib/mahjong/hongkong';
import { createGame } from '@/lib/mahjong/engine';
import { scoreHand } from '@/lib/mahjong/scoring';

describe('Hong Kong product v1 settlement', () => {
  it('caps displayed Fan at ten and makes all three opponents pay a self draw', () => {
    const payment = calculateHongKongPayment({ fan: 12, selfDrawn: true, winner: 0 });
    expect(HONG_KONG_FAN_CAP).toBe(10);
    expect(payment.base).toBe(1024);
    expect(payment.payments).toEqual({ 1: 2048, 2: 2048, 3: 2048 });
    expect(payment.winnerGain).toBe(6144);
  });

  it('charges only the discarder on a discard win', () => {
    const payment = calculateHongKongPayment({ fan: 3, selfDrawn: false, winner: 0, loser: 2 });
    expect(payment.payments).toEqual({ 2: 32 });
    expect(payment.winnerGain).toBe(32);
    expect(payment.label).toContain('discarder');
  });

  it('makes the recorded 包牌 seat pay the full settlement for its liable winner', () => {
    const payment = calculateHongKongPayment({
      fan: 3,
      selfDrawn: true,
      winner: 0,
      liabilitySeat: 2
    });
    expect(payment.payments).toEqual({ 2: 48 });
    expect(payment.winnerGain).toBe(48);
    expect(payment.label).toContain('包牌');
  });

  it('does not mistake Mixed Terminals and Honors for a limit hand', () => {
    const state = createGame({ ruleset: 'hongkong', seed: 20260813 });
    state.players[0].hand = [
      'm1', 'm1', 'm1', 'p9', 'p9', 'p9', 's1', 's1', 's1',
      'z1', 'z1', 'z1', 'z2', 'z2'
    ];
    const score = scoreHand({ state, seat: 0, winningTile: 'z2', selfDrawn: false });
    expect(score.patterns.map((pattern) => pattern.id)).toContain('allTerminalsHonours');
    expect(score.total).toBe(4); // 混幺九 1 + 门清 1 + seat/round wind 2; not a cap hand.
  });
});
