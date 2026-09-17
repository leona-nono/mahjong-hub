import { describe, expect, it } from 'vitest';
import { createGame } from '@/lib/mahjong/engine';
import { judgeDiscard, rankDiscards } from '@/lib/mahjong/coach';
import { dailySeed } from '@/lib/daily/seed';
import { planDailyStreak } from '@/lib/daily/streak';
import { chooseRegionalDiscard, createRegionalGame, judgeRegionalDiscard } from '@/lib/mahjong/regional';
import { tileHoverName } from '@/lib/mahjong/tile-hover';
import type { Tile } from '@/lib/mahjong/tiles';

describe('daily seed', () => {
  it('is stable for a UTC date key and does not use the clock', () => {
    expect(dailySeed('2026-09-14')).toBe(dailySeed('2026-09-14'));
    expect(dailySeed('2026-09-14')).not.toBe(dailySeed('2026-09-15'));
    expect(dailySeed('2026-09-14')).toBeGreaterThanOrEqual(0);
  });

  it('reuses the solitaire streak planner', () => {
    const plan = planDailyStreak({
      lastClearDate: '2026-09-13',
      streak: 2,
      freezeWeekKey: null,
      today: '2026-09-14'
    });
    expect(plan.streak).toBe(3);
    expect(plan.alreadyClearedToday).toBe(false);
  });
});

describe('hong kong coach', () => {
  it('grades the top-ranked discard as best', () => {
    const state = createGame({ ruleset: 'hongkong', seed: 7, humanSeat: 0 });
    const best = rankDiscards(state, 0)[0];
    expect(best).toBeTruthy();
    expect(judgeDiscard(state, 0, best.tile).grade).toBe('best');
  });
});

describe('regional coach', () => {
  it('does not grade Sichuan / Taiwan human discards', () => {
    const state = createRegionalGame({ ruleset: 'sichuan', seed: 3, humanSeat: 0 });
    state.phase = 'discard';
    state.turn = 0;
    state.players[0].voidSuit = 'm';
    state.players[0].hand = ['m1', 'p2', 'p3', 'p4'] as Tile[];
    expect(judgeRegionalDiscard(state, 0, 'm1')).toEqual({ grade: null, capability: 'unsupported' });
    expect(judgeRegionalDiscard(state, 0, 'p2')).toEqual({ grade: null, capability: 'unsupported' });
  });

  it('still picks a bot discard for Taiwan', () => {
    const state = createRegionalGame({ ruleset: 'taiwan', seed: 4, humanSeat: 0 });
    state.phase = 'discard';
    state.turn = 0;
    state.players[0].hand = ['z1', 'p2', 'p2', 'p3'] as Tile[];
    expect(chooseRegionalDiscard(state, 0)).toBe('z1');
  });
});

describe('tile hover names', () => {
  it('uses Crak, Dot and Bam instead of Characters', () => {
    expect(tileHoverName('m3')).toBe('三万 · 3 Crak');
    expect(tileHoverName('p5')).toBe('五筒 · 5 Dot');
    expect(tileHoverName('s1')).toBe('一条 · 1 Bam');
    expect(tileHoverName('m3')).not.toMatch(/Characters/);
  });
});
