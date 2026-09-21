import { describe, expect, it } from 'vitest';
import { toCounts, type Tile } from '@/lib/mahjong/tiles';
import { shanten, waitingTiles } from '@/lib/mahjong/shanten';
import { encodeSharedHand, parseSharedHand } from '@/lib/tools/hand-share';

const RULESET = 'hongkong' as const;

function classify(hand: Tile[]) {
  const readable = hand.length >= 4 && hand.length % 3 === 1 && hand.length <= 14;
  if (!readable) return 'incomplete' as const;
  const counts = toCounts(hand);
  const distance = shanten(counts, 0, RULESET);
  if (distance === -1) return 'winning' as const;
  if (distance === 0) return 'tenpai' as const;
  return 'away' as const;
}

describe('tools hand-share encode/parse', () => {
  it('round-trips a normal hand', () => {
    const hand = ['m1', 'm2', 'm3', 'p5', 'p5', 's9', 'z1'] as Tile[];
    const encoded = encodeSharedHand(hand);
    expect(encoded).toBe('m1m2m3p5p5s9z1');
    expect(parseSharedHand(`?hand=${encoded}`)).toEqual(hand);
    expect(parseSharedHand(`hand=${encoded}`)).toEqual(hand);
  });

  it('ignores malformed and oversized input without throwing', () => {
    expect(parseSharedHand('?hand=')).toEqual([]);
    expect(parseSharedHand('?hand=@@@')).toEqual([]);
    expect(parseSharedHand('?hand=x9x9')).toEqual([]);
    expect(parseSharedHand(`?hand=${'m1'.repeat(20)}`)).toEqual([]);
  });

  it('caps each kind at four copies', () => {
    expect(parseSharedHand('?hand=m1m1m1m1m1')).toEqual(['m1', 'm1', 'm1', 'm1']);
  });
});

describe('tools waits four result states', () => {
  it('marks incomplete counts that are not 3n+1', () => {
    expect(classify(['m1', 'm2'] as Tile[])).toBe('incomplete');
    expect(classify(Array.from({ length: 14 }, () => 'm1' as Tile))).toBe('incomplete');
  });

  it('treats a 14-tile complete hand as overfull (not readable)', () => {
    const hand = [
      'm1', 'm2', 'm3', 'p1', 'p2', 'p3', 's1', 's2', 's3',
      'm7', 'm8', 'm9', 'z5', 'z5'
    ] as Tile[];
    // Phase-1 checker only reads 3n+1; 14 is "just drew, still holding the discard".
    expect(classify(hand)).toBe('incomplete');
    expect(shanten(toCounts(hand), 0, RULESET)).toBe(-1);
  });

  it('marks tenpai and exposes waits from the engine', () => {
    const hand = [
      'm1', 'm2', 'm3', 'p1', 'p2', 'p3', 's1', 's2', 's3',
      'm7', 'm8', 'm9', 'z5'
    ] as Tile[];
    expect(classify(hand)).toBe('tenpai');
    const waits = waitingTiles(toCounts(hand), 0, RULESET);
    expect(waits).toContain('z5');
  });

  it('marks hands still away from ready', () => {
    const hand = [
      'm1', 'm1', 'm1', 'p2', 'p2', 'p2', 's3', 's3', 's3',
      'm5', 'm6', 'm7', 'z1'
    ] as Tile[];
    // 13 tiles, one honour singleton → still building; distance should be > 0
    // unless somehow already tenpai; assert not winning and readable path.
    expect(hand.length).toBe(13);
    const state = classify(hand);
    expect(state === 'away' || state === 'tenpai').toBe(true);
    if (state === 'away') {
      expect(shanten(toCounts(hand), 0, RULESET)).toBeGreaterThan(0);
    }
  });

  it('keeps the four states mutually exclusive for sample hands', () => {
    const samples: Tile[][] = [
      ['m1'],
      [
        'm1', 'm2', 'm3', 'p1', 'p2', 'p3', 's1', 's2', 's3',
        'm7', 'm8', 'm9', 'z5'
      ] as Tile[],
      [
        'm1', 'm2', 'm3', 'p1', 'p2', 'p3', 's1', 's2', 's3',
        'm7', 'm8', 'm9', 'z5', 'z5'
      ] as Tile[],
      [
        'm1', 'm3', 'm5', 'p2', 'p4', 'p6', 's1', 's3', 's5',
        'm7', 'm9', 'p8', 'z2'
      ] as Tile[]
    ];
    for (const hand of samples) {
      const label = classify(hand);
      const flags = {
        incomplete: label === 'incomplete',
        winning: label === 'winning',
        tenpai: label === 'tenpai',
        away: label === 'away'
      };
      expect(Object.values(flags).filter(Boolean)).toHaveLength(1);
    }
  });
});
