import { describe, expect, it } from 'vitest';

import { calculateHongKongPayment, HONG_KONG_FAN_CAP } from '@/lib/mahjong/hongkong';

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
});
