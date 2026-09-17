import { describe, expect, it } from 'vitest';
import { createGame } from '@/lib/mahjong/engine';
import { createAmericanGame } from '@/lib/mahjong/american';
import { createRegionalGame } from '@/lib/mahjong/regional';
import {
  COACH_CAPABILITIES,
  explainDiscard,
  makeAmericanAdapter,
  makeGameStateAdapter,
  makeRegionalAdapter
} from '@/lib/mahjong/coach';
import {
  EMPTY_COACH_BUDGET,
  advanceCoachBudget,
  resolveCoachLevel
} from '@/features/table/coach-stage';
import { judgeRegionalDiscard } from '@/lib/mahjong/regional';
import type { Tile } from '@/lib/mahjong/tiles';

describe('coach capabilities registry', () => {
  it('marks hongkong full, riichi/mcr/american partial, regional unsupported', () => {
    expect(COACH_CAPABILITIES.hongkong).toBe('full');
    expect(COACH_CAPABILITIES.riichi).toBe('partial');
    expect(COACH_CAPABILITIES['chinese-official']).toBe('partial');
    expect(COACH_CAPABILITIES.american).toBe('partial');
    expect(COACH_CAPABILITIES.sichuan).toBe('unsupported');
    expect(COACH_CAPABILITIES.taiwan).toBe('unsupported');
  });
});

describe('game-state adapter (hongkong / riichi)', () => {
  it('grades hongkong discards with full capability', () => {
    const state = createGame({ ruleset: 'hongkong', seed: 7, humanSeat: 0 });
    const adapter = makeGameStateAdapter('hongkong');
    expect(adapter.capability).toBe('full');
    const best = adapter.rank(state, 0)[0];
    const verdict = adapter.judge(state, 0, best.tile);
    expect(verdict.capability).toBe('full');
    expect(verdict.grade).toBe('best');
    expect(verdict.suggested).toBe(best.tile);
  });

  it('keeps riichi partial with L1 fields and yaku_gate_pending (not silent)', () => {
    const state = createGame({ ruleset: 'riichi', seed: 11, humanSeat: 0 });
    const adapter = makeGameStateAdapter('riichi');
    expect(adapter.capability).toBe('partial');
    const best = adapter.rank(state, 0)[0];
    const verdict = adapter.judge(state, 0, best.tile);
    expect(verdict.grade).toBeNull();
    expect(verdict.capability).toBe('partial');
    expect(verdict.suggested).toBe(best.tile);
    expect(verdict.note).toBe('yaku_gate_pending');
    expect(typeof verdict.shanten).toBe('number');
  });
});

describe('american adapter', () => {
  it('surfaces risk and note for the practice coach', () => {
    const state = createAmericanGame(20260813);
    const adapter = makeAmericanAdapter();
    const tile = state.players[0].hand.find((t) => !t.startsWith('j')) ?? state.players[0].hand[0];
    const verdict = adapter.judge(state, 0, tile);
    expect(verdict.capability).toBe('partial');
    expect(verdict.played).toBe(tile);
    expect(verdict.note).toBeTruthy();
    // risk may be undefined early-hand; note must still carry exposure
    expect(verdict.note).toMatch(/exposed-group-compatible|call-commits-to-line|wait-for-mah-jongg/);
  });
});

describe('regional adapter + judgeRegionalDiscard', () => {
  it('never grades the human player', () => {
    const state = createRegionalGame({ ruleset: 'sichuan', seed: 3, humanSeat: 0 });
    state.phase = 'discard';
    state.turn = 0;
    state.players[0].voidSuit = 'm';
    state.players[0].hand = ['m1', 'p2', 'p3', 'p4'] as Tile[];

    const adapter = makeRegionalAdapter('sichuan');
    expect(adapter.capability).toBe('unsupported');
    expect(adapter.judge(state, 0, 'm1')).toEqual({ grade: null, capability: 'unsupported' });
    expect(adapter.judge(state, 0, 'p2')).toEqual({ grade: null, capability: 'unsupported' });
    expect(judgeRegionalDiscard(state, 0, 'm1')).toEqual({ grade: null, capability: 'unsupported' });
  });
});

describe('explainDiscard', () => {
  it('returns semantic codes without localized copy', () => {
    expect(explainDiscard({ grade: null, capability: 'unsupported' }).codes).toEqual(['unsupported']);
    expect(
      explainDiscard({
        grade: null,
        capability: 'partial',
        suggested: 'm1',
        played: 'm2',
        gap: -3,
        note: 'yaku_gate_pending'
      }).codes
    ).toContain('yaku_gate_pending');
    expect(
      explainDiscard({
        grade: 'better',
        capability: 'full',
        suggested: 'm1',
        played: 'm9',
        gap: -4,
        shanten: 2
      }).codes
    ).toContain('worse-ukeire');
  });
});

describe('coach-stage budget', () => {
  it('escalates better to L3 and stays quiet on silent', () => {
    const better = { grade: 'better' as const, capability: 'full' as const, suggested: 'm1', played: 'm9' };
    expect(
      resolveCoachLevel(better, EMPTY_COACH_BUDGET, { intensity: 'silent', asked: false, tenpai: false })
    ).toBe(0);
    expect(
      resolveCoachLevel(better, EMPTY_COACH_BUDGET, { intensity: 'live', asked: false, tenpai: true })
    ).toBe(3);
    const after = advanceCoachBudget(EMPTY_COACH_BUDGET, 3, 'better');
    expect(after.speaks).toBe(1);
    expect(after.bestStreak).toBe(0);
  });

  it('does not praise consecutive best while tenpai', () => {
    const best = { grade: 'best' as const, capability: 'full' as const, suggested: 'm1', played: 'm1' };
    const budget = { expands: 0, speaks: 0, bestStreak: 5 };
    expect(
      resolveCoachLevel(best, budget, { intensity: 'live', asked: false, tenpai: true })
    ).toBe(1);
  });
});
