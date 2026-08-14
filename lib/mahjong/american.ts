/** Deterministic rules for Mahjong Hub original American practice cards. No NMJL card material. */
export type AmericanTile = string;
export type AmericanSeat = 0 | 1 | 2 | 3;
export type AmericanPassDirection = 'right' | 'across' | 'left';
export type AmericanPhase = 'charleston' | 'second-charleston-choice' | 'courtesy' | 'turn' | 'claim' | 'ended';

const FACES = [...['m', 'p', 's'].flatMap((suit) => Array.from({ length: 9 }, (_, index) => suit + (index + 1))), ...Array.from({ length: 7 }, (_, index) => 'z' + (index + 1))];
export const AMERICAN_WALL = [...FACES.flatMap((tile) => [tile, tile, tile, tile]), ...Array.from({ length: 8 }, (_, index) => 'f' + (index + 1)), ...Array.from({ length: 8 }, (_, index) => 'j' + (index + 1))] as AmericanTile[];

export type PracticeGroup = { face: string; count: number; jokerAllowed?: boolean; label: string };
export type OriginalPracticeCard = { id: string; version: string; title: string; difficulty: 'beginner' | 'intermediate' | 'advanced'; points: number; description: string; groups: PracticeGroup[] };
/** Product-owned, versioned lines. Release a new id/version instead of mutating a released card. */
export const ORIGINAL_PRACTICE_CARDS: OriginalPracticeCard[] = [
  { id: 'garden-ladder-v1', version: '1.0.0', title: 'Garden Ladder', difficulty: 'beginner', points: 20, description: 'Two flowers plus 222 / 333 / 444 dots and 555 bams.', groups: [{ face: 'flower', count: 2, label: 'any 2 flowers' }, { face: 'p2', count: 3, jokerAllowed: true, label: '222 dots' }, { face: 'p3', count: 3, jokerAllowed: true, label: '333 dots' }, { face: 'p4', count: 3, jokerAllowed: true, label: '444 dots' }, { face: 's5', count: 3, jokerAllowed: true, label: '555 bams' }] },
  { id: 'bamboo-bridge-v1', version: '1.0.0', title: 'Bamboo Bridge', difficulty: 'intermediate', points: 30, description: 'Two flowers plus 111 / 333 / 555 bams and 777 dots.', groups: [{ face: 'flower', count: 2, label: 'any 2 flowers' }, { face: 's1', count: 3, jokerAllowed: true, label: '111 bams' }, { face: 's3', count: 3, jokerAllowed: true, label: '333 bams' }, { face: 's5', count: 3, jokerAllowed: true, label: '555 bams' }, { face: 'p7', count: 3, jokerAllowed: true, label: '777 dots' }] },
  { id: 'four-winds-v1', version: '1.0.0', title: 'Four Winds', difficulty: 'advanced', points: 45, description: 'Two flowers plus a pung of each wind.', groups: [{ face: 'flower', count: 2, label: 'any 2 flowers' }, { face: 'z1', count: 3, jokerAllowed: true, label: 'East pung' }, { face: 'z2', count: 3, jokerAllowed: true, label: 'South pung' }, { face: 'z3', count: 3, jokerAllowed: true, label: 'West pung' }, { face: 'z4', count: 3, jokerAllowed: true, label: 'North pung' }] },
  { id: 'pair-parade-v1', version: '1.0.0', title: 'Pair Parade', difficulty: 'advanced', points: 50, description: 'Seven exact pairs; Jokers are not legal in pairs.', groups: [{ face: 'm1', count: 2, label: '11 characters' }, { face: 'm3', count: 2, label: '33 characters' }, { face: 'p2', count: 2, label: '22 dots' }, { face: 'p4', count: 2, label: '44 dots' }, { face: 's5', count: 2, label: '55 bams' }, { face: 'z1', count: 2, label: 'East pair' }, { face: 'z5', count: 2, label: 'Red pair' }] },
  { id: 'dragon-garden-v1', version: '1.0.0', title: 'Dragon Garden', difficulty: 'intermediate', points: 35, description: 'Two flowers, three Dragon pungs and a 555 dots pung.', groups: [{ face: 'flower', count: 2, label: 'any 2 flowers' }, { face: 'z5', count: 3, jokerAllowed: true, label: 'Red Dragon pung' }, { face: 'z6', count: 3, jokerAllowed: true, label: 'Green Dragon pung' }, { face: 'z7', count: 3, jokerAllowed: true, label: 'White Dragon pung' }, { face: 'p5', count: 3, jokerAllowed: true, label: '555 dots' }] },
  { id: 'terminal-garden-v1', version: '1.0.0', title: 'Terminal Garden', difficulty: 'advanced', points: 40, description: 'Two flowers plus 111 and 999 pungs in Characters and Bams.', groups: [{ face: 'flower', count: 2, label: 'any 2 flowers' }, { face: 'm1', count: 3, jokerAllowed: true, label: '111 characters' }, { face: 'm9', count: 3, jokerAllowed: true, label: '999 characters' }, { face: 's1', count: 3, jokerAllowed: true, label: '111 bams' }, { face: 's9', count: 3, jokerAllowed: true, label: '999 bams' }] },
  { id: 'windmill-v1', version: '1.0.0', title: 'Windmill', difficulty: 'beginner', points: 25, description: 'Two flowers, a Wind pung and four number pungs around 4 and 6.', groups: [{ face: 'flower', count: 2, label: 'any 2 flowers' }, { face: 'z1', count: 3, jokerAllowed: true, label: 'East pung' }, { face: 'm4', count: 3, jokerAllowed: true, label: '444 characters' }, { face: 'p6', count: 3, jokerAllowed: true, label: '666 dots' }, { face: 's4', count: 3, jokerAllowed: true, label: '444 bams' }] },
];

export type AmericanOptions = { secondCharleston: boolean; courtesyPass: boolean };
export type AmericanMeld = { kind: 'pung' | 'kong'; tile: string; tiles: string[]; exposed: boolean; jokerIndexes: number[] };
export type AmericanPlayer = { seat: AmericanSeat; hand: AmericanTile[]; discards: AmericanTile[]; melds: AmericanMeld[]; score: number };
export type AmericanClaim = 'mah-jongg' | 'kong' | 'pung';
export type AmericanSettlement = { winner: AmericanSeat; points: number; transfers: number[]; reason: string };
export type AmericanGameState = {
  cardId: string; options: AmericanOptions; players: AmericanPlayer[]; wall: AmericanTile[];
  phase: AmericanPhase; passIndex: number; charlestonRound: 1 | 2; currentSeat: AmericanSeat; seed: number;
  lastDiscard?: { tile: AmericanTile; seat: AmericanSeat }; settlement?: AmericanSettlement; history: string[];
};
function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function target(seat: AmericanSeat, direction: AmericanPassDirection) { return ((seat + (direction === 'right' ? 1 : direction === 'left' ? 3 : 2)) % 4) as AmericanSeat; }
const joker = (tile: string) => tile.startsWith('j');
const flower = (tile: string) => tile.startsWith('f');

export function shuffleAmericanWall(seed: number) {
  const result = [...AMERICAN_WALL]; let state = seed >>> 0;
  for (let index = result.length - 1; index > 0; index -= 1) { state = (state * 1664525 + 1013904223) >>> 0; const swap = state % (index + 1); [result[index], result[swap]] = [result[swap], result[index]]; }
  return result;
}
export function getPracticeCard(cardId: string) { const card = ORIGINAL_PRACTICE_CARDS.find((item) => item.id === cardId); if (!card) throw new Error('Unknown original practice card: ' + cardId); return card; }
export function createAmericanGame(seed = 20260813, cardId = 'garden-ladder-v1', options: Partial<AmericanOptions> = {}): AmericanGameState {
  getPracticeCard(cardId); const shuffled = shuffleAmericanWall(seed);
  return { cardId, options: { secondCharleston: options.secondCharleston ?? true, courtesyPass: options.courtesyPass ?? true }, players: ([0, 1, 2, 3] as AmericanSeat[]).map((seat) => ({ seat, hand: shuffled.slice(seat * 13, seat * 13 + 13), discards: [], melds: [], score: 0 })), wall: shuffled.slice(52), phase: 'charleston', passIndex: 0, charlestonRound: 1, currentSeat: 0, seed, history: ['Hand started.'] };
}
export type CardEvaluation = { valid: boolean; missing: string[]; illegalJokers: number; matchedGroups: number; message: string };
export function evaluateOriginalPracticeHand(card: OriginalPracticeCard, tiles: AmericanTile[]): CardEvaluation {
  const expected = card.groups.reduce((total, group) => total + group.count, 0);
  if (tiles.length !== expected) return { valid: false, missing: ['Hand must contain ' + expected + ' tiles.'], illegalJokers: 0, matchedGroups: 0, message: 'Incorrect hand size.' };
  const counts = new Map<string, number>(); tiles.filter((tile) => !joker(tile)).forEach((tile) => counts.set(tile, (counts.get(tile) ?? 0) + 1));
  let jokers = tiles.filter(joker).length; let illegalJokers = 0; let matchedGroups = 0; const missing: string[] = []; const allowed = new Set(card.groups.map((group) => group.face));
  for (const tile of tiles.filter((tile) => !joker(tile))) if (flower(tile) ? !allowed.has('flower') : !allowed.has(tile)) missing.push(tile + ' is not used by this card line');
  for (const group of card.groups) {
    const actual = group.face === 'flower' ? tiles.filter(flower).length : (counts.get(group.face) ?? 0); const deficit = Math.max(0, group.count - actual);
    if (actual > group.count) missing.push(group.label + ' has too many tiles');
    if (deficit && !group.jokerAllowed) { illegalJokers += Math.min(deficit, jokers); missing.push(group.label + ' cannot use a Joker'); continue; }
    if (deficit > jokers) missing.push(group.label + ' is short ' + (deficit - jokers)); else { jokers -= deficit; matchedGroups += 1; }
    if (!deficit) matchedGroups += 1;
  }
  if (jokers) { illegalJokers += jokers; missing.push('Unused Joker is not legal in this card line'); }
  const valid = missing.length === 0 && illegalJokers === 0;
  return { valid, missing, illegalJokers, matchedGroups, message: valid ? card.title + ' complete for ' + card.points + ' points.' : missing[0] ?? 'Hand does not match this card.' };
}
/** Deterministic practice AI: preserve card targets, duplicates and Jokers. */
export function americanTileKeepValue(tile: AmericanTile, hand: AmericanTile[], card: OriginalPracticeCard): number {
  if (joker(tile)) return 100;
  const face = flower(tile) ? 'flower' : tile;
  const group = card.groups.find((item) => item.face === face);
  if (!group) return 0;
  const copies = face === 'flower' ? hand.filter(flower).length : hand.filter((item) => item === tile).length;
  const need = Math.max(0, group.count - copies);
  // A target tile is valuable, but an over-supplied natural is a sensible
  // Charleston/pass candidate before a scarce target or a Joker.
  return 20 + Math.min(copies, group.count) * 4 + (need > 0 ? 8 : 0) + (group.jokerAllowed ? 1 : 4);
}
function botPass(hand: AmericanTile[], card: OriginalPracticeCard, count: number) {
  return [...hand].sort((a, b) => americanTileKeepValue(a, hand, card) - americanTileKeepValue(b, hand, card) || a.localeCompare(b)).slice(0, count);
}
/** A genuine simultaneous four-player exchange. */
export function applyAmericanPass(state: AmericanGameState, humanTiles: AmericanTile[], direction: AmericanPassDirection): AmericanGameState {
  if (state.phase !== 'charleston' && state.phase !== 'courtesy') throw new Error('No pass is currently available.');
  const count = state.phase === 'courtesy' ? humanTiles.length : 3;
  if (state.phase === 'charleston' && humanTiles.length !== 3) throw new Error('Charleston requires exactly three tiles.');
  if (count > 3) throw new Error('A Courtesy Pass may contain at most three tiles.');
  const next = clone(state); const card = getPracticeCard(state.cardId); const outgoing = state.players.map((player) => player.seat === 0 ? [...humanTiles] : botPass(player.hand, card, count));
  outgoing.forEach((tiles, seat) => { const removal = [...tiles]; next.players[seat].hand = next.players[seat].hand.filter((tile) => { const at = removal.indexOf(tile); if (at < 0) return true; removal.splice(at, 1); return false; }); if (removal.length) throw new Error('Seat ' + seat + ' lacks a selected passing tile.'); });
  outgoing.forEach((tiles, seat) => next.players[target(seat as AmericanSeat, direction)].hand.push(...tiles));
  if (state.phase === 'courtesy') { next.phase = 'turn'; next.players[0].hand.push(next.wall.shift()!); return next; }
  next.passIndex += 1;
  if (next.passIndex < 3) return next;
  if (state.charlestonRound === 1 && state.options.secondCharleston) { next.phase = 'second-charleston-choice'; return next; }
  if (state.options.courtesyPass) { next.phase = 'courtesy'; return next; }
  next.phase = 'turn'; next.players[0].hand.push(next.wall.shift()!); return next;
}
export function decideSecondCharleston(state: AmericanGameState, playSecond: boolean) {
  if (state.phase !== 'second-charleston-choice') throw new Error('Second Charleston decision is not available.');
  const next = clone(state); if (playSecond) { next.phase = 'charleston'; next.passIndex = 0; next.charlestonRound = 2; return next; }
  next.phase = next.options.courtesyPass ? 'courtesy' : 'turn'; if (next.phase === 'turn') next.players[0].hand.push(next.wall.shift()!); return next;
}
export function canExchangeJoker(meld: AmericanMeld, replacement: AmericanTile) { return meld.exposed && meld.jokerIndexes.length > 0 && replacement === meld.tile && !joker(replacement); }

function fullTiles(player: AmericanPlayer) { return [...player.hand, ...player.melds.flatMap((meld) => meld.tiles)]; }
function claimTiles(hand: AmericanTile[], tile: string, count: number) {
  const exact = hand.filter((item) => item === tile);
  const jokers = hand.filter(joker);
  if (exact.length + jokers.length < count) return null;
  return [...exact.slice(0, Math.min(count, exact.length)), ...jokers.slice(0, Math.max(0, count - exact.length))];
}
function removeFaces(hand: AmericanTile[], faces: AmericanTile[]) {
  const remove = [...faces];
  return hand.filter((tile) => { const at = remove.indexOf(tile); if (at < 0) return true; remove.splice(at, 1); return false; });
}
export function legalAmericanClaims(state: AmericanGameState, seat: AmericanSeat = 0): AmericanClaim[] {
  if (state.phase !== 'claim' || !state.lastDiscard || seat === state.lastDiscard.seat) return [];
  const player = state.players[seat]; const tile = state.lastDiscard.tile;
  const result: AmericanClaim[] = [];
  if (evaluateOriginalPracticeHand(getPracticeCard(state.cardId), [...fullTiles(player), tile]).valid) result.push('mah-jongg');
  if (claimTiles(player.hand, tile, 3)) result.push('kong');
  if (claimTiles(player.hand, tile, 2)) result.push('pung');
  return result;
}
/** Claim priority is declaration, kong, pung; same claim type resolves in turn order after the discarder. */
export function resolveAmericanClaimPriority(discarder: AmericanSeat, claims: { seat: AmericanSeat; claim: AmericanClaim }[]) {
  const weight: Record<AmericanClaim, number> = { 'mah-jongg': 3, kong: 2, pung: 1 };
  return [...claims].sort((a, b) => weight[b.claim] - weight[a.claim] || ((a.seat - discarder + 4) % 4) - ((b.seat - discarder + 4) % 4))[0];
}
export function claimAmericanDiscard(state: AmericanGameState, seat: AmericanSeat, claim: 'pung' | 'kong'): AmericanGameState {
  if (!legalAmericanClaims(state, seat).includes(claim) || !state.lastDiscard) throw new Error('That call is not legal.');
  const next = clone(state); const discarded = next.lastDiscard!; const player = next.players[seat]; const needed = claim === 'kong' ? 3 : 2;
  const faces = claimTiles(player.hand, discarded.tile, needed)!;
  player.hand = removeFaces(player.hand, faces);
  const source = next.players[discarded.seat]; source.discards.splice(source.discards.lastIndexOf(discarded.tile), 1);
  const meldTiles = [discarded.tile, ...faces]; const jokerIndexes = meldTiles.map((tile, index) => joker(tile) ? index : -1).filter((index) => index >= 0);
  player.melds.push({ kind: claim, tile: discarded.tile, tiles: meldTiles, exposed: true, jokerIndexes });
  next.phase = 'turn'; next.currentSeat = seat; next.lastDiscard = undefined; next.history.push('Seat ' + seat + ' called ' + claim + ' on ' + discarded.tile + '.');
  return next;
}
export function claimAmericanMahJong(state: AmericanGameState, seat: AmericanSeat = 0) {
  if (!state.lastDiscard || !legalAmericanClaims(state, seat).includes('mah-jongg')) throw new Error('Mah Jongg is not legal on this discard.');
  const next = clone(state); next.players[seat].hand.push(next.lastDiscard!.tile);
  const result = declareAmericanMahJong(next, seat);
  if (result.declared) result.state.history.push('Seat ' + seat + ' claimed Mah Jongg on seat ' + state.lastDiscard!.seat + ' discard.');
  return result;
}
export function exchangeAmericanJoker(state: AmericanGameState, claimant: AmericanSeat, owner: AmericanSeat, meldIndex: number, replacement: AmericanTile): AmericanGameState {
  const next = clone(state); const meld = next.players[owner].melds[meldIndex];
  if (!meld || !canExchangeJoker(meld, replacement)) throw new Error('This Joker exchange is not legal.');
  const handIndex = next.players[claimant].hand.indexOf(replacement);
  if (handIndex < 0) throw new Error('You must hold the matching tile to exchange this Joker.');
  const jokerIndex = meld.jokerIndexes[0]; const released = meld.tiles[jokerIndex];
  meld.tiles[jokerIndex] = replacement; meld.jokerIndexes.shift();
  next.players[claimant].hand.splice(handIndex, 1, released);
  next.history.push('Seat ' + claimant + ' exchanged ' + replacement + ' for an exposed Joker from seat ' + owner + '.');
  return next;
}

function botDiscard(hand: AmericanTile[], card: OriginalPracticeCard) {
  return [...hand].sort((a, b) => americanTileKeepValue(a, hand, card) - americanTileKeepValue(b, hand, card) || a.localeCompare(b))[0];
}

/** Completes a human discard plus deterministic bot draws/discards until East draws again. */
export function playAmericanDiscard(state: AmericanGameState, tile: AmericanTile): AmericanGameState {
  if (state.phase !== 'turn' || state.currentSeat !== 0) throw new Error('It is not the human discard turn.');
  const next = clone(state); const card = getPracticeCard(next.cardId);
  const remove = (seat: AmericanSeat, discarded: AmericanTile) => {
    const hand = next.players[seat].hand; const index = hand.indexOf(discarded);
    if (index < 0) throw new Error('That tile is not in the current hand.');
    hand.splice(index, 1); next.players[seat].discards.push(discarded);
  };
  remove(0, tile); next.history.push('You discarded ' + tile + '.');
  const botSeat: AmericanSeat = 1;
  const draw = next.wall.shift(); if (!draw) { next.phase = 'ended'; return next; }
  next.players[botSeat].hand.push(draw);
  const botTile = botDiscard(next.players[botSeat].hand, card); remove(botSeat, botTile);
  next.lastDiscard = { seat: botSeat, tile: botTile }; next.phase = 'claim';
  next.history.push('Seat 1 discarded ' + botTile + '. Claim window opened.');
  return next;
}

/** Pass the human claim window, then finish the other bots and draw for the human. */
export function passAmericanClaims(state: AmericanGameState): AmericanGameState {
  if (state.phase !== 'claim') throw new Error('No claim decision is pending.');
  const next = clone(state); const card = getPracticeCard(next.cardId);
  for (const seat of [2, 3] as AmericanSeat[]) {
    const draw = next.wall.shift(); if (!draw) { next.phase = 'ended'; return next; }
    next.players[seat].hand.push(draw);
    const discarded = botDiscard(next.players[seat].hand, card); next.players[seat].hand = removeFaces(next.players[seat].hand, [discarded]); next.players[seat].discards.push(discarded); next.history.push('Seat ' + seat + ' discarded ' + discarded + '.');
  }
  const humanDraw = next.wall.shift(); if (!humanDraw) { next.phase = 'ended'; return next; }
  next.players[0].hand.push(humanDraw); next.phase = 'turn'; next.currentSeat = 0; next.lastDiscard = undefined; next.history.push('You drew a tile.');
  return next;
}

export function declareAmericanMahJong(state: AmericanGameState, seat: AmericanSeat = 0) {
  const player = state.players[seat]; const card = getPracticeCard(state.cardId); const evaluation = evaluateOriginalPracticeHand(card, fullTiles(player));
  if (!evaluation.valid) return { state, evaluation, declared: false };
  const next = clone(state); next.phase = 'ended'; next.players[seat].score += card.points;
  const transfers = [0, 0, 0, 0]; let owed = card.points;
  for (const payer of ([0, 1, 2, 3] as AmericanSeat[]).filter((item) => item !== seat)) { const payment = Math.ceil(owed / ([0, 1, 2, 3].filter((item) => item !== seat && item >= payer).length)); transfers[payer] -= payment; next.players[payer].score -= payment; owed -= payment; }
  transfers[seat] = card.points; next.settlement = { winner: seat, points: card.points, transfers, reason: 'Exact match: ' + card.title + ' ' + card.version }; next.history.push('Seat ' + seat + ' declared Mah Jongg for ' + card.points + ' points.');
  return { state: next, evaluation, declared: true };
}
