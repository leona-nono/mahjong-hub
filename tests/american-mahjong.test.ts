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
  it('keeps every turn physical through human and bot draw/discard actions', () => {
    let next = createAmericanGame(22, 'garden-ladder-v1', { secondCharleston: false, courtesyPass: false });
    for (const direction of ['right', 'across', 'left'] as const) next = applyAmericanPass(next, next.players[0].hand.slice(0, 3), direction);
    const claimWindow = playAmericanDiscard(next, next.players[0].hand[0]);
    expect(claimWindow.phase).toBe('claim');
    const after = passAmericanClaims(claimWindow);
    expect(after.players.map((player) => player.hand.length)).toEqual([14, 13, 13, 13]);
    expect(after.players.map((player) => player.discards.length)).toEqual([1, 1, 1, 1]);
    expect(after.wall).toHaveLength(95);
    expect(declareAmericanMahJong(after).declared).toBe(false);
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
