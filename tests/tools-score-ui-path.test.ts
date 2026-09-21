import { describe, expect, it } from 'vitest';
import { scoreHongKongToolsHand } from '@/lib/tools/score-path';
import type { Tile } from '@/lib/mahjong/tiles';

const hand = (spec: string): Tile[] => spec.split(' ') as Tile[];

describe('scoreHongKongToolsHand', () => {
  it('scores a known big-three-dragons hand', () => {
    const outcome = scoreHongKongToolsHand({
      hand14: hand('z5 z5 z5 z6 z6 z6 z7 z7 z7 m2 m3 m4 p9 p9'),
      winningTile: 'p9',
      selfDrawn: false
    });
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.score.patterns.map((p) => p.id)).toContain('bigThreeDragons');
      expect(outcome.score.total).toBeGreaterThanOrEqual(8);
    }
  });

  it('rejects a non-winning hand without inventing a total', () => {
    const outcome = scoreHongKongToolsHand({
      hand14: hand('m1 m2 m3 m4 m5 m6 m7 m8 m9 p1 p2 p3 p4 p5'),
      winningTile: 'p5',
      selfDrawn: true
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.reason).toBe('notWinning');
  });
});
