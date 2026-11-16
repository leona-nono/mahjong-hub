import { describe, expect, it } from 'vitest';
import { boardScale } from '@/hooks/use-board-scale';

describe('boardScale', () => {
  it('stays width-only when height is omitted', () => {
    expect(boardScale(490, 0, 980)).toBe(0.5);
    expect(boardScale(2000, 100, 980)).toBe(1);
  });

  it('uses the tighter of width and height, and never scales up', () => {
    expect(boardScale(980, 412, 980, 824)).toBeCloseTo(0.5);
    expect(boardScale(490, 824, 980, 824)).toBeCloseTo(0.5);
    expect(boardScale(2000, 2000, 980, 824)).toBe(1);
  });

  it('ignores a zero height instead of collapsing the board', () => {
    expect(boardScale(490, 0, 980, 824)).toBeCloseTo(0.5);
  });
});
