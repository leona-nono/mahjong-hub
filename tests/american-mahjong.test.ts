import { describe, expect, it } from 'vitest';
import { AMERICAN_PRACTICE_SEASONS, AMERICAN_WALL, ORIGINAL_PRACTICE_CARDS, americanClosestLine, americanCoachAdvice, americanLineDistance, americanPublicThreat, rankAmericanLines, americanTileKeepValue, applyAmericanPass, canExchangeJoker, claimAmericanDiscard, claimAmericanMahJong, createAmericanGame, decideSecondCharleston, declareAmericanMahJong, evaluateOriginalPracticeHand, getPracticeCard, legalAmericanClaims, passAmericanClaims, playAmericanDiscard, practiceGroupCount, replayAmericanActions, resolveAmericanClaimPriority, withAmericanReplayAction } from '@/lib/mahjong/american';

const passTiles = (hand: string[]) => hand.filter((tile) => !tile.startsWith('j')).slice(0, 3);

describe('original American Mahjong practice engine', () => {
  it('uses a physical 152-tile wall with no fifth standard tile', () => { expect(AMERICAN_WALL).toHaveLength(152); expect(AMERICAN_WALL.filter((tile) => tile === 'm1')).toHaveLength(4); });
  it('keeps each original practice-card line versioned and 14 tiles long', () => {
    expect(ORIGINAL_PRACTICE_CARDS.length).toBeGreaterThanOrEqual(10);
    for (const card of ORIGINAL_PRACTICE_CARDS) expect(card.groups.reduce((total, group) => total + practiceGroupCount(group), 0)).toBe(14);
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
    const first = applyAmericanPass(game, passTiles(game.players[0].hand), 'right'); expect(first.players.map((player) => player.hand.length)).toEqual([13, 13, 13, 13]);
    const second = applyAmericanPass(first, passTiles(first.players[0].hand), 'across'); const third = applyAmericanPass(second, passTiles(second.players[0].hand), 'left');
    expect(third.phase).toBe('turn'); expect(third.players[0].hand).toHaveLength(14); expect(third.wall).toHaveLength(99);
  });
  it('offers an optional second Charleston before turn play', () => {
    let next = createAmericanGame(21); for (const direction of ['right', 'across', 'left'] as const) next = applyAmericanPass(next, passTiles(next.players[0].hand), direction);
    expect(next.phase).toBe('second-charleston-choice'); expect(decideSecondCharleston(next, false).phase).toBe('courtesy');
  });
  it('runs all four seats through a real rotation and returns control to the human', () => {
    let next = createAmericanGame(22, 'garden-ladder-v1', { secondCharleston: false, courtesyPass: false });
    for (const direction of ['right', 'across', 'left'] as const) next = applyAmericanPass(next, passTiles(next.players[0].hand), direction);
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
      for (const direction of ['right', 'across', 'left'] as const) next = applyAmericanPass(next, passTiles(next.players[0].hand), direction);
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
        game = applyAmericanPass(game, passTiles(game.players[0].hand), direction);
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

  it('measures how far a hand is from each line and ranks them', () => {
    const game = createAmericanGame(41);
    const nearlyGardenLadder = ['f1', 'f2', 'p2', 'p2', 'p2', 'p3', 'p3', 'p3', 'p4', 'p4', 'p4', 's5', 's5'];
    expect(americanLineDistance(getPracticeCard('garden-ladder-v1'), nearlyGardenLadder)).toBe(1);
    expect(americanClosestLine(game, nearlyGardenLadder).id).toBe('garden-ladder-v1');
    const ranked = rankAmericanLines(game, nearlyGardenLadder);
    expect(ranked).toHaveLength(game.activeCardIds.length);
    expect(ranked[0].distance).toBeLessThanOrEqual(ranked[1].distance);
  });

  it('counts a Joker towards a group that accepts one, but never towards a pair', () => {
    const withJoker = ['f1', 'f2', 'p2', 'p2', 'j1', 'p3', 'p3', 'p3', 'p4', 'p4', 'p4', 's5', 's5', 's5'];
    expect(americanLineDistance(getPracticeCard('garden-ladder-v1'), withJoker)).toBe(0);
    // Pair Parade is seven exact pairs, so a Joker fills nothing there.
    const pairsWithJoker = ['m1', 'm1', 'm3', 'm3', 'p2', 'p2', 'p4', 'p4', 's5', 's5', 'z1', 'z1', 'z5', 'j1'];
    expect(americanLineDistance(getPracticeCard('pair-parade-v1'), pairsWithJoker)).toBe(1);
  });

  it('declares a line other than the pinned one when the hand completes it', () => {
    const game = createAmericanGame(42, 'garden-ladder-v1');
    // Bamboo Bridge, while the pinned display card is still Garden Ladder.
    game.players[0].hand = ['f1', 'f2', 's1', 's1', 's1', 's3', 's3', 's3', 's5', 's5', 's5', 'p7', 'p7', 'p7'];
    const result = declareAmericanMahJong(game);
    expect(result.declared).toBe(true);
    expect(result.state.settlement?.points).toBe(getPracticeCard('bamboo-bridge-v1').points);
    expect(result.state.settlement?.reason).toContain('Bamboo Bridge');
  });

  it('lets a bot retarget as its hand changes', () => {
    const game = createAmericanGame(43);
    const towardsWinds = ['f1', 'f2', 'z1', 'z1', 'z1', 'z2', 'z2', 'z2', 'z3', 'z3', 'z4', 'z4', 'm9'];
    expect(americanClosestLine(game, towardsWinds).id).toBe('four-winds-v1');
    const towardsDragons = ['f1', 'f2', 'z5', 'z5', 'z5', 'z6', 'z6', 'z6', 'z7', 'z7', 'p5', 'p5', 'm9'];
    expect(americanClosestLine(game, towardsDragons).id).toBe('dragon-garden-v1');
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
  it('evaluates original colour relationships and long groups in the card DSL', () => {
    const relay = ['f1', 'f2', 'z5', 'm3', 'm3', 'm3', 'p6', 'p6', 'p6', 'p6', 'm9', 'm9', 'm9', 'm9'];
    const ribbon = ['f1', 'f2', 'z7', 'm5', 'm5', 'm5', 'm5', 'm5', 'p7', 'p7', 'p7', 'p7', 'p7', 'p7'];
    expect(evaluateOriginalPracticeHand(getPracticeCard('colour-relay-v1'), relay).valid).toBe(true);
    expect(evaluateOriginalPracticeHand(getPracticeCard('long-ribbon-v1'), ribbon).valid).toBe(true);
  });
  it('covers original Kong, Quint and Sextet structures with suit relations', () => {
    const kongGarden = ['f1', 'f2', 'z6', 'm2', 'm2', 'm2', 'm2', 'p8', 'p8', 'p8', 'p8', 'z5', 'z5', 'z5'];
    const kongWithSameColourB = ['f1', 'f2', 'z6', 'm2', 'm2', 'm2', 'm2', 'm8', 'm8', 'm8', 'm8', 'z5', 'z5', 'z5'];
    const quintCrossroads = ['f1', 'f2', 'm4', 'm4', 'm4', 'm4', 'm4', 'm8', 'm8', 'm8', 'm8', 'z5', 'z5', 'z5'];
    const sextetHorizon = ['f1', 'f2', 'm6', 'm6', 'm6', 'm6', 'm6', 'm6', 'p9', 'p9', 'p9', 'z7', 'z7', 'z7'];
    expect(evaluateOriginalPracticeHand(getPracticeCard('kong-garden-v1'), kongGarden).valid).toBe(true);
    expect(evaluateOriginalPracticeHand(getPracticeCard('kong-garden-v1'), kongWithSameColourB).valid).toBe(false);
    expect(evaluateOriginalPracticeHand(getPracticeCard('quint-crossroads-v1'), quintCrossroads).valid).toBe(true);
    expect(evaluateOriginalPracticeHand(getPracticeCard('sextet-horizon-v1'), sextetHorizon).valid).toBe(true);
  });
  it('replays a structured human action sequence from its original seed', () => {
    let game = createAmericanGame(90210, 'garden-ladder-v1', { secondCharleston: false, courtesyPass: false });
    for (const direction of ['right', 'across', 'left'] as const) {
      const tiles = passTiles(game.players[0].hand);
      game = withAmericanReplayAction(applyAmericanPass(game, tiles, direction), { type: 'pass', tiles, direction });
    }
    const tile = game.players[0].hand[0];
    game = withAmericanReplayAction(playAmericanDiscard(game, tile), { type: 'discard', tile });
    const replayed = replayAmericanActions(game);
    const { actions: _replayedActions, ...replayedCore } = replayed;
    const { actions: _submittedActions, ...submittedCore } = game;
    expect(replayedCore).toEqual(submittedCore);
  });
  it('gives transparent coach advice without passing a Joker', () => {
    const game = createAmericanGame(16);
    game.players[0].hand = ['j1', 'f1', 'f2', 'p2', 'p2', 'p3', 'p3', 'p4', 'm9', 's9', 'z1', 'm1', 'm2'];
    const advice = americanCoachAdvice(game);
    expect(advice.rankings).toHaveLength(3);
    expect(advice.keep).toContain('j1');
    expect(advice.pass).not.toContain('j1');
    expect(advice.pass).toHaveLength(3);
    expect(advice.outs.length).toBeGreaterThan(0);
  });
  it('rates defensive risk from public exposures and repeated discards only', () => {
    const game = createAmericanGame(71);
    game.players[1].melds.push({ kind: 'pung', tile: 'p2', tiles: ['p2', 'p2', 'p2'], exposed: true, jokerIndexes: [] });
    game.history.push('Seat 1 called pung on p2.');
    game.players[2].discards.push('m9'); game.players[3].discards.push('m9');
    expect(americanPublicThreat(game, 0, 'p2')).toEqual({ score: 4, reason: 'recent-call' });
    expect(americanPublicThreat(game, 0, 'm9')).toEqual({ score: 0, reason: 'seen-safe' });
  });
  it('never permits a Joker to leave a hand during Charleston or Courtesy', () => {
    const game = createAmericanGame(18, 'garden-ladder-v1', { secondCharleston: false, courtesyPass: false });
    game.players[0].hand = ['j1', ...game.players[0].hand.slice(1)];
    expect(() => applyAmericanPass(game, ['j1', ...game.players[0].hand.slice(1, 3)], 'right')).toThrow(/Jokers may not be passed/);
  });
  it('pins each hand to a product-owned seasonal card manifest', () => {
    const game = createAmericanGame(7, 'garden-ladder-v1', {}, 'harvest-2026');
    expect(game.seasonId).toBe('harvest-2026');
    expect(game.activeCardIds).toEqual(AMERICAN_PRACTICE_SEASONS.find((season) => season.id === 'harvest-2026')!.cardIds);
    expect(game.cardId).toBe('harvest-lanterns-v1');
  });
  it('rejects a matching discard when no active original card permits that exposed group', () => {
    const game = createAmericanGame(5, 'garden-ladder-v1', { secondCharleston: false, courtesyPass: false });
    game.activeCardIds = ['garden-ladder-v1'];
    game.phase = 'claim';
    game.lastDiscard = { seat: 1, tile: 'm9' };
    game.players[0].hand = ['m9', 'm9', 'm9', ...game.players[0].hand.slice(3)];
    // Three matching naturals are physically enough for Pung/Kong, but m9 is
    // not an exposable group on any of the product-owned practice lines.
    expect(legalAmericanClaims(game)).not.toContain('pung');
    expect(legalAmericanClaims(game)).not.toContain('kong');
  });
  it('rejects a Joker exposure where the selected card group forbids Jokers', () => {
    const game = createAmericanGame(6, 'pair-parade-v1', { secondCharleston: false, courtesyPass: false });
    game.activeCardIds = ['pair-parade-v1'];
    game.phase = 'claim';
    game.lastDiscard = { seat: 1, tile: 'm1' };
    game.players[0].hand = ['m1', 'j1', ...game.players[0].hand.slice(2)];
    // Pair Parade has only pairs: a Pung is invalid even though the Joker can
    // make a matching physical set.
    expect(legalAmericanClaims(game)).not.toContain('pung');
  });
  it('does not permit an exposure against a locked concealed practice card', () => {
    const game = createAmericanGame(8, 'quiet-garden-v1', { secondCharleston: false, courtesyPass: false }, 'harvest-2026');
    game.phase = 'claim'; game.lastDiscard = { seat: 1, tile: 'm1' };
    game.players[0].hand = ['m1', 'm1', ...game.players[0].hand.slice(2)];
    expect(legalAmericanClaims(game)).not.toContain('pung');
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
