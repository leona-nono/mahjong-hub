import { describe, expect, it } from 'vitest';

import {
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
  CLAIM_TIMEOUT_MS,
  createGame,
  declareConcealedKan,
  declareTsumo,
  discard,
  drawTile,
  passUnansweredClaims,
  seatShanten,
  submitClaim,
  tilesRemaining,
  RULESETS,
  type GameState,
  type Ruleset,
  type Seat
} from '@/lib/mahjong/engine';
import { chooseClaim, chooseMove } from '@/lib/mahjong/ai';

const hand = (spec: string): Tile[] => spec.split(' ') as Tile[];

describe('tiles', () => {
  it('builds a 136 tile wall with four copies of each kind', () => {
    const wall = buildWall();
    expect(wall).toHaveLength(136);
    const counts = toCounts(wall);
    expect(counts.every((c) => c === 4)).toBe(true);
  });

  it('round-trips tile ids through their index', () => {
    for (let i = 0; i < 34; i += 1) {
      expect(tileIndex(tileFromIndex(i))).toBe(i);
    }
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
    // z4 completes four concealed triplets (a limit hand) — the engine must
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
    expect(resolved.result?.score?.total).toBe(13);
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

  it('scores a double ron under riichi but a single winner under HK / CO', () => {
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
    expect(riichiResolved.result?.winners).toHaveLength(2);
    expect(riichiResolved.result?.winners?.map((w) => w.seat)).toEqual([0, 2]);
    expect(riichiResolved.result?.winners?.[0]?.loser).toBe(1);
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
    // Drives the whole loop — including claim windows — so the turn flow after
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
