import { describe, expect, it } from 'vitest';
import { AMERICAN_WALL, ORIGINAL_PRACTICE_CARDS, americanTileKeepValue, applyAmericanPass, canExchangeJoker, claimAmericanDiscard, claimAmericanMahJong, createAmericanGame, decideSecondCharleston, declareAmericanMahJong, evaluateOriginalPracticeHand, getPracticeCard, legalAmericanClaims, passAmericanClaims, playAmericanDiscard, resolveAmericanClaimPriority } from '@/lib/mahjong/american';

describe('original American Mahjong practice engine', () => {
  it('uses a physical 152-tile wall with no fifth standard tile', () => { expect(AMERICAN_WALL).toHaveLength(152); expect(AMERICAN_WALL.filter((tile) => tile === 'm1')).toHaveLength(4); });
  it('keeps each original practice-card line versioned and 14 tiles long', () => {
    expect(ORIGINAL_PRACTICE_CARDS).toHaveLength(7);
    for (const card of ORIGINAL_PRACTICE_CARDS) expect(card.groups.reduce((total, group) => total + group.count, 0)).toBe(14);
  });
  it('makes the deterministic practice AI retain targets and Jokers over unrelated tiles', () => {
    const card = getPracticeCard('garden-ladder-v1');
    const hand = ['p2', 'm9', 'j1'];
    expect(americanTileKeepValue('p2', hand, card)).toBeGreaterThan(americanTileKeepValue('m9', hand, card));
    expect(americanTileKeepValue('j1', hand, card)).toBeGreaterThan(americanTileKeepValue('p2', hand, card));
  });
  it('accepts a complete Garden Ladder only with legal Jokers', () => {
    const complete = ['f1', 'f2', 'p2', 'p2', 'j1', 'p3', 'p3', 'j2', 'p4', 'p4', 'p4', 's5', 's5', 's5'];
    expect(evaluateOriginalPracticeHand(getPracticeCard('garden-ladder-v1'), complete).valid).toBe(true);
    expect(evaluateOriginalPracticeHand(getPracticeCard('garden-ladder-v1'), [...complete.slice(0, 1), 'j3', ...complete.slice(2)]).valid).toBe(false);
  });
  it('moves four actual hands simultaneously through each Charleston pass', () => {
    const game = createAmericanGame(17, 'garden-ladder-v1', { secondCharleston: false, courtesyPass: false });
    const first = applyAmericanPass(game, game.players[0].hand.slice(0, 3), 'right'); expect(first.players.map((player) => player.hand.length)).toEqual([13, 13, 13, 13]);
    const second = applyAmericanPass(first, first.players[0].hand.slice(0, 3), 'across'); const third = applyAmericanPass(second, second.players[0].hand.slice(0, 3), 'left');
    expect(third.phase).toBe('turn'); expect(third.players[0].hand).toHaveLength(14); expect(third.wall).toHaveLength(99);
  });
  it('offers an optional second Charleston before turn play', () => {
    let next = createAmericanGame(21); for (const direction of ['right', 'across', 'left'] as const) next = applyAmericanPass(next, next.players[0].hand.slice(0, 3), direction);
    expect(next.phase).toBe('second-charleston-choice'); expect(decideSecondCharleston(next, false).phase).toBe('courtesy');
  });
  it('runs all four seats through a real rotation and returns control to the human', () => {
    let next = createAmericanGame(22, 'garden-ladder-v1', { secondCharleston: false, courtesyPass: false });
    for (const direction of ['right', 'across', 'left'] as const) next = applyAmericanPass(next, next.players[0].hand.slice(0, 3), direction);
    const after = playAmericanDiscard(next, next.players[0].hand[0]);

    // Control comes back on the human's own turn, so every bot has acted.
    expect(after.phase).toBe('turn');
    expect(after.currentSeat).toBe(0);
    expect(after.players.map((player) => player.discards.length)).toEqual([1, 1, 1, 1]);
    expect(after.players[0].hand).toHaveLength(14);
    expect(declareAmericanMahJong(after).declared).toBe(false);
  });

  it('only stops on a claim window the human can actually answer', () => {
    for (const seed of [22, 23, 24, 25, 26]) {
      let next = createAmericanGame(seed, 'garden-ladder-v1', { secondCharleston: false, courtesyPass: false });
      for (const direction of ['right', 'across', 'left'] as const) next = applyAmericanPass(next, next.players[0].hand.slice(0, 3), direction);
      const after = playAmericanDiscard(next, next.players[0].hand[0]);
      if (after.phase === 'claim') expect(legalAmericanClaims(after, 0).length).toBeGreaterThan(0);
      else if (after.phase === 'turn') expect(after.currentSeat).toBe(0);
      else expect(after.phase).toBe('ended');
    }
  });

  it('lets a bot draw its winning tile and declare Mah Jongg', () => {
    const game = createAmericanGame(31, 'garden-ladder-v1', { secondCharleston: false, courtesyPass: false });
    game.phase = 'turn';
    game.currentSeat = 0;
    game.players[0].hand = ['m1', 'z1', 'z1', 'z2', 'z2', 'z3', 'z3', 'z4', 'z4', 'm9', 'm9', 'm8', 'm8', 'm7'];
    // One tile short of Garden Ladder, and the next wall tile completes it.
    game.players[1].hand = ['f1', 'f2', 'p2', 'p2', 'p2', 'p3', 'p3', 'p3', 'p4', 'p4', 'p4', 's5', 's5'];
    game.players[2].hand = ['z1', 'z2', 'z3', 'z4', 'm9', 'm8', 'm7', 'm6', 'm5', 'm4', 'm3', 'm2', 's9'];
    game.players[3].hand = ['s8', 's7', 's6', 's4', 's3', 's2', 's1', 'p9', 'p8', 'p7', 'p6', 'p5', 'p1'];
    game.wall = ['s5', 'p9', 'p8', 'p7', 'p6'];

    const next = playAmericanDiscard(game, 'm1');
    expect(next.phase).toBe('ended');
    expect(next.endReason).toBe('mah-jongg');
    expect(next.settlement?.winner).toBe(1);
    expect(next.players[1].score).toBe(getPracticeCard('garden-ladder-v1').points);
    expect(next.players[0].score).toBeLessThan(0);
  });

  it('lets a bot call a pung the card actually uses, without spending a Joker', () => {
    const game = createAmericanGame(32, 'garden-ladder-v1', { secondCharleston: false, courtesyPass: false });
    game.phase = 'turn';
    game.currentSeat = 0;
    game.players[0].hand = ['p2', 'z1', 'z1', 'z2', 'z2', 'z3', 'z3', 'z4', 'z4', 'm9', 'm9', 'm8', 'm8', 'm7'];
    game.players[1].hand = ['p2', 'p2', 'f1', 'f2', 'p3', 'p3', 'p4', 'p4', 's5', 's5', 'm1', 'm2', 'm3'];
    game.players[2].hand = ['s9', 's8', 's7', 's6', 's4', 's3', 's2', 's1', 'p9', 'p8', 'p7', 'p6', 'p5'];
    // Seat 3 could only complete the group with a Joker, so it must not call.
    game.players[3].hand = ['j1', 'j2', 'p2', 'm4', 'm5', 'm6', 'm7', 'p1', 'z1', 'z2', 'z3', 'z4', 's9'];
    game.wall = ['m5', 'm6', 'm7', 'p9', 'p8', 'p7', 'p6', 'p5'];

    const next = playAmericanDiscard(game, 'p2');
    expect(next.players[1].melds[0]?.kind).toBe('pung');
    expect(next.players[1].melds[0]?.tiles).toEqual(['p2', 'p2', 'p2']);
    expect(next.players[3].melds).toHaveLength(0);
  });

  it('ends the hand as a wall game when the last tile is drawn', () => {
    const game = createAmericanGame(33, 'garden-ladder-v1', { secondCharleston: false, courtesyPass: false });
    game.phase = 'turn';
    game.currentSeat = 0;
    game.players[0].hand = ['m1', 'z1', 'z1', 'z2', 'z2', 'z3', 'z3', 'z4', 'z4', 'm9', 'm9', 'm8', 'm8', 'm7'];
    game.players[1].hand = ['s9', 's8', 's7', 's6', 's4', 's3', 's2', 's1', 'p9', 'p8', 'p7', 'p6', 'p5'];
    game.players[2].hand = ['m2', 'm3', 'm4', 'm5', 'm6', 'p1', 'p3', 'p4', 's5', 'f1', 'f2', 'f3', 'f4'];
    game.players[3].hand = ['z1', 'z2', 'z3', 'z4', 'm9', 'm8', 'm7', 'm6', 'm5', 'm4', 'm3', 'm2', 's9'];
    game.wall = [];

    const next = playAmericanDiscard(game, 'm1');
    expect(next.phase).toBe('ended');
    expect(next.endReason).toBe('wall-exhausted');
    expect(next.settlement).toBeUndefined();
  });
  it('drives seeded hands to a real ending without stalling, with bots exposing groups', () => {
    let exposures = 0;
    let ended = 0;
    for (let seed = 1; seed <= 40; seed += 1) {
      let game = createAmericanGame(seed, 'garden-ladder-v1', { secondCharleston: false, courtesyPass: false });
      for (const direction of ['right', 'across', 'left'] as const) {
        game = applyAmericanPass(game, game.players[0].hand.slice(0, 3), direction);
      }
      // The stand-in for the player always discards its first tile; the point is
      // that the table keeps moving, not that this plays well.
      for (let step = 0; step < 400 && game.phase !== 'ended'; step += 1) {
        if (game.phase === 'claim') game = passAmericanClaims(game);
        else if (game.currentSeat === 0) game = playAmericanDiscard(game, game.players[0].hand[0]);
        else break;
      }
      expect(game.phase).toBe('ended');
      expect(['mah-jongg', 'wall-exhausted']).toContain(game.endReason);
      ended += 1;
      exposures += game.players.reduce((total, player) => total + player.melds.length, 0);
    }
    expect(ended).toBe(40);
    // Bots call on discards rather than only drawing and throwing.
    expect(exposures).toBeGreaterThan(0);
  });

  it('uses declaration > kong > pung, then turn order, for claims', () => {
    expect(resolveAmericanClaimPriority(1, [{ seat: 3, claim: 'pung' }, { seat: 2, claim: 'kong' }, { seat: 0, claim: 'mah-jongg' }])).toEqual({ seat: 0, claim: 'mah-jongg' });
    expect(resolveAmericanClaimPriority(1, [{ seat: 3, claim: 'pung' }, { seat: 2, claim: 'pung' }])).toEqual({ seat: 2, claim: 'pung' });
  });
  it('allows a legal pung, and limits Joker exchange to matching exposed groups', () => {
    const game = createAmericanGame(3, 'garden-ladder-v1', { secondCharleston: false, courtesyPass: false });
    game.phase = 'claim'; game.lastDiscard = { seat: 1, tile: 'p2' }; game.players[0].hand = ['p2', 'j1', ...game.players[0].hand.slice(2)];
    expect(legalAmericanClaims(game)).toContain('pung');
    const called = claimAmericanDiscard(game, 0, 'pung');
    expect(called.players[0].melds[0].kind).toBe('pung');
    expect(canExchangeJoker(called.players[0].melds[0], 'p2')).toBe(true);
  });
  it('settles a legal discard Mah Jongg and stores a public result', () => {
    const game = createAmericanGame(4); game.phase = 'claim'; game.lastDiscard = { seat: 1, tile: 's5' };
    game.players[0].hand = ['f1', 'f2', 'p2', 'p2', 'p2', 'p3', 'p3', 'p3', 'p4', 'p4', 'p4', 's5', 's5'];
    expect(legalAmericanClaims(game)).toContain('mah-jongg');
    const result = claimAmericanMahJong(game);
    expect(result.declared).toBe(true);
    expect(result.state.settlement?.points).toBe(20);
    expect(result.state.phase).toBe('ended');
  });
});
