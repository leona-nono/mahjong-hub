import { describe, expect, it } from 'vitest';

import {
  BONUS_TILES,
  buildWall,
  sortTiles,
  tileFromIndex,
  tileIndex,
  toCounts,
  type Tile
} from '@/lib/mahjong/tiles';
import {
  decomposeWin,
  isWinningHand,
  shanten,
  shantenSevenPairs,
  shantenThirteenOrphans,
  waitingTiles
} from '@/lib/mahjong/shanten';
import {
  canDeclareTsumo,
  evaluateSelfDraw,
  CLAIM_TIMEOUT_MS,
  createGame,
  declareConcealedKan,
  declareTsumo,
  discard,
  drawTile,
  passUnansweredClaims,
  minimumWinScore,
  seatShanten,
  submitClaim,
  startNextHand,
  tilesRemaining,
  RULESETS,
  availableRiichiDiscards,
  declareRiichi,
  type GameState,
  type Ruleset,
  type Seat
} from '@/lib/mahjong/engine';
import { chooseClaim, chooseMove } from '@/lib/mahjong/ai';
import { scoreHand } from '@/lib/mahjong/scoring';
import { MCR_FANS, applyDirectMcrExclusions, hasCompleteMcrCatalogue } from '@/lib/mahjong/mcr-catalog';

const hand = (spec: string): Tile[] => spec.split(' ') as Tile[];

describe('tiles', () => {
  it('builds a 136 tile wall with four copies of each kind', () => {
    const wall = buildWall();
    expect(wall).toHaveLength(136);
    const counts = toCounts(wall);
    expect(counts.every((c) => c === 4)).toBe(true);
  });

  it('builds MCR’s 144-tile wall with one copy of each Flower / Season', () => {
    const wall = buildWall([], true);
    expect(wall).toHaveLength(144);
    expect(wall.filter((tile) => BONUS_TILES.includes(tile))).toEqual(BONUS_TILES);
    expect(toCounts(wall).every((c) => c === 4)).toBe(true);
  });

  it('round-trips tile ids through their index', () => {
    for (let i = 0; i < 34; i += 1) {
      expect(tileIndex(tileFromIndex(i))).toBe(i);
    }
  });
});


describe('Hong Kong product tile set', () => {
  it('omits Flowers, Seasons and the White Dragon from every new wall', () => {
    const state = createGame({ ruleset: 'hongkong', seed: 20260809 });
    expect(state.wall).toHaveLength(132);
    expect(state.wall).not.toContain('z5');
    expect(state.wall.filter((tile) => tile === 'z6')).toHaveLength(4);
    expect(state.wall.filter((tile) => tile === 'z7')).toHaveLength(4);
    expect(RULESETS.hongkong.excludedTiles).toEqual(['z5']);
  });
});

describe('Chinese Official MCR tile flow', () => {
  it('uses a 144-tile wall and keeps bonus tiles outside every player hand', () => {
    const state = createGame({ ruleset: 'chinese-official', seed: 20260813 });
    expect(state.wall).toHaveLength(144);
    for (const player of state.players) {
      expect(player.hand).toHaveLength(13);
      expect(player.hand.some((tile) => BONUS_TILES.includes(tile))).toBe(false);
    }
  });

  it('exposes a drawn Flower / Season and replaces it from the back wall', () => {
    const state = createGame({ ruleset: 'chinese-official', seed: 11 });
    state.wallIndex = 52;
    state.deadWallIndex = 130;
    state.wall[52] = 'f1';
    state.wall[130] = 'm1';
    const next = drawTile(state);
    expect(next.players[0].flowers).toContain('f1');
    expect(next.players[0].hand).toContain('m1');
    expect(next.players[0].hand).toHaveLength(14);
    expect(next.deadWallIndex).toBe(131);
  });
});

describe('Chinese Official MCR scoring catalogue', () => {
  it('keeps the official 81 fans in chart order and keeps Flowers outside the 8-point gate', () => {
    expect(hasCompleteMcrCatalogue()).toBe(true);
    expect(MCR_FANS).toHaveLength(81);
    expect(MCR_FANS[0]).toMatchObject({ number: 1, id: 'big-four-winds', points: 88 });
    expect(MCR_FANS[80]).toMatchObject({ number: 81, id: 'flower-tiles', points: 1, bonusOnly: true });
  });

  it('applies direct Account-Once exclusions using the higher official fan', () => {
    const selected = applyDirectMcrExclusions([
      { id: 'little-three-dragons' as const, points: 64 },
      { id: 'two-dragon-pungs' as const, points: 6 },
      { id: 'dragon-pung' as const, points: 2 }
    ]);
    expect(selected.map((fan) => fan.id)).toEqual(['little-three-dragons']);
  });

  it('uses MCR’s official Little Three Dragons value and does not double-count Dragon Pungs', () => {
    const state = createGame({ ruleset: 'chinese-official', seed: 42 });
    state.players[0].hand = hand('z5 z5 z5 z6 z6 z6 z7 z7 m1 m2 m3 p1 p2 p3');
    const score = scoreHand({ state, seat: 0, winningTile: 'p3', selfDrawn: false });
    expect(score.patterns.map((pattern) => pattern.id)).toEqual(expect.arrayContaining(['littleThreeDragons', 'concealed']));
    expect(score.patterns.map((pattern) => pattern.id)).not.toEqual(expect.arrayContaining(['dragonTriplet']));
    // The expanded MCR detector adds One Voided Suit (1) to the 64-point
    // Little Three Dragons + Concealed Hand shape.
    expect(score.total).toBe(67);
    expect(score.qualifyingTotal).toBe(67);
  });

  it('uses Fully Concealed Hand instead of stacking self draw and Concealed Hand', () => {
    const state = createGame({ ruleset: 'chinese-official', seed: 43 });
    state.players[0].hand = hand('m1 m2 m3 m2 m3 m4 p4 p5 p6 s6 s7 s8 z1 z1');
    state.players[0].flowers = [];
    const score = scoreHand({ state, seat: 0, winningTile: 'z1', selfDrawn: true });
    expect(score.patterns.map((pattern) => pattern.id)).toContain('fullyConcealed');
    expect(score.patterns.map((pattern) => pattern.id)).not.toEqual(expect.arrayContaining(['selfDraw', 'concealed']));
    expect(score.total).toBe(6); // All Chows (2) + Fully Concealed Hand (4)
  });

  it('detects implemented chow fans from the selected MCR decomposition', () => {
    const state = createGame({ ruleset: 'chinese-official', seed: 44 });
    state.players[0].hand = hand('m1 m2 m3 m4 m5 m6 m7 m8 m9 p1 p2 z1 z1');
    const score = scoreHand({ state, seat: 0, winningTile: 'p3', selfDrawn: false });
    expect(score.patterns.map((pattern) => pattern.id)).toEqual(expect.arrayContaining(['pureStraight', 'allSequences']));
    expect(score.patterns.find((pattern) => pattern.id === 'pureStraight')?.value).toBe(16);
  });

  it('selects high-value implemented MCR shifted structures and applies exclusions', () => {
    const state = createGame({ ruleset: 'chinese-official', seed: 45 });
    state.players[0].hand = hand('m1 m1 m1 m1 m2 m2 m2 m2 m3 m3 m3 m3 m5 m5');
    const score = scoreHand({ state, seat: 0, winningTile: 'm5', selfDrawn: true });
    expect(score.patterns.map((pattern) => pattern.id)).toContain('quadrupleChow');
    expect(score.patterns.map((pattern) => pattern.id)).not.toContain('pureTripleChow');
    expect(score.patterns.map((pattern) => pattern.id)).not.toContain('pureDoubleChow');
  });
});
describe('shanten', () => {
  it('reports -1 for a completed standard hand', () => {
    const tiles = hand('m1 m2 m3 p4 p5 p6 s7 s8 s9 z1 z1 z1 m5 m5');
    expect(shanten(toCounts(tiles))).toBe(-1);
    expect(isWinningHand(toCounts(tiles))).toBe(true);
  });

  it('reports 0 for a ready hand', () => {
    const tiles = hand('m1 m2 m3 p4 p5 p6 s7 s8 s9 z1 z1 z1 m5');
    expect(shanten(toCounts(tiles))).toBe(0);
  });

  it('finds the waits of a ready hand', () => {
    const tiles = hand('m1 m2 m3 p4 p5 p6 s7 s8 s9 z1 z1 z1 m5');
    expect(waitingTiles(toCounts(tiles))).toEqual(['m5']);
  });

  it('handles a two-sided wait', () => {
    const tiles = hand('m1 m2 m3 p4 p5 p6 s7 s8 s9 z1 z1 m4 m5');
    expect(sortTiles(waitingTiles(toCounts(tiles)))).toEqual(['m3', 'm6']);
  });

  it('recognises seven pairs', () => {
    const tiles = hand('m1 m1 m4 m4 p2 p2 p7 p7 s3 s3 s9 s9 z5 z5');
    expect(shantenSevenPairs(toCounts(tiles))).toBe(-1);
    expect(shanten(toCounts(tiles))).toBe(-1);
  });

  it('treats four of a kind as two of the seven pairs (tenpai)', () => {
    // m1x4 = two pairs; plus m4/p2/p7/s3 pairs and an s9 singleton = six pairs
    // + one single, which is tenpai waiting on s9 (shanten 0).
    const tiles = hand('m1 m1 m1 m1 m4 m4 p2 p2 p7 p7 s3 s3 s9');
    expect(shantenSevenPairs(toCounts(tiles))).toBe(0);
  });

  it('counts a four-of-a-kind as two pairs for seven-pairs shanten (HK / CO)', () => {
    // m1x4 = two pairs; with four more pairs and an s9 singleton that is six
    // pairs + one single, i.e. tenpai waiting on s9.
    const tiles = hand('m1 m1 m1 m1 m4 m4 p2 p2 p7 p7 s3 s3 s9');
    expect(shantenSevenPairs(toCounts(tiles), 'hongkong')).toBe(0);
    expect(shantenSevenPairs(toCounts(tiles), 'chinese-official')).toBe(0);
    expect(sortTiles(waitingTiles(toCounts(tiles), 0, 'hongkong'))).toEqual(['s9']);
  });

  it('recognises a seven-pairs win built on a four-of-a-kind (HK / CO)', () => {
    const tiles = hand('m1 m1 m1 m1 m4 m4 p2 p2 p7 p7 s3 s3 s9 s9');
    expect(shantenSevenPairs(toCounts(tiles), 'hongkong')).toBe(-1);
    expect(shantenSevenPairs(toCounts(tiles), 'chinese-official')).toBe(-1);
    expect(shanten(toCounts(tiles), 0, 'hongkong')).toBe(-1);
    expect(isWinningHand(toCounts(tiles), 0, 'chinese-official')).toBe(true);
  });

  it('applies the strict riichi rule: a quad counts as one pair, not two', () => {
    // Riichi chiitoitsu needs seven *distinct* pairs; m1x4 can only be one pair,
    // leaving the 14-tile hand one tile-short of seven pairs (shanten 1).
    const tiles = hand('m1 m1 m1 m1 m4 m4 p2 p2 p7 p7 s3 s3 s9 s9');
    expect(shantenSevenPairs(toCounts(tiles), 'riichi')).toBe(1);
    expect(shanten(toCounts(tiles), 0, 'riichi')).toBe(1);
    expect(isWinningHand(toCounts(tiles), 0, 'riichi')).toBe(false);
  });

  it('recognises a true seven-pairs win under every ruleset', () => {
    const tiles = hand('m1 m1 m4 m4 p2 p2 p7 p7 s3 s3 s9 s9 z5 z5');
    for (const ruleset of ['hongkong', 'riichi', 'chinese-official'] as const) {
      expect(shantenSevenPairs(toCounts(tiles), ruleset)).toBe(-1);
      expect(shanten(toCounts(tiles), 0, ruleset)).toBe(-1);
    }
  });

  it('finds no seven-pairs waits under strict riichi for a quad hand', () => {
    const tiles = hand('m1 m1 m1 m1 m4 m4 p2 p2 p7 p7 s3 s3 s9');
    // Lenient rules wait on s9; riichi is two away and has no waits at all.
    expect(sortTiles(waitingTiles(toCounts(tiles), 0, 'hongkong'))).toEqual(['s9']);
    expect(waitingTiles(toCounts(tiles), 0, 'riichi')).toEqual([]);
  });

  it('recognises thirteen orphans', () => {
    const tiles = hand('m1 m9 p1 p9 s1 s9 z1 z2 z3 z4 z5 z6 z7 z7');
    expect(shantenThirteenOrphans(toCounts(tiles))).toBe(-1);
  });

  it('is one away when a single tile is wrong', () => {
    const tiles = hand('m1 m2 m3 p4 p5 p6 s7 s8 s9 z1 z1 m5 z3');
    expect(shanten(toCounts(tiles))).toBe(1);
  });

  it('accounts for called melds', () => {
    // 10 concealed tiles plus one meld should still complete at -1.
    const tiles = hand('m1 m2 m3 p4 p5 p6 s7 s8 s9 m5 m5');
    expect(shanten(toCounts(tiles), 1)).toBe(-1);
  });
});

describe('decomposeWin', () => {
  it('splits a hand into four sets and a pair', () => {
    const tiles = hand('m1 m2 m3 p4 p5 p6 s7 s8 s9 z1 z1 z1 m5 m5');
    const sets = decomposeWin(toCounts(tiles));
    expect(sets).not.toBeNull();
    expect(sets).toHaveLength(5);
    expect(sets!.filter((s) => s.kind === 'pair')).toHaveLength(1);
    expect(sets!.filter((s) => s.kind === 'run')).toHaveLength(3);
    expect(sets!.filter((s) => s.kind === 'triplet')).toHaveLength(1);
  });

  it('returns null for a hand that is only seven pairs', () => {
    const tiles = hand('m1 m1 m4 m4 p2 p2 p7 p7 s3 s3 s9 s9 z5 z5');
    expect(decomposeWin(toCounts(tiles))).toBeNull();
  });
});

describe('engine', () => {
  it('keeps scores and rotates the dealer when moving to the next hand', () => {
    const state = createGame({ ruleset: 'riichi', seed: 23 });
    state.phase = 'over';
    state.result = { kind: 'win', winner: 1 };
    state.players[0].score = 28600;
    state.players[1].score = 31400;
    state.honba = 2;
    state.riichiSticks = 1;

    const next = startNextHand(state);
    expect(next.phase).toBe('draw');
    expect(next.dealer).toBe(1);
    expect(next.handNumber).toBe(1);
    expect(next.players.map((player) => player.score)).toEqual([28600, 31400, 30000, 30000]);
    expect(next.honba).toBe(2);
    expect(next.riichiSticks).toBe(1);
    expect(next.players[1].seatWind).toBe('z1');
  });

  it('deals thirteen tiles to each seat from a seeded wall', () => {
    const state = createGame({ seed: 42 });
    expect(state.players).toHaveLength(4);
    for (const player of state.players) {
      expect(player.hand).toHaveLength(13);
    }
    expect(state.phase).toBe('draw');
  });

  it('is reproducible for a given seed', () => {
    const a = createGame({ seed: 7 });
    const b = createGame({ seed: 7 });
    expect(a.players[0].hand).toEqual(b.players[0].hand);
  });

  it('moves from draw to discard and back', () => {
    let state = createGame({ seed: 3 });
    const before = tilesRemaining(state);
    state = drawTile(state);
    expect(state.players[0].hand).toHaveLength(14);
    expect(state.phase).toBe('discard');
    expect(tilesRemaining(state)).toBe(before - 1);

    const tile = state.players[0].hand[0];
    state = discard(state, tile);
    expect(state.players[0].hand).toHaveLength(13);
    expect(state.players[0].discards).toContain(tile);
    expect(['draw', 'claim']).toContain(state.phase);
  });

  it('exposes a sane shanten for a freshly dealt hand', () => {
    const state = createGame({ seed: 11 });
    const value = seatShanten(state, 0);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(8);
  });

  it('ships a minimum score for every ruleset', () => {
    for (const config of Object.values(RULESETS)) {
      expect(config.minimumScore).toBeGreaterThan(0);
    }
  });

  it('offers ron and scores with the winning tile included', () => {
    // Seat 0 holds four concealed triplets + a pair, waiting on z4/z5. Ron on
    // z4 completes four concealed triplets (a limit hand) 鈥?the engine must
    // score with the 14-tile hand, not the pre-ron 13-tile one.
    const state = createGame({ seed: 1 });
    state.players[0].hand = hand('m1 m1 m1 p2 p2 p2 s3 s3 s3 z4 z4 z5 z5');
    state.players[1].hand = hand('z4 m5 m6 m7 m8 m9 p3 p4 p5 s4 s5 s6 z1');
    state.players[2].hand = hand('m2 m3 m4 m5 m6 m7 m8 m9 p1 p2 p3 p4 p5');
    state.players[3].hand = hand('p6 p7 p8 p9 s1 s2 s3 s4 s5 s6 s7 s8 s9');
    state.turn = 1;
    state.phase = 'discard';
    state.lastDiscard = null;
    state.claims = {};
    state.submitted = {};

    const after = discard(state, 'z4');
    expect(after.phase).toBe('claim');
    const ron = after.claims[0]?.find((o) => o.kind === 'ron');
    expect(ron).toBeDefined();

    const resolved = submitClaim(after, 0, ron!);
    expect(resolved.result?.kind).toBe('win');
    expect(resolved.result?.winner).toBe(0);
    expect(resolved.result?.score?.total).toBe(10); // Hong Kong table caps at 10 Fan
  });

  it('gates a quad seven-pairs win by ruleset', () => {
    // m1x4 is two pairs under HK/CO (a seven-pairs win) but only one pair under
    // strict riichi chiitoitsu, which needs seven *distinct* pairs.
    const quadPairs = hand('m1 m1 m1 m1 m4 m4 p2 p2 p7 p7 s3 s3 s9 s9');

    const hk = createGame({ ruleset: 'hongkong', seed: 1 });
    hk.players[0].hand = quadPairs;
    hk.phase = 'discard';
    expect(canDeclareTsumo(hk, 0)).toBe(true);

    const riichi = createGame({ ruleset: 'riichi', seed: 1 });
    riichi.players[0].hand = quadPairs;
    riichi.phase = 'discard';
    expect(canDeclareTsumo(riichi, 0)).toBe(false);
  });

  it('uses WRC head-bump when two players call ron', () => {
    // Two seats both ron on seat 1's z1 discard. Each has a half-flush with a
    // dragon triplet, so both clear the score floor for every ruleset.
    const setup = (ruleset: Ruleset) => {
      const state = createGame({ ruleset, seed: 1 });
      state.players[0].hand = hand('m1 m2 m3 m4 m5 m6 m7 m8 m9 z5 z5 z5 z1');
      state.players[1].hand = hand('z1 m5 m6 m7 m8 m9 p3 p4 p5 s4 s5 s6 z2');
      state.players[2].hand = hand('m1 m2 m3 m4 m5 m6 m7 m8 m9 z6 z6 z6 z1');
      state.players[3].hand = hand('p6 p7 p8 p9 s1 s2 s3 s4 s5 s6 s7 s8 s9');
      state.turn = 1;
      state.phase = 'discard';
      state.lastDiscard = null;
      state.claims = {};
      state.submitted = {};
      return state;
    };

    // Hong Kong / Chinese Official: the lowest seat ron wins alone.
    const hk = discard(setup('hongkong'), 'z1');
    expect(hk.claims[0]?.some((o) => o.kind === 'ron')).toBe(true);
    expect(hk.claims[2]?.some((o) => o.kind === 'ron')).toBe(true);
    let hkResolved = submitClaim(hk, 0, hk.claims[0]!.find((o) => o.kind === 'ron')!);
    hkResolved = submitClaim(
      hkResolved,
      2,
      hkResolved.claims[2]!.find((o) => o.kind === 'ron')!
    );
    expect(hkResolved.result?.kind).toBe('win');
    expect(hkResolved.result?.winner).toBe(0);
    expect(hkResolved.result?.winners).toBeUndefined();

    // Riichi: every ron winner is paid by the discarder.
    const riichi = discard(setup('riichi'), 'z1');
    expect(riichi.claims[0]?.some((o) => o.kind === 'ron')).toBe(true);
    expect(riichi.claims[2]?.some((o) => o.kind === 'ron')).toBe(true);
    let riichiResolved = submitClaim(
      riichi,
      0,
      riichi.claims[0]!.find((o) => o.kind === 'ron')!
    );
    riichiResolved = submitClaim(
      riichiResolved,
      2,
      riichiResolved.claims[2]!.find((o) => o.kind === 'ron')!
    );
    expect(riichiResolved.result?.kind).toBe('win');
    expect(riichiResolved.result?.winner).toBe(2);
    expect(riichiResolved.result?.loser).toBe(1);
    expect(riichiResolved.result?.winners).toBeUndefined();
  });


  it('starts WRC Riichi at 30,000 and confirms a 1,000-point riichi stick', () => {
    let state = createGame({ ruleset: 'riichi', seed: 7 });
    expect(state.players.every((player) => player.score === 30000)).toBe(true);
    state.players[0].hand = hand('m1 m2 m3 m4 m5 m6 p2 p3 p4 s6 s7 s8 z1 z1');
    state.turn = 0;
    state.phase = 'discard';
    const candidates = availableRiichiDiscards(state, 0);
    expect(candidates.length).toBeGreaterThan(0);
    state = declareRiichi(state, 0);
    state = discard(state, candidates[0], 1000);
    expect(state.players[0].declaredReady).toBe(true);
    expect(state.players[0].score).toBe(29000);
    expect(state.riichiSticks).toBe(1);
  });
  it('auto-passes a silent claim after the timeout', () => {
    // Seat 1 discards m3; only seat 0 (the human) can pon it. Seat 0 stays
    // silent, so once the window expires the engine must pass it and move on.
    const state = createGame({ seed: 1 });
    state.players[0].hand = hand('m3 m3 m5 m6 m7 m8 m9 p4 p5 p6 s7 s8 s9');
    state.players[1].hand = hand('m3 m5 m6 m7 m8 m9 p3 p4 p5 s4 s5 s6 z1');
    state.players[2].hand = hand('p1 p2 p3 p4 p5 p6 s7 s8 s9 z2 z2 z3 z3');
    state.players[3].hand = hand('p6 p7 p8 p9 s1 s2 s3 s4 s5 s6 s7 s8 s9');
    state.turn = 1;
    state.phase = 'discard';
    state.lastDiscard = null;
    state.claims = {};
    state.submitted = {};

    const opened = discard(state, 'm3', 1000);
    expect(opened.phase).toBe('claim');
    expect(opened.claimOpenedAt).toBe(1000);
    expect(opened.claims[0]?.some((o) => o.kind === 'pon')).toBe(true);

    // Inside the window nothing is forced.
    const soon = passUnansweredClaims(opened, 1000 + CLAIM_TIMEOUT_MS - 1);
    expect(soon.phase).toBe('claim');

    // Past the deadline the silent seat is auto-passed and play resumes.
    const expired = passUnansweredClaims(opened, 1000 + CLAIM_TIMEOUT_MS);
    expect(expired.phase).toBe('draw');
    expect(expired.turn).toBe(2);
  });
});


describe('Hong Kong self-draw outcome', () => {
  it('uses a one-Fan casual threshold and a three-Fan standard threshold', () => {
    expect(minimumWinScore(createGame({ ruleset: 'hongkong', hongKongMode: 'casual' }))).toBe(1);
    expect(minimumWinScore(createGame({ ruleset: 'hongkong', hongKongMode: 'standard' }))).toBe(3);
  });

  it('lets a complete low-Fan hand win in casual mode but not standard mode', () => {
    const tiles = hand('m1 m1 m1 m2 m3 m4 p3 p4 p5 s6 s7 s8 z1 z1');
    const casual = createGame({ ruleset: 'hongkong', hongKongMode: 'casual', seed: 18 });
    casual.turn = 0;
    casual.phase = 'discard';
    casual.players[0].hand = tiles;
    const standard = createGame({ ruleset: 'hongkong', hongKongMode: 'standard', seed: 18 });
    standard.turn = 0;
    standard.phase = 'discard';
    standard.players[0].hand = tiles;

    expect(evaluateSelfDraw(casual, 0).legal).toBe(true);
    expect(evaluateSelfDraw(standard, 0).legal).toBe(false);
  });

  it('awards one Fan to a zero-Fan chicken hand in casual mode', () => {
    const state = createGame({ ruleset: 'hongkong', hongKongMode: 'casual', seed: 19 });
    state.players[0].hand = hand('m4 m5 m6 p9');
    state.players[0].melds = [
      { kind: 'chi', tiles: hand('m1 m2 m3'), from: 3 },
      { kind: 'chi', tiles: hand('p4 p5 p6'), from: 3 },
      { kind: 'pon', tiles: hand('s7 s7 s7'), from: 1 }
    ];

    const score = scoreHand({ state, seat: 0, winningTile: 'p9', selfDrawn: false });
    expect(score.total).toBe(1);
    expect(score.patterns.map((pattern) => pattern.id)).toContain('chickenHand');
  });

  it('records the human winner and payments for a legal self-draw', () => {
    const state = createGame({ ruleset: 'hongkong', seed: 7 });
    state.turn = 0;
    state.phase = 'discard';
    state.players[0].hand = hand('m1 m2 m3 m2 m3 m4 m5 m6 m7 m7 m8 m9 m5 m5');
    const evaluation = evaluateSelfDraw(state, 0);
    expect(evaluation.complete).toBe(true);
    expect(evaluation.legal).toBe(true);
    const result = declareTsumo(state, 0);
    expect(result.phase).toBe('over');
    expect(result.result?.kind).toBe('win');
    expect(result.result?.winner).toBe(0);
    expect(result.result?.loser).toBeUndefined();
    expect(result.result?.score?.total).toBeGreaterThanOrEqual(3);
    expect(result.players[0].score).toBeGreaterThan(78000);
    expect(result.players.slice(1).every((player) => player.score < 78000)).toBe(true);
  });

  it('counts a closed self-drawn hand and allows the three-Fan win shown in gameplay', () => {
    const state = createGame({ ruleset: 'hongkong', seed: 9 });
    state.turn = 0;
    state.phase = 'discard';
    state.players[0].hand = hand('m1 m1 m1 p1 p2 p3 p4 p5 p6 z7 z7 z7 s6 s6');

    const evaluation = evaluateSelfDraw(state, 0);

    expect(evaluation.complete).toBe(true);
    expect(evaluation.score?.patterns.map((pattern) => pattern.id)).toEqual(
      expect.arrayContaining(['dragonTriplet', 'selfDraw', 'concealed'])
    );
    expect(evaluation.score?.total).toBe(3);
    expect(evaluation.legal).toBe(true);
    expect(declareTsumo(state, 0).result?.winner).toBe(0);
  });

  it('reports a complete hand below the three-Fan minimum without declaring a win', () => {
    const state = createGame({ ruleset: 'hongkong', seed: 8 });
    state.turn = 0;
    state.phase = 'discard';
    state.players[0].hand = hand('m1 m1 m1 m2 m3 m4 p3 p4 p5 s6 s7 s8 z1 z1');
    const evaluation = evaluateSelfDraw(state, 0);
    expect(evaluation.complete).toBe(true);
    expect(evaluation.legal).toBe(false);
    expect(evaluation.score?.total).toBeLessThan(3);
    expect(declareTsumo(state, 0)).toBe(state);
  });
});
describe('ai', () => {
  it('always returns a legal move from the current hand', () => {
    let state = createGame({ seed: 99 });
    state = drawTile(state);
    const move = chooseMove(state, 0);
    if (move.type === 'discard') {
      expect(state.players[0].hand).toContain(move.tile);
    } else {
      expect(['tsumo', 'kan']).toContain(move.type);
    }
  });

  it('never increases its own shanten when discarding', () => {
    let state: GameState = createGame({ seed: 123 });
    state = drawTile(state);
    const before = shanten(
      toCounts(state.players[0].hand.slice(0, 13)),
      0
    );
    const move = chooseMove(state, 0);
    if (move.type === 'discard') {
      const rest = [...state.players[0].hand];
      rest.splice(rest.indexOf(move.tile), 1);
      expect(shanten(toCounts(rest), 0)).toBeLessThanOrEqual(before);
    }
  });

  it('plays a full hand to completion without throwing', () => {
    // Drives the whole loop 鈥?including claim windows 鈥?so the turn flow after
    // a chi / pon is exercised rather than skipped past.
    let state = createGame({ seed: 2026 });
    let guard = 0;
    while (state.phase !== 'over' && guard < 400) {
      guard += 1;
      if (state.phase === 'draw') {
        state = drawTile(state);
        continue;
      }
      if (state.phase === 'discard') {
        const move = chooseMove(state, state.turn);
        if (move.type === 'discard') {
          state = discard(state, move.tile);
        } else if (move.type === 'tsumo') {
          state = declareTsumo(state, state.turn);
        } else {
          state = declareConcealedKan(state, state.turn, move.tile);
        }
        continue;
      }
      if (state.phase === 'claim') {
        // Every seat answers like a bot; each submission advances the window.
        const pending = Object.keys(state.claims).map(Number) as Seat[];
        for (const seat of pending) {
          const options = state.claims[seat]!;
          state = submitClaim(
            state,
            seat,
            chooseClaim(state, seat, options, 'normal')
          );
        }
        continue;
      }
      break;
    }
    expect(guard).toBeLessThan(400);
    expect(state.phase).toBe('over');
  });
});
