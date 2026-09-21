import { describe, expect, it } from 'vitest';
import { createGame } from '@/lib/mahjong/engine';
import { scoreHand } from '@/lib/mahjong/scoring';
import { value } from '@/lib/mahjong/scoring/values';
import { sortTiles, type Tile } from '@/lib/mahjong/tiles';

/**
 * Tools score path proof (MAHJONG_TOOLS_SPEC §4.2 / appendix #3).
 * Feed known hands through createGame → overwrite hand → scoreHand.
 * Expected fan values come from values.ts Hong Kong column (base), not riichi intuition.
 */
function scoreToolsPath(opts: {
  hand: Tile[];
  winningTile: Tile;
  selfDrawn: boolean;
  seatWind?: Tile;
  roundWind?: Tile;
}) {
  const state = createGame({ ruleset: 'hongkong', hongKongMode: 'standard', seed: 1 });
  state.players[0].hand = sortTiles(opts.hand);
  state.players[0].melds = [];
  state.turn = 0;
  if (opts.seatWind) state.players[0].seatWind = opts.seatWind;
  if (opts.roundWind) state.roundWind = opts.roundWind;
  return scoreHand({
    state,
    seat: 0,
    winningTile: opts.winningTile,
    selfDrawn: opts.selfDrawn
  });
}

const hand = (spec: string): Tile[] => spec.split(' ') as Tile[];

describe('tools score createGame path (Hong Kong)', () => {
  it('scores big three dragons via createGame rebuild', () => {
    const score = scoreToolsPath({
      hand: hand('z5 z5 z5 z6 z6 z6 z7 z7 z7 m2 m3 m4 p9'),
      winningTile: 'p9',
      selfDrawn: false
    });
    expect(score.patterns.map((p) => p.id)).toContain('bigThreeDragons');
    expect(score.patterns.find((p) => p.id === 'bigThreeDragons')?.value).toBe(
      value('bigThreeDragons', 'hongkong')
    );
    expect(score.total).toBeGreaterThanOrEqual(8);
  });

  it('scores full flush via createGame rebuild', () => {
    const score = scoreToolsPath({
      hand: hand('m1 m2 m3 m4 m5 m6 m7 m8 m9 m2 m3 m4 m5'),
      winningTile: 'm5',
      selfDrawn: false
    });
    expect(score.patterns.map((p) => p.id)).toContain('fullFlush');
    expect(score.patterns.find((p) => p.id === 'fullFlush')?.value).toBe(value('fullFlush', 'hongkong'));
  });

  it('scores seven pairs via createGame rebuild', () => {
    const score = scoreToolsPath({
      hand: hand('m1 m1 m3 m3 p2 p2 p5 p5 s4 s4 s8 s8 z1'),
      winningTile: 'z1',
      selfDrawn: false
    });
    expect(score.patterns.map((p) => p.id)).toContain('sevenPairs');
    expect(score.patterns.find((p) => p.id === 'sevenPairs')?.value).toBe(value('sevenPairs', 'hongkong'));
    expect(score.handShape).toBe('sevenPairs');
  });

  it('does not award Hong Kong pinfu (base 0) on an all-sequences hand', () => {
    // Four runs + non-value pair, ron — classic "pinfu shape" in riichi.
    const score = scoreToolsPath({
      hand: hand('m2 m3 m4 p3 p4 p5 s4 s5 s6 m6 m7 m8 p8'),
      winningTile: 'p8',
      selfDrawn: false
    });
    expect(value('pinfu', 'hongkong')).toBe(0);
    const pinfu = score.patterns.find((p) => p.id === 'pinfu');
    expect(!pinfu || pinfu.value === 0).toBe(true);
  });

  it('still awards seat wind when seatWind is overwritten on the rebuilt state', () => {
    // East seat + East triplet (z1×3) + filler to complete.
    const score = scoreToolsPath({
      hand: hand('z1 z1 z1 m2 m3 m4 p2 p3 p4 s2 s3 s4 m9'),
      winningTile: 'm9',
      selfDrawn: false,
      seatWind: 'z1',
      roundWind: 'z2'
    });
    expect(score.patterns.map((p) => p.id)).toContain('seatWind');
    expect(score.patterns.find((p) => p.id === 'seatWind')?.value).toBe(value('seatWind', 'hongkong'));
  });
});
