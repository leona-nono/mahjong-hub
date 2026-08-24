import { describe, expect, it } from 'vitest';

import {
  allowedSichuanVoidSuits,
  canWinSichuan,
  canWinTaiwan,
  chooseSichuanVoidSuit,
  createRegionalGame,
  declareRegionalTsumo,
  discardRegionalTile,
  drawRegionalTile,
  replayRegionalActions,
  regionalDiscardRisk,
  regionalWaitingTiles,
  submitRegionalClaim,
  submitSichuanExchange,
  startNextRegionalHand,
  taiwanReadyDiscards,
  taiwanWaitType,
  taiwanTai
} from '@/lib/mahjong/regional';

describe('regional mahjong engines', () => {
  it('deals Sichuan from a deterministic 108-tile, three-suit wall', () => {
    const state = createRegionalGame({ ruleset: 'sichuan', seed: 8 });
    expect(state.wall).toHaveLength(108);
    expect(state.players.every((player) => player.hand.length === 13)).toBe(true);
    expect(state.wall.some((tile) => tile.startsWith('z') || tile.startsWith('f'))).toBe(false);
    expect(state.phase).toBe('exchange');
  });

  it('requires a same-suit Exchange Three and permits three identical copies', () => {
    let state = createRegionalGame({ ruleset: 'sichuan', seed: 4 });
    state.players[0].hand = ['m1', 'm1', 'm1', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 's1', 's2', 's3', 's4'];
    const rejected = submitSichuanExchange(state, 0, ['m1', 'p1', 'p2']);
    expect(rejected).toBe(state);
    state = submitSichuanExchange(state, 0, ['m1', 'm1', 'm1']);
    expect(state.exchangeSelections[0]).toEqual(['m1', 'm1', 'm1']);
  });

  it('only permits a least-populous Sichuan suit as the forbidden suit', () => {
    const state = createRegionalGame({ ruleset: 'sichuan', seed: 1 });
    state.phase = 'choose-void';
    state.players[0].hand = ['m1', 'm2', 'm3', 'm4', 'm5', 'p1', 'p2', 'p3', 'p4', 'p5', 's1', 's2', 's3'];
    expect(allowedSichuanVoidSuits(state.players[0].hand)).toEqual(['s']);
    expect(chooseSichuanVoidSuit(state, 0, 'm')).toBe(state);
    expect(chooseSichuanVoidSuit(state, 0, 's').players[0].voidSuit).toBe('s');
  });

  it('enforces forbidden-suit clearance and continues Blood Battle after a win', () => {
    const winning = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'p1', 'p2', 'p3', 'p4', 'p4'];
    expect(canWinSichuan(winning, 's')).toBe(true);
    expect(canWinSichuan([...winning, 's1'], 's')).toBe(false);
    const state = createRegionalGame({ ruleset: 'sichuan', seed: 1 });
    state.phase = 'discard';
    state.turn = 0;
    state.players[0].hand = winning;
    state.players[0].voidSuit = 's';
    const after = declareRegionalTsumo(state, 0);
    expect(after.players[0].won).toBe(true);
    expect(after.phase).toBe('draw');
    expect(after.turn).toBe(1);
  });

  it('deals Taiwan hands with flowers replaced and recognises five melds plus a pair', () => {
    const state = createRegionalGame({ ruleset: 'taiwan', seed: 6 });
    expect(state.wall).toHaveLength(144);
    expect(state.players.every((player) => player.hand.length === 16)).toBe(true);
    expect(state.players.flatMap((player) => player.hand).some((tile) => tile.startsWith('f'))).toBe(false);
    const winning = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p8', 'p8'];
    expect(canWinTaiwan(winning)).toBe(true);
    state.players[0].hand = winning;
    state.players[0].flowers = ['f1', 'f5'];
    expect(taiwanTai(state.players[0])).toBe(5); // concealed self draw + two flowers + matching flower and season
  });

  it('uses MahJongo Taiwan base plus Tai payments, including a 0-Tai discard win', () => {
    const selfDraw = createRegionalGame({ ruleset: 'taiwan', seed: 1, dealer: 1 });
    selfDraw.phase = 'discard';
    selfDraw.turn = 0;
    selfDraw.players[0].flowers = [];
    selfDraw.players[0].hand = ['m1', 'm2', 'm3', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 's1', 's2', 's3', 's4', 's5', 's6', 'p8', 'p8'];
    const tsumo = declareRegionalTsumo(selfDraw, 0);
    expect(tsumo.result).toMatchObject({ tai: 3, base: 1, payments: { 1: 4, 2: 4, 3: 4 } });

    const ron = createRegionalGame({ ruleset: 'taiwan', seed: 2 });
    ron.phase = 'discard';
    ron.turn = 0;
    ron.players[0].hand = ['m1', 'm4', 'm5', 'm6', 'm7', 'm8', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 's1', 's2', 's3', 's4', 's5'];
    ron.players[1].hand = ['m2', 'm3', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 's4', 's4'];
    ron.players[1].flowers = [];
    ron.players[1].melds = [{ kind: 'chi', tiles: ['s1', 's2', 's3'], from: 0 }];
    // Keep this fixture outside the opening 人胡 window so it remains a real 0-Tai ron.
    ron.actions.push({ type: 'discard', seat: 2, tile: 'p9' });
    let claimed = discardRegionalTile(ron, 0, 'm1');
    claimed = submitRegionalClaim(claimed, 1, { kind: 'ron', tiles: ['m1'] });
    expect(claimed.result).toMatchObject({ tai: 0, base: 1, loser: 0, payments: { 0: 1 } });
  });

  it('offers Taiwan ready declarations only for real waits and classifies a closed wait', () => {
    const state = createRegionalGame({ ruleset: 'taiwan', seed: 9 });
    state.phase = 'discard';
    state.turn = 0;
    state.players[0].hand = ['m1', 'm2', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 's1', 's2', 's3', 's4', 's5', 's6', 'p8', 'p8', 'z1'];
    expect(taiwanReadyDiscards(state, 0)).toContain('z1');
    const declared = discardRegionalTile(state, 0, 'z1', true);
    expect(declared.players[0]).toMatchObject({ declaredReady: true, groundReady: true });

    const closed = createRegionalGame({ ruleset: 'taiwan', seed: 10 });
    closed.players[0].hand = ['m1', 'm3', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 's1', 's2', 's3', 's4', 's4'];
    expect(taiwanWaitType(closed, 0, 'm2')).toBe('closed');
  });

  it('settles Taiwan heavenly, earthly, human and opening-flower timing from game events', () => {
    const heaven = createRegionalGame({ ruleset: 'taiwan', seed: 12 });
    heaven.phase = 'discard';
    heaven.turn = 0;
    heaven.players[0].flowers = [];
    heaven.players[0].hand = ['m1', 'm2', 'm3', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 's1', 's2', 's3', 's4', 's5', 's6', 'p8', 'p8'];
    expect(declareRegionalTsumo(heaven, 0).result?.tai).toBe(24);

    const earth = createRegionalGame({ ruleset: 'taiwan', seed: 13 });
    earth.phase = 'discard';
    earth.turn = 1;
    earth.players[1].flowers = [];
    earth.players[1].hand = ['m1', 'm2', 'm3', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 's1', 's2', 's3', 's4', 's5', 's6', 'p8', 'p8'];
    earth.actions.push({ type: 'discard', seat: 0, tile: 'm9' });
    expect(declareRegionalTsumo(earth, 1).result?.tai).toBe(16);

    const human = createRegionalGame({ ruleset: 'taiwan', seed: 15 });
    human.phase = 'discard';
    human.turn = 0;
    human.players[0].hand = ['m1', 'm4', 'm5', 'm6', 'm7', 'm8', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 's1', 's2', 's3', 's4', 's5'];
    human.players[1].hand = ['m2', 'm3', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 's1', 's2', 's3', 'z1', 'z1'];
    human.players[1].flowers = [];
    human.players[2].hand = [];
    human.players[3].hand = [];
    let humanRon = discardRegionalTile(human, 0, 'm1');
    humanRon = submitRegionalClaim(humanRon, 1, { kind: 'ron', tiles: ['m1'] });
    expect(humanRon.result?.tai).toBe(9); // 人胡 8 + 门清 1

    const flowers = createRegionalGame({ ruleset: 'taiwan', seed: 14 });
    flowers.phase = 'draw';
    flowers.openingFlowerWin = { winner: 0 };
    const flowerResult = drawRegionalTile(flowers).result;
    expect(flowerResult).toMatchObject({ tai: 12, base: 1, payments: { 1: 13, 2: 13, 3: 13 } });
  });

  it('reserves Taiwan final sixteen wall tiles and uses Chengdu 0-fan payment rules', () => {
    const taiwan = createRegionalGame({ ruleset: 'taiwan', seed: 3 });
    taiwan.phase = 'draw';
    taiwan.wallIndex = 128;
    taiwan.replacementIndex = 143;
    expect(drawRegionalTile(taiwan).phase).toBe('over');

    const sichuan = createRegionalGame({ ruleset: 'sichuan', seed: 3 });
    sichuan.phase = 'discard';
    sichuan.turn = 0;
    sichuan.players[0].hand = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'p1', 'p2', 'p3', 'p4', 'p4'];
    const tsumo = declareRegionalTsumo(sichuan, 0);
    expect(tsumo.players.map((player) => player.score)).toEqual([1006, 998, 998, 998]);
  });

  it('forces a Sichuan player to discard their forbidden suit and ends Blood Battle at three winners', () => {
    const state = createRegionalGame({ ruleset: 'sichuan', seed: 1 });
    state.phase = 'discard';
    state.turn = 0;
    state.players[0].voidSuit = 's';
    state.players[0].hand = ['s1', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'p1', 'p2', 'p3', 'p4'];
    expect(discardRegionalTile(state, 0, 'm1')).toBe(state);
    expect(discardRegionalTile(state, 0, 's1').players[0].discards).toEqual(['s1']);

    state.players[1].won = true;
    state.players[2].won = true;
    state.players[0].hand = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'p1', 'p2', 'p3', 'p4', 'p4'];
    state.phase = 'discard';
    state.turn = 0;
    const finished = declareRegionalTsumo(state, 0);
    expect(finished.phase).toBe('over');
    expect(finished.result?.winners).toEqual(expect.arrayContaining([0, 1, 2]));
    expect(finished.result?.loser).toBe(3);
  });

  it('opens a Taiwan claim window and lets a higher-priority Pon beat Chi', () => {
    const state = createRegionalGame({ ruleset: 'taiwan', seed: 1 });
    state.phase = 'discard';
    state.turn = 1;
    state.players[1].hand = ['m3', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 's1', 's2', 's3', 's4', 's5', 's6', 's7'];
    state.players[2].hand = ['m1', 'm2', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 's1', 's2', 's3', 's4', 's5'];
    state.players[0].hand = ['m3', 'm3', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 's1', 's2', 's3', 's4', 's5'];
    state.players[3].hand = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 's1', 's2', 's3', 's4', 's5', 's6', 's7'];
    let after = discardRegionalTile(state, 1, 'm3');
    expect(after.phase).toBe('claim');
    expect(after.claims[2]?.some((option) => option.kind === 'chi')).toBe(true);
    expect(after.claims[0]?.some((option) => option.kind === 'pon')).toBe(true);
    for (const seat of Object.keys(after.claims).map(Number) as Array<0 | 2 | 3>) {
      const option = seat === 0 ? after.claims[seat]!.find((candidate) => candidate.kind === 'pon')! : { kind: 'pass' as const, tiles: [] };
      after = submitRegionalClaim(after, seat, option);
    }
    expect(after.turn).toBe(0);
    expect(after.phase).toBe('discard');
    expect(after.players[0].melds[0]?.kind).toBe('pon');
  });

  it('keeps the dealer after a dealer win and rotates while preserving scores otherwise', () => {
    const state = createRegionalGame({ ruleset: 'taiwan', seed: 7 });
    state.phase = 'over';
    state.players[0].score = 1024;
    state.players[1].score = 976;
    state.result = { kind: 'win', winners: [1] };
    const next = startNextRegionalHand(state);
    expect(next.dealer).toBe(1);
    expect(next.handNumber).toBe(1);
    expect(next.players.map((player) => player.score)).toEqual([1024, 976, 1000, 1000]);

    state.result = { kind: 'win', winners: [0] };
    expect(startNextRegionalHand(state).dealer).toBe(0);
  });

  it('replays a seeded regional decision sequence from structured actions', () => {
    let state = createRegionalGame({ ruleset: 'taiwan', seed: 31 });
    state = drawRegionalTile(state);
    const discarded = state.players[0].hand[0];
    state = discardRegionalTile(state, 0, discarded);
    const replayed = replayRegionalActions(state);
    expect(replayed.phase).toBe(state.phase);
    expect(replayed.players.map((player) => player.hand)).toEqual(state.players.map((player) => player.hand));
    expect(replayed.players.map((player) => player.discards)).toEqual(state.players.map((player) => player.discards));
    expect(replayed.actions).toEqual(state.actions);
  });

  it('marks flower pigs and ready seats on a Sichuan wall draw', () => {
    const state = createRegionalGame({ ruleset: 'sichuan', seed: 1 });
    state.phase = 'draw';
    state.wallIndex = state.replacementIndex + 1;
    state.players[0].voidSuit = 's';
    state.players[0].hand = ['s1', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'p1', 'p2', 'p3'];
    state.players[1].voidSuit = 's';
    state.players[1].hand = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'p1', 'p2', 'p3', 'p4'];
    const drawn = drawRegionalTile(state);
    expect(drawn.result?.flowerPigSeats).toContain(0);
    expect(drawn.result?.readySeats).toEqual([]); // 查花猪优先，不能再查叫
    expect(regionalWaitingTiles(state, 1)).toContain('p4');
  });

  it('uses public discards and exposed sets for defensive risk', () => {
    const state = createRegionalGame({ ruleset: 'taiwan', seed: 1 });
    state.players[1].discards = ['m1'];
    expect(regionalDiscardRisk(state, 0, 'm1')).toBe('low');
    state.players[1].discards = [];
    state.players[1].melds = [
      { kind: 'pon', tiles: ['m1', 'm1', 'm1'] },
      { kind: 'pon', tiles: ['p2', 'p2', 'p2'] }
    ];
    expect(regionalDiscardRisk(state, 0, 'm1')).toBe('high');
  });
});
