import { describe, expect, it } from 'vitest';
import { createGame } from '@/lib/mahjong/engine';
import { scoreHand, expandSet, describeScore } from '@/lib/mahjong/scoring';
import type { Tile } from '@/lib/mahjong/tiles';

describe('expandSet', () => {
  it('expands pair, triplet, and run from the lowest tile', () => {
    expect(expandSet({ kind: 'pair', tile: 'z5' })).toEqual(['z5', 'z5']);
    expect(expandSet({ kind: 'triplet', tile: 'm2' })).toEqual(['m2', 'm2', 'm2']);
    expect(expandSet({ kind: 'run', tile: 'p3' })).toEqual(['p3', 'p4', 'p5']);
  });
});

describe('scoreHand review fields (Phase E1)', () => {
  it('attaches standard decomposition for a Hong Kong winning hand', () => {
    const state = createGame({ ruleset: 'hongkong', seed: 20260813, hongKongMode: 'casual' });
    state.players[0].hand = [
      'm2', 'm3', 'm4', 'p2', 'p3', 'p4', 's2', 's3', 's4',
      'm6', 'm7', 'm8', 'z5', 'z5'
    ] as Tile[];
    const score = scoreHand({ state, seat: 0, winningTile: 'z5', selfDrawn: true });
    expect(score.handShape).toBe('standard');
    expect(score.decomposition?.length).toBeGreaterThanOrEqual(4);
    expect(score.gate).toEqual({
      kind: 'minFan',
      required: 1,
      actual: score.total,
      passed: score.total >= 1
    });
    const expanded = (score.decomposition ?? []).flatMap(expandSet);
    expect(expanded.length).toBeGreaterThanOrEqual(14);
    // describeScore must stay English pattern list (unchanged contract)
    expect(describeScore(score)).toContain('+');
  });

  it('marks seven pairs without a standard decomposition', () => {
    const state = createGame({ ruleset: 'hongkong', seed: 1, hongKongMode: 'casual' });
    state.players[0].hand = [
      'm1', 'm1', 'm3', 'm3', 'p2', 'p2', 'p5', 'p5',
      's4', 's4', 's8', 's8', 'z1', 'z1'
    ] as Tile[];
    const score = scoreHand({ state, seat: 0, winningTile: 'z1', selfDrawn: true });
    expect(score.patterns.some((p) => p.id === 'sevenPairs')).toBe(true);
    expect(score.handShape).toBe('sevenPairs');
    expect(score.decomposition).toBeUndefined();
  });

  it('uses selectBestRiichiDecomposition for riichi review shape', () => {
    const state = createGame({ ruleset: 'riichi', seed: 11 });
    state.players[0].hand = [
      'm2', 'm3', 'm4', 'p2', 'p3', 'p4', 's2', 's3', 's4',
      'm6', 'm7', 'm8', 'z5', 'z5'
    ] as Tile[];
    state.players[0].declaredReady = true;
    const score = scoreHand({ state, seat: 0, winningTile: 'z5', selfDrawn: true });
    expect(score.handShape).toBe('standard');
    expect(score.decomposition).toBeTruthy();
    expect(score.gate?.kind).toBe('yaku');
    expect(score.legalYaku).toBe(true);
    expect(score.gate?.passed).toBe(true);
    const tileCount = (score.decomposition ?? []).flatMap(expandSet).length;
    expect(tileCount).toBe(14);
  });

  it('uses selectBestMcrDecomposition and reports the 8-fan gate', () => {
    const state = createGame({ ruleset: 'chinese-official', seed: 22 });
    // Concealed all-simples + self-draw style hand that typically clears the gate.
    state.players[0].hand = [
      'm2', 'm3', 'm4', 'p2', 'p3', 'p4', 's2', 's3', 's4',
      'm5', 'm6', 'm7', 'p5', 'p5'
    ] as Tile[];
    const score = scoreHand({ state, seat: 0, winningTile: 'p5', selfDrawn: true });
    expect(score.handShape).toBe('standard');
    expect(score.decomposition).toBeTruthy();
    expect(score.gate?.kind).toBe('minFan');
    expect(score.gate?.required).toBe(8);
    expect(typeof score.gate?.actual).toBe('number');
    expect((score.decomposition ?? []).flatMap(expandSet).length).toBe(14);
  });
});
