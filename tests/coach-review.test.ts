import { describe, expect, it } from 'vitest';
import { createGame } from '@/lib/mahjong/engine';
import { scoreHand } from '@/lib/mahjong/scoring';
import { buildCoachReview } from '@/lib/mahjong/coach';
import type { Tile } from '@/lib/mahjong/tiles';

describe('buildCoachReview', () => {
  it('builds a full Hong Kong win review with A–D layers', () => {
    const state = createGame({ ruleset: 'hongkong', seed: 7, hongKongMode: 'casual' });
    state.players[0].hand = [
      'm2', 'm3', 'm4', 'p2', 'p3', 'p4', 's2', 's3', 's4',
      'm6', 'm7', 'm8', 'z5', 'z5'
    ] as Tile[];
    const score = scoreHand({ state, seat: 0, winningTile: 'z5', selfDrawn: true });
    state.phase = 'over';
    state.result = { kind: 'win', winner: 0, score };

    const review = buildCoachReview(state, 0, { discloseReveal: true });
    expect(review.capability).toBe('full');
    expect(review.outcome).toBe('iWon');
    expect(review.discloseReveal).toBe(true);
    expect(review.shape?.kind).toBe('standard');
    expect(review.gate?.passed).toBe(true);
    expect(review.fans?.length).toBeGreaterThan(0);
    expect(review.formula?.items.some((item) => item.labelKey === 'base')).toBe(true);
    expect(review.formula?.total).toBeGreaterThan(0);
  });

  it('covers draw with missInfo', () => {
    const state = createGame({ ruleset: 'hongkong', seed: 3 });
    state.phase = 'over';
    state.result = { kind: 'draw', reason: 'exhaustive' };
    const review = buildCoachReview(state, 0);
    expect(review.outcome).toBe('draw');
    expect(review.missInfo).toBeTruthy();
    expect(typeof review.missInfo?.shanten).toBe('number');
  });

  it('covers opponent win with dealt-in note when human is loser', () => {
    const state = createGame({ ruleset: 'hongkong', seed: 9, hongKongMode: 'casual' });
    state.phase = 'over';
    state.result = {
      kind: 'win',
      winner: 1,
      loser: 0,
      score: {
        total: 3,
        patterns: [{ id: 'allSimples', label: 'All Simples', value: 1 }],
        limit: false,
        handShape: 'standard',
        gate: { kind: 'minFan', required: 1, actual: 3, passed: true }
      }
    };
    const review = buildCoachReview(state, 0);
    expect(review.outcome).toBe('opponentWon');
    expect(review.missInfo?.note).toBe('dealt_in');
  });
});
