/** Deterministic rules for Mahjong Hub original American practice cards. No NMJL card material. */
export type AmericanTile = string;
export type AmericanSeat = 0 | 1 | 2 | 3;
export type AmericanBotStyle = 'speed' | 'steady' | 'coach';
export type AmericanPassDirection = 'right' | 'across' | 'left';
export type AmericanPhase = 'charleston' | 'second-charleston-choice' | 'courtesy' | 'turn' | 'claim' | 'ended';

const FACES = [...['m', 'p', 's'].flatMap((suit) => Array.from({ length: 9 }, (_, index) => suit + (index + 1))), ...Array.from({ length: 7 }, (_, index) => 'z' + (index + 1))];
export const AMERICAN_WALL = [...FACES.flatMap((tile) => [tile, tile, tile, tile]), ...Array.from({ length: 8 }, (_, index) => 'f' + (index + 1)), ...Array.from({ length: 8 }, (_, index) => 'j' + (index + 1))] as AmericanTile[];

export type PracticeGroupKind = 'single' | 'pair' | 'pung' | 'kong' | 'quint' | 'sextet';
export type PracticeTileMatcher =
  | { type: 'face'; face: string }
  | { type: 'flower' }
  /** A numbered tile whose suit is bound to a named colour key on this card. */
  | { type: 'rank'; rank: number; suitKey: string; differentFrom?: string[]; sameAs?: string };
export type PracticeGroup = {
  /** Legacy face/count fields remain valid for released v1 cards. */
  face?: string;
  count?: number;
  kind?: PracticeGroupKind;
  matcher?: PracticeTileMatcher;
  jokerAllowed?: boolean;
  label: string;
};
export type OriginalPracticeCard = { id: string; version: string; title: string; difficulty: 'beginner' | 'intermediate' | 'advanced'; points: number; description: string; groups: PracticeGroup[]; concealed?: boolean };
export type AmericanPracticeSeason = { id: string; title: string; startsOn: string; endsOn?: string; cardIds: string[] };
/** Product-owned, versioned lines. Release a new id/version instead of mutating a released card. */
export const ORIGINAL_PRACTICE_CARDS: OriginalPracticeCard[] = [
  { id: 'garden-ladder-v1', version: '1.0.0', title: 'Garden Ladder', difficulty: 'beginner', points: 20, description: 'Two flowers plus 222 / 333 / 444 dots and 555 bams.', groups: [{ face: 'flower', count: 2, label: 'any 2 flowers' }, { face: 'p2', count: 3, jokerAllowed: true, label: '222 dots' }, { face: 'p3', count: 3, jokerAllowed: true, label: '333 dots' }, { face: 'p4', count: 3, jokerAllowed: true, label: '444 dots' }, { face: 's5', count: 3, jokerAllowed: true, label: '555 bams' }] },
  { id: 'bamboo-bridge-v1', version: '1.0.0', title: 'Bamboo Bridge', difficulty: 'intermediate', points: 30, description: 'Two flowers plus 111 / 333 / 555 bams and 777 dots.', groups: [{ face: 'flower', count: 2, label: 'any 2 flowers' }, { face: 's1', count: 3, jokerAllowed: true, label: '111 bams' }, { face: 's3', count: 3, jokerAllowed: true, label: '333 bams' }, { face: 's5', count: 3, jokerAllowed: true, label: '555 bams' }, { face: 'p7', count: 3, jokerAllowed: true, label: '777 dots' }] },
  { id: 'four-winds-v1', version: '1.0.0', title: 'Four Winds', difficulty: 'advanced', points: 45, description: 'Two flowers plus a pung of each wind.', groups: [{ face: 'flower', count: 2, label: 'any 2 flowers' }, { face: 'z1', count: 3, jokerAllowed: true, label: 'East pung' }, { face: 'z2', count: 3, jokerAllowed: true, label: 'South pung' }, { face: 'z3', count: 3, jokerAllowed: true, label: 'West pung' }, { face: 'z4', count: 3, jokerAllowed: true, label: 'North pung' }] },
  { id: 'pair-parade-v1', version: '1.0.0', title: 'Pair Parade', difficulty: 'advanced', points: 50, description: 'Seven exact pairs; Jokers are not legal in pairs.', groups: [{ face: 'm1', count: 2, label: '11 characters' }, { face: 'm3', count: 2, label: '33 characters' }, { face: 'p2', count: 2, label: '22 dots' }, { face: 'p4', count: 2, label: '44 dots' }, { face: 's5', count: 2, label: '55 bams' }, { face: 'z1', count: 2, label: 'East pair' }, { face: 'z5', count: 2, label: 'Red pair' }] },
  { id: 'dragon-garden-v1', version: '1.0.0', title: 'Dragon Garden', difficulty: 'intermediate', points: 35, description: 'Two flowers, three Dragon pungs and a 555 dots pung.', groups: [{ face: 'flower', count: 2, label: 'any 2 flowers' }, { face: 'z5', count: 3, jokerAllowed: true, label: 'Red Dragon pung' }, { face: 'z6', count: 3, jokerAllowed: true, label: 'Green Dragon pung' }, { face: 'z7', count: 3, jokerAllowed: true, label: 'White Dragon pung' }, { face: 'p5', count: 3, jokerAllowed: true, label: '555 dots' }] },
  { id: 'terminal-garden-v1', version: '1.0.0', title: 'Terminal Garden', difficulty: 'advanced', points: 40, description: 'Two flowers plus 111 and 999 pungs in Characters and Bams.', groups: [{ face: 'flower', count: 2, label: 'any 2 flowers' }, { face: 'm1', count: 3, jokerAllowed: true, label: '111 characters' }, { face: 'm9', count: 3, jokerAllowed: true, label: '999 characters' }, { face: 's1', count: 3, jokerAllowed: true, label: '111 bams' }, { face: 's9', count: 3, jokerAllowed: true, label: '999 bams' }] },
  { id: 'windmill-v1', version: '1.0.0', title: 'Windmill', difficulty: 'beginner', points: 25, description: 'Two flowers, a Wind pung and four number pungs around 4 and 6.', groups: [{ face: 'flower', count: 2, label: 'any 2 flowers' }, { face: 'z1', count: 3, jokerAllowed: true, label: 'East pung' }, { face: 'm4', count: 3, jokerAllowed: true, label: '444 characters' }, { face: 'p6', count: 3, jokerAllowed: true, label: '666 dots' }, { face: 's4', count: 3, jokerAllowed: true, label: '444 bams' }] },
  { id: 'harvest-lanterns-v1', version: '1.0.0', title: 'Harvest Lanterns', difficulty: 'beginner', points: 25, description: 'Two flowers, three 888 groups and a North pung.', groups: [{ face: 'flower', count: 2, label: 'any 2 flowers' }, { face: 'm8', count: 3, jokerAllowed: true, label: '888 characters' }, { face: 'p8', count: 3, jokerAllowed: true, label: '888 dots' }, { face: 's8', count: 3, jokerAllowed: true, label: '888 bams' }, { face: 'z4', count: 3, jokerAllowed: true, label: 'North pung' }] },
  { id: 'maple-dragons-v1', version: '1.0.0', title: 'Maple Dragons', difficulty: 'intermediate', points: 35, description: 'Two flowers, two Dragon pungs and 777 / 999 dots.', groups: [{ face: 'flower', count: 2, label: 'any 2 flowers' }, { face: 'z5', count: 3, jokerAllowed: true, label: 'Red Dragon pung' }, { face: 'z7', count: 3, jokerAllowed: true, label: 'White Dragon pung' }, { face: 'p7', count: 3, jokerAllowed: true, label: '777 dots' }, { face: 'p9', count: 3, jokerAllowed: true, label: '999 dots' }] },
  { id: 'autumn-pairs-v1', version: '1.0.0', title: 'Autumn Pairs', difficulty: 'advanced', points: 45, description: 'Seven exact pairs in a warm autumn palette; Jokers are never legal.', groups: [{ face: 'm2', count: 2, label: '22 characters' }, { face: 'm8', count: 2, label: '88 characters' }, { face: 'p3', count: 2, label: '33 dots' }, { face: 'p7', count: 2, label: '77 dots' }, { face: 's4', count: 2, label: '44 bams' }, { face: 'z6', count: 2, label: 'Green Dragon pair' }, { face: 'flower', count: 2, label: 'any 2 flowers' }] },
  { id: 'colour-relay-v1', version: '1.0.0', title: 'Colour Relay', difficulty: 'advanced', points: 55, description: 'An original card teaching singles, pairs, Pungs, Kongs, and same/different suit relations.', groups: [{ kind: 'pair', matcher: { type: 'flower' }, label: 'any 2 flowers' }, { kind: 'single', matcher: { type: 'face', face: 'z5' }, label: 'one Red Dragon' }, { kind: 'pung', matcher: { type: 'rank', rank: 3, suitKey: 'A' }, jokerAllowed: true, label: '333 in colour A' }, { kind: 'kong', matcher: { type: 'rank', rank: 6, suitKey: 'B', differentFrom: ['A'] }, jokerAllowed: true, label: '666 in a different colour B' }, { kind: 'kong', matcher: { type: 'rank', rank: 9, suitKey: 'A' }, jokerAllowed: true, label: '999 back in colour A' }] },
  { id: 'long-ribbon-v1', version: '1.0.0', title: 'Long Ribbon', difficulty: 'advanced', points: 65, description: 'An original card teaching a Quint and Sextet across two different suit colours.', groups: [{ kind: 'pair', matcher: { type: 'flower' }, label: 'any 2 flowers' }, { kind: 'single', matcher: { type: 'face', face: 'z7' }, label: 'one White Dragon' }, { kind: 'quint', matcher: { type: 'rank', rank: 5, suitKey: 'A' }, jokerAllowed: true, label: '55555 in colour A' }, { kind: 'sextet', matcher: { type: 'rank', rank: 7, suitKey: 'B', differentFrom: ['A'] }, jokerAllowed: true, label: '777777 in different colour B' }] },
  { id: 'quiet-garden-v1', version: '1.0.0', title: 'Quiet Garden', difficulty: 'advanced', points: 60, description: 'A fully concealed original line: no exposures; Jokers cannot fill its pairs.', concealed: true, groups: [{ kind: 'pair', matcher: { type: 'flower' }, label: 'any 2 flowers' }, { kind: 'pair', matcher: { type: 'face', face: 'm1' }, label: '11 characters' }, { kind: 'pair', matcher: { type: 'face', face: 'm9' }, label: '99 characters' }, { kind: 'pair', matcher: { type: 'face', face: 'p1' }, label: '11 dots' }, { kind: 'pair', matcher: { type: 'face', face: 'p9' }, label: '99 dots' }, { kind: 'pair', matcher: { type: 'face', face: 's1' }, label: '11 bams' }, { kind: 'pair', matcher: { type: 'face', face: 's9' }, label: '99 bams' }] },
  { id: 'kong-garden-v1', version: '1.0.0', title: 'Kong Garden', difficulty: 'intermediate', points: 50, description: 'An original exposure drill with two Kongs: colour A and colour B must differ.', groups: [{ kind: 'pair', matcher: { type: 'flower' }, label: 'any 2 flowers' }, { kind: 'single', matcher: { type: 'face', face: 'z6' }, label: 'one Green Dragon' }, { kind: 'kong', matcher: { type: 'rank', rank: 2, suitKey: 'A' }, jokerAllowed: true, label: '2222 in colour A' }, { kind: 'kong', matcher: { type: 'rank', rank: 8, suitKey: 'B', differentFrom: ['A'] }, jokerAllowed: true, label: '8888 in different colour B' }, { kind: 'pung', matcher: { type: 'face', face: 'z5' }, jokerAllowed: true, label: 'Red Dragon pung' }] },
  { id: 'quint-crossroads-v1', version: '1.0.0', title: 'Quint Crossroads', difficulty: 'advanced', points: 60, description: 'An original Quint scenario: a 44444 group and a linked 8888 group in the same colour.', groups: [{ kind: 'pair', matcher: { type: 'flower' }, label: 'any 2 flowers' }, { kind: 'quint', matcher: { type: 'rank', rank: 4, suitKey: 'A' }, jokerAllowed: true, label: '44444 in colour A' }, { kind: 'kong', matcher: { type: 'rank', rank: 8, suitKey: 'B', sameAs: 'A' }, jokerAllowed: true, label: '8888 in the same colour B' }, { kind: 'pung', matcher: { type: 'face', face: 'z5' }, jokerAllowed: true, label: 'Red Dragon pung' }] },
  { id: 'sextet-horizon-v1', version: '1.0.0', title: 'Sextet Horizon', difficulty: 'advanced', points: 70, description: 'An original long-group endgame: build a Sextet and a related Pung while preserving a natural pair.', groups: [{ kind: 'pair', matcher: { type: 'flower' }, label: 'any 2 flowers' }, { kind: 'sextet', matcher: { type: 'rank', rank: 6, suitKey: 'A' }, jokerAllowed: true, label: '666666 in colour A' }, { kind: 'pung', matcher: { type: 'rank', rank: 9, suitKey: 'B', differentFrom: ['A'] }, jokerAllowed: true, label: '999 in different colour B' }, { kind: 'pung', matcher: { type: 'face', face: 'z7' }, jokerAllowed: true, label: 'White Dragon pung' }] },
];
/** Product-owned season manifests. A released card is immutable: publish a new id/version to revise it. */
export const AMERICAN_PRACTICE_SEASONS: AmericanPracticeSeason[] = [
  { id: 'foundation-2026', title: 'Foundation Practice', startsOn: '2026-01-01', cardIds: ['garden-ladder-v1', 'bamboo-bridge-v1', 'four-winds-v1', 'pair-parade-v1', 'dragon-garden-v1', 'terminal-garden-v1', 'windmill-v1'] },
  { id: 'harvest-2026', title: 'Harvest Practice', startsOn: '2026-09-01', endsOn: '2026-11-30', cardIds: ['harvest-lanterns-v1', 'maple-dragons-v1', 'autumn-pairs-v1', 'colour-relay-v1', 'long-ribbon-v1', 'quiet-garden-v1', 'kong-garden-v1', 'quint-crossroads-v1', 'sextet-horizon-v1'] }
];

export type AmericanOptions = { secondCharleston: boolean; courtesyPass: boolean };
export type AmericanMeld = { kind: 'pung' | 'kong' | 'quint' | 'sextet'; tile: string; tiles: string[]; exposed: boolean; jokerIndexes: number[] };
export type AmericanPlayer = { seat: AmericanSeat; hand: AmericanTile[]; discards: AmericanTile[]; melds: AmericanMeld[]; score: number };
export type AmericanClaim = 'mah-jongg' | 'sextet' | 'quint' | 'kong' | 'pung';
export type AmericanSettlement = { winner: AmericanSeat; points: number; transfers: number[]; reason: string };
export type AmericanEndReason = 'mah-jongg' | 'wall-exhausted';
/** Human decisions only. Bot decisions are deterministic consequences of these events. */
export type AmericanReplayAction =
  | { type: 'lock-card'; cardId?: string }
  | { type: 'pass'; tiles: AmericanTile[]; direction: AmericanPassDirection }
  | { type: 'second-charleston'; play: boolean }
  | { type: 'discard'; tile: AmericanTile }
  | { type: 'pass-claims' }
  | { type: 'claim'; claim: Exclude<AmericanClaim, 'mah-jongg'> }
  | { type: 'claim-mah-jongg' }
  | { type: 'declare-mah-jongg' }
  | { type: 'exchange-joker'; owner: AmericanSeat; meldIndex: number; replacement: AmericanTile };
export type AmericanGameState = {
  /** The card used to deal this hand. Replays always begin here. */
  initialCardId: string;
  /** The line the player has pinned for display; play is not limited to it. */
  cardId: string;
  seasonId: string;
  /** Every practice line in play this hand. Any of them can be declared. */
  activeCardIds: string[];
  options: AmericanOptions; players: AmericanPlayer[]; wall: AmericanTile[];
  phase: AmericanPhase; passIndex: number; charlestonRound: 1 | 2; currentSeat: AmericanSeat; seed: number;
  lastDiscard?: { tile: AmericanTile; seat: AmericanSeat }; settlement?: AmericanSettlement; history: string[];
  /** Append-only, structured human event log used for signed seed replays. */
  actions: AmericanReplayAction[];
  /** Why the hand ended; a wall game has no settlement. */
  endReason?: AmericanEndReason;
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
export function getAmericanPracticeSeason(id: string) { const season = AMERICAN_PRACTICE_SEASONS.find((item) => item.id === id); if (!season) throw new Error('Unknown American practice season: ' + id); return season; }
export function createAmericanGame(seed = 20260813, cardId = 'garden-ladder-v1', options: Partial<AmericanOptions> = {}, seasonId = 'foundation-2026'): AmericanGameState {
  const season = getAmericanPracticeSeason(seasonId); const selected = season.cardIds.includes(cardId) ? cardId : season.cardIds[0]; getPracticeCard(selected); const shuffled = shuffleAmericanWall(seed);
  return { initialCardId: selected, cardId: selected, seasonId, activeCardIds: season.cardIds, options: { secondCharleston: options.secondCharleston ?? true, courtesyPass: options.courtesyPass ?? true }, players: ([0, 1, 2, 3] as AmericanSeat[]).map((seat) => ({ seat, hand: shuffled.slice(seat * 13, seat * 13 + 13), discards: [], melds: [], score: 0 })), wall: shuffled.slice(52), phase: 'charleston', passIndex: 0, charlestonRound: 1, currentSeat: 0, seed, history: ['Hand started.'], actions: [] };
}
/** Attach a human event without changing rules state; suitable for UI persistence. */
export function withAmericanReplayAction(state: AmericanGameState, action: AmericanReplayAction): AmericanGameState {
  return { ...state, actions: [...(state.actions ?? []), action] };
}
/** Pin a single original card, or restore the current season's complete card pool. */
export function lockAmericanPracticeCard(state: AmericanGameState, cardId?: string): AmericanGameState {
  const season = getAmericanPracticeSeason(state.seasonId);
  if (cardId && !season.cardIds.includes(cardId)) throw new Error('That card is not in the active practice season.');
  const next = clone(state);
  next.cardId = cardId || next.cardId;
  next.activeCardIds = cardId ? [cardId] : season.cardIds;
  next.history.push(cardId ? `Practice target locked: ${cardId}.` : 'Practice target unlocked: season pool restored.');
  return next;
}
const GROUP_SIZE: Record<PracticeGroupKind, number> = { single: 1, pair: 2, pung: 3, kong: 4, quint: 5, sextet: 6 };
export function practiceGroupCount(group: PracticeGroup) { return group.count ?? (group.kind ? GROUP_SIZE[group.kind] : 0); }
type ResolvedPracticeGroup = PracticeGroup & { face: string; count: number };
function resolveCardGroups(card: OriginalPracticeCard): ResolvedPracticeGroup[][] {
  const keys = [...new Set(card.groups.flatMap((group) => group.matcher?.type === 'rank' ? [group.matcher.suitKey] : []))];
  const assignments: Record<string, string>[] = [];
  const build = (index: number, assigned: Record<string, string>) => {
    if (index === keys.length) { assignments.push({ ...assigned }); return; }
    const key = keys[index];
    const matcher = card.groups.find((group) => group.matcher?.type === 'rank' && group.matcher.suitKey === key)?.matcher as Extract<PracticeTileMatcher, { type: 'rank' }>;
    for (const suit of ['m', 'p', 's']) {
      if (matcher.sameAs && assigned[matcher.sameAs] && assigned[matcher.sameAs] !== suit) continue;
      if ((matcher.differentFrom ?? []).some((other) => assigned[other] === suit)) continue;
      assigned[key] = suit; build(index + 1, assigned); delete assigned[key];
    }
  };
  build(0, {});
  return assignments.map((assigned) => card.groups.map((group) => {
    const matcher = group.matcher;
    const face = matcher?.type === 'flower' ? 'flower' : matcher?.type === 'rank' ? `${assigned[matcher.suitKey]}${matcher.rank}` : matcher?.type === 'face' ? matcher.face : group.face;
    if (!face) throw new Error(`Practice card ${card.id} has a group without a matcher.`);
    return { ...group, face, count: practiceGroupCount(group) };
  }));
}
/** A stable preview assignment for rendering a relational practice card. */
export function previewPracticeGroups(card: OriginalPracticeCard) { return resolveCardGroups(card)[0]; }
export type CardEvaluation = { valid: boolean; missing: string[]; illegalJokers: number; matchedGroups: number; message: string };
function evaluateResolved(card: OriginalPracticeCard, groups: ResolvedPracticeGroup[], tiles: AmericanTile[]): CardEvaluation {
  const expected = groups.reduce((total, group) => total + group.count, 0);
  if (tiles.length !== expected) return { valid: false, missing: ['Hand must contain ' + expected + ' tiles.'], illegalJokers: 0, matchedGroups: 0, message: 'Incorrect hand size.' };
  const counts = new Map<string, number>(); tiles.filter((tile) => !joker(tile)).forEach((tile) => counts.set(tile, (counts.get(tile) ?? 0) + 1));
  let jokers = tiles.filter(joker).length; let illegalJokers = 0; let matchedGroups = 0; const missing: string[] = []; const allowed = new Set(groups.map((group) => group.face));
  for (const tile of tiles.filter((tile) => !joker(tile))) if (flower(tile) ? !allowed.has('flower') : !allowed.has(tile)) missing.push(tile + ' is not used by this card line');
  for (const group of groups) { const actual = group.face === 'flower' ? tiles.filter(flower).length : (counts.get(group.face) ?? 0); const deficit = Math.max(0, group.count - actual); if (actual > group.count) missing.push(group.label + ' has too many tiles'); if (deficit && !group.jokerAllowed) { illegalJokers += Math.min(deficit, jokers); missing.push(group.label + ' cannot use a Joker'); continue; } if (deficit > jokers) missing.push(group.label + ' is short ' + (deficit - jokers)); else { jokers -= deficit; matchedGroups += 1; } if (!deficit) matchedGroups += 1; }
  if (jokers) { illegalJokers += jokers; missing.push('Unused Joker is not legal in this card line'); }
  const valid = missing.length === 0 && illegalJokers === 0;
  return { valid, missing, illegalJokers, matchedGroups, message: valid ? card.title + ' complete for ' + card.points + ' points.' : missing[0] ?? 'Hand does not match this card.' };
}
export function evaluateOriginalPracticeHand(card: OriginalPracticeCard, tiles: AmericanTile[]): CardEvaluation {
  return resolveCardGroups(card).map((groups) => evaluateResolved(card, groups, tiles)).sort((a, b) => Number(b.valid) - Number(a.valid) || a.missing.length - b.missing.length || a.illegalJokers - b.illegalJokers)[0];
}
/** Lines in play, falling back to the pinned one for hand-built fixtures. */
export function americanActiveLines(state: AmericanGameState): OriginalPracticeCard[] {
  const ids = state.activeCardIds?.length ? state.activeCardIds : [state.cardId];
  return ids.map(getPracticeCard);
}

/**
 * How many tiles a hand still needs to complete a line, counting Jokers
 * against the groups that accept them. Zero means the line is complete.
 */
export function americanLineDistance(card: OriginalPracticeCard, tiles: AmericanTile[]): number {
  return Math.min(...resolveCardGroups(card).map((groups) => {
    let jokers = tiles.filter(joker).length; let missing = 0;
    for (const group of groups) { const natural = group.face === 'flower' ? tiles.filter(flower).length : tiles.filter((tile) => tile === group.face).length; let deficit = Math.max(0, group.count - Math.min(natural, group.count)); if (deficit > 0 && group.jokerAllowed) { const used = Math.min(deficit, jokers); jokers -= used; deficit -= used; } missing += deficit; }
    return missing;
  }));
}

/**
 * The line a hand is closest to, which is the one worth playing towards.
 * Recomputed whenever it is needed, so a seat naturally switches target as
 * its hand changes — the search a real player does across the whole card.
 */
export function americanClosestLine(state: AmericanGameState, tiles: AmericanTile[]): OriginalPracticeCard {
  return americanActiveLines(state)
    .map((card) => ({ card, distance: americanLineDistance(card, tiles) }))
    .sort((a, b) => a.distance - b.distance || b.card.points - a.card.points || a.card.id.localeCompare(b.card.id))[0]
    .card;
}

/** Every line ranked by how close the hand is, closest first. */
export function rankAmericanLines(state: AmericanGameState, tiles: AmericanTile[]) {
  return americanActiveLines(state)
    .map((card) => ({ card, distance: americanLineDistance(card, tiles) }))
    .sort((a, b) => a.distance - b.distance || b.card.points - a.card.points || a.card.id.localeCompare(b.card.id));
}

export type AmericanCoachAdvice = {
  rankings: { card: OriginalPracticeCard; distance: number }[];
  keep: AmericanTile[];
  pass: AmericanTile[];
  discard?: AmericanTile;
  exposure: 'wait-for-mah-jongg' | 'call-commits-to-line' | 'exposed-group-compatible';
  jokerExchange?: AmericanTile;
  outs: { tile: string; remaining: number }[];
  discardRisk?: { tile: string; level: 'low' | 'medium' | 'high'; reason: 'exposed-match' | 'recent-call' | 'seen-safe' | 'unknown' };
};

/**
 * A transparent, deterministic coach for the original practice cards.  It
 * assesses only the player's visible tiles and the active card pool; it makes
 * no claim to know opponents' hands or the next wall tile.
 */
export function americanCoachAdvice(state: AmericanGameState, seat: AmericanSeat = 0): AmericanCoachAdvice {
  const player = state.players[seat];
  const tiles = fullTiles(player);
  const rankings = rankAmericanLines(state, tiles).slice(0, 3);
  const faceFor = (tile: AmericanTile) => flower(tile) ? 'flower' : tile;
  const flexibility = (tile: AmericanTile) => {
    if (joker(tile)) return 10_000;
    const face = faceFor(tile);
    const compatibleLines = americanActiveLines(state).filter((card) => card.groups.some((group) => group.face === face)).length;
    const target = rankings[0]?.card.groups.find((group) => group.face === face);
    const copies = face === 'flower' ? player.hand.filter(flower).length : player.hand.filter((item) => item === tile).length;
    return compatibleLines * 20 + (target ? 20 + Math.min(copies, practiceGroupCount(target)) * 5 + (target.jokerAllowed ? 0 : 4) : 0);
  };
  const ordered = [...player.hand].sort((a, b) => flexibility(b) - flexibility(a) || a.localeCompare(b));
  const pass = [...player.hand].filter((tile) => !joker(tile)).sort((a, b) => flexibility(a) - flexibility(b) || a.localeCompare(b)).slice(0, 3);
  const exchange = player.melds.find((meld) => meld.jokerIndexes.length > 0 && player.hand.includes(meld.tile));
  const compatibleExposure = player.melds.length > 0 && rankings.some(({ card }) => lineAllowsExposures(card, player.melds));
  const targetGroups = resolveCardGroups(rankings[0].card);
  const bestGroups = targetGroups.sort((a, b) => evaluateResolved(rankings[0].card, a, tiles).missing.length - evaluateResolved(rankings[0].card, b, tiles).missing.length)[0];
  const allVisible = [...state.players.flatMap((item) => [...item.discards, ...item.melds.flatMap((meld) => meld.tiles)]), ...player.hand];
  const seen = (tile: string) => tile === 'flower' ? allVisible.filter(flower).length : allVisible.filter((item) => item === tile).length;
  const outs = bestGroups.flatMap((group) => {
    const natural = group.face === 'flower' ? player.hand.filter(flower).length : player.hand.filter((tile) => tile === group.face).length;
    const need = Math.max(0, group.count - natural - (group.jokerAllowed ? player.hand.filter(joker).length : 0));
    if (!need) return [];
    const remaining = Math.max(0, (group.face === 'flower' ? 8 : 4) - seen(group.face));
    return remaining ? [{ tile: group.face, remaining }] : [];
  }).sort((a, b) => b.remaining - a.remaining).slice(0, 4);
  const suggested = player.hand.length % 3 === 2 ? pass[0] : undefined;
  const threat = suggested ? americanPublicThreat(state, seat, suggested) : undefined;
  return {
    rankings,
    keep: ordered.slice(0, 3),
    pass,
    discard: suggested,
    exposure: exchange ? 'exposed-group-compatible' : compatibleExposure ? 'exposed-group-compatible' : player.melds.length > 0 ? 'call-commits-to-line' : 'wait-for-mah-jongg',
    jokerExchange: exchange?.tile,
    outs,
    discardRisk: suggested && threat ? { tile: suggested, level: threat.score >= 3 ? 'high' : threat.score === 0 ? 'low' : 'medium', reason: threat.reason } : undefined
  };
}

/** Deterministic practice AI: preserve card targets, duplicates and Jokers. */
export function americanTileKeepValue(tile: AmericanTile, hand: AmericanTile[], card: OriginalPracticeCard): number {
  if (joker(tile)) return 100;
  const face = flower(tile) ? 'flower' : tile;
  const group = card.groups.find((item) => item.face === face);
  if (!group) return 0;
  const copies = face === 'flower' ? hand.filter(flower).length : hand.filter((item) => item === tile).length;
  const count = practiceGroupCount(group); const need = Math.max(0, count - copies);
  // A target tile is valuable, but an over-supplied natural is a sensible
  // Charleston/pass candidate before a scarce target or a Joker.
  return 20 + Math.min(copies, count) * 4 + (need > 0 ? 8 : 0) + (group.jokerAllowed ? 1 : 4);
}
function botPass(hand: AmericanTile[], card: OriginalPracticeCard, count: number) {
  // A Joker is never eligible for Charleston or Courtesy passing.
  return hand.filter((tile) => !joker(tile)).sort((a, b) => americanTileKeepValue(a, hand, card) - americanTileKeepValue(b, hand, card) || a.localeCompare(b)).slice(0, count);
}
export function americanBotStyleForSeat(seat: AmericanSeat): AmericanBotStyle { return seat === 1 ? 'speed' : seat === 2 ? 'steady' : 'coach'; }
function botTarget(state: AmericanGameState, seat: AmericanSeat): OriginalPracticeCard {
  const ranked = rankAmericanLines(state, fullTiles(state.players[seat]));
  const style = americanBotStyleForSeat(seat);
  if (style === 'speed') return [...ranked].sort((a, b) => a.distance - b.distance || b.card.points - a.card.points)[0].card;
  if (style === 'steady') return [...ranked].sort((a, b) => a.distance - b.distance || a.card.points - b.card.points)[0].card;
  return ranked[0].card;
}
export type AmericanPublicThreat = { score: number; reason: 'exposed-match' | 'recent-call' | 'seen-safe' | 'unknown' };
/**
 * Public-only defensive signal. It deliberately uses neither another seat's
 * hand nor the wall: exposed matching groups and quick recent calls increase
 * danger; repeated safe discards reduce it.
 */
export function americanPublicThreat(state: AmericanGameState, seat: AmericanSeat, tile: AmericanTile): AmericanPublicThreat {
  const opponents = state.players.filter((player) => player.seat !== seat);
  const exposed = opponents.filter((player) => player.melds.some((meld) => meld.tile === tile));
  const priorDiscards = opponents.reduce((count, player) => count + player.discards.filter((discard) => discard === tile).length, 0);
  const recentCall = exposed.length > 0 && state.history.slice(-6).some((entry) => entry.includes('called') && entry.includes(tile));
  if (exposed.length > 0) return { score: recentCall ? 4 : 3, reason: recentCall ? 'recent-call' : 'exposed-match' };
  if (priorDiscards >= 2) return { score: 0, reason: 'seen-safe' };
  return { score: 1, reason: 'unknown' };
}
export function americanPublicDiscardRisk(state: AmericanGameState, seat: AmericanSeat, tile: AmericanTile) {
  return americanPublicThreat(state, seat, tile).score;
}
/** A genuine simultaneous four-player exchange. */
export function applyAmericanPass(state: AmericanGameState, humanTiles: AmericanTile[], direction: AmericanPassDirection): AmericanGameState {
  if (state.phase !== 'charleston' && state.phase !== 'courtesy') throw new Error('No pass is currently available.');
  const count = state.phase === 'courtesy' ? humanTiles.length : 3;
  if (state.phase === 'charleston' && humanTiles.length !== 3) throw new Error('Charleston requires exactly three tiles.');
  if (count > 3) throw new Error('A Courtesy Pass may contain at most three tiles.');
  if (humanTiles.some(joker)) throw new Error('Jokers may not be passed during Charleston or Courtesy Pass.');
  const next = clone(state); const outgoing = state.players.map((player) => player.seat === 0 ? [...humanTiles] : botPass(player.hand, botTarget(state, player.seat), count));
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

/**
 * An exposed American group is not merely a collection of matching tiles. It
 * must be one of the exact groups printed on a line that remains possible.
 * Keeping this rule in the engine (rather than only disabling a UI button)
 * prevents a player from exposing a group which can never lead to Mah Jongg.
 */
function lineAllowsExposures(card: OriginalPracticeCard, melds: AmericanMeld[], candidate?: AmericanMeld): boolean {
  if (card.concealed && (melds.length > 0 || candidate)) return false;
  const exposures = candidate ? [...melds, candidate] : melds;
  return resolveCardGroups(card).some((groups) => {
    const used = new Set<number>();
    return exposures.every((meld) => {
      const groupIndex = groups.findIndex((group, index) => !used.has(index) && group.face === meld.tile && group.count === meld.tiles.length && (meld.jokerIndexes.length === 0 || group.jokerAllowed === true));
      if (groupIndex < 0) return false; used.add(groupIndex); return true;
    });
  });
}

function canExposeAmericanClaim(state: AmericanGameState, seat: AmericanSeat, claim: Exclude<AmericanClaim, 'mah-jongg'>): boolean {
  if (!state.lastDiscard || state.lastDiscard.seat === seat) return false;
  const player = state.players[seat];
  const tile = state.lastDiscard.tile;
  if (joker(tile) || flower(tile)) return false;
  const neededFromHand = ({ pung: 2, kong: 3, quint: 4, sextet: 5 } as const)[claim];
  const supplied = claimTiles(player.hand, tile, neededFromHand);
  if (!supplied) return false;
  const tiles = [tile, ...supplied];
  const jokerIndexes = tiles.flatMap((item, index) => joker(item) ? [index] : []);
  const candidate: AmericanMeld = { kind: claim, tile, tiles, exposed: true, jokerIndexes };
  return americanActiveLines(state).some((card) => lineAllowsExposures(card, player.melds, candidate));
}
export function legalAmericanClaims(state: AmericanGameState, seat: AmericanSeat = 0): AmericanClaim[] {
  if (state.phase !== 'claim' || !state.lastDiscard || seat === state.lastDiscard.seat) return [];
  const player = state.players[seat]; const tile = state.lastDiscard.tile;
  const result: AmericanClaim[] = [];
  const complete = [...fullTiles(player), tile];
  if (americanActiveLines(state).some((card) => evaluateOriginalPracticeHand(card, complete).valid)) result.push('mah-jongg');
  if (canExposeAmericanClaim(state, seat, 'sextet')) result.push('sextet');
  if (canExposeAmericanClaim(state, seat, 'quint')) result.push('quint');
  if (canExposeAmericanClaim(state, seat, 'kong')) result.push('kong');
  if (canExposeAmericanClaim(state, seat, 'pung')) result.push('pung');
  return result;
}
/** Claim priority is declaration, kong, pung; same claim type resolves in turn order after the discarder. */
export function resolveAmericanClaimPriority(discarder: AmericanSeat, claims: { seat: AmericanSeat; claim: AmericanClaim }[]) {
  const weight: Record<AmericanClaim, number> = { 'mah-jongg': 5, sextet: 4, quint: 3, kong: 2, pung: 1 };
  return [...claims].sort((a, b) => weight[b.claim] - weight[a.claim] || ((a.seat - discarder + 4) % 4) - ((b.seat - discarder + 4) % 4))[0];
}
export function claimAmericanDiscard(state: AmericanGameState, seat: AmericanSeat, claim: Exclude<AmericanClaim, 'mah-jongg'>): AmericanGameState {
  if (!legalAmericanClaims(state, seat).includes(claim) || !state.lastDiscard) throw new Error('That call is not legal.');
  const next = clone(state); const discarded = next.lastDiscard!; const player = next.players[seat]; const needed = ({ pung: 2, kong: 3, quint: 4, sextet: 5 } as const)[claim];
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

function botDiscard(state: AmericanGameState, seat: AmericanSeat, card: OriginalPracticeCard) {
  const hand = state.players[seat].hand;
  const style = americanBotStyleForSeat(seat);
  return [...hand].sort((a, b) => {
    const keep = americanTileKeepValue(a, hand, card) - americanTileKeepValue(b, hand, card);
    if (style === 'speed' && keep) return keep;
    const risk = americanPublicDiscardRisk(state, seat, a) - americanPublicDiscardRisk(state, seat, b);
    return risk || keep || a.localeCompare(b);
  })[0];
}

export const AMERICAN_HUMAN_SEAT: AmericanSeat = 0;

function nextAmericanSeat(seat: AmericanSeat): AmericanSeat {
  return ((seat + 1) % 4) as AmericanSeat;
}

/**
 * Whether a bot should expose a group for this discard.
 *
 * Calls are only worth making when the tile belongs to a group the card
 * actually uses, the exposure is not larger than that group, and the bot can
 * complete it from natural tiles. A bot never burns a Joker on a call: Jokers
 * are far more valuable held, and an exposed Joker can be taken by an opponent.
 */
function botWantsClaim(state: AmericanGameState, seat: AmericanSeat, tile: AmericanTile, claim: Exclude<AmericanClaim, 'mah-jongg'>): boolean {
  if (!canExposeAmericanClaim(state, seat, claim) || joker(tile) || flower(tile)) return false;
  const target = botTarget(state, seat);
  const exposure = ({ pung: 3, kong: 4, quint: 5, sextet: 6 } as const)[claim];
  const natural = state.players[seat].hand.filter((item) => item === tile).length;
  if (natural + 1 < exposure) return false;
  const candidate: AmericanMeld = {
    kind: claim,
    tile,
    tiles: Array.from({ length: exposure }, (_, index) => index === 0 ? tile : tile),
    exposed: true,
    jokerIndexes: []
  };
  if (!lineAllowsExposures(target, state.players[seat].melds, candidate)) return false;
  const style = americanBotStyleForSeat(seat);
  const before = americanLineDistance(target, fullTiles(state.players[seat]));
  const after = americanLineDistance(target, [...fullTiles(state.players[seat]), tile]);
  // "Speed" exposes as soon as a legal group advances its target. "Steady"
  // waits for a clearer improvement, while "coach" avoids committing when a
  // public threat says the tile is already hot at another open hand.
  if (style === 'speed') return after <= before;
  if (style === 'steady') return after < before;
  return after < before && americanPublicDiscardRisk(state, seat, tile) < 3;
}

type ClaimOutcome = 'human-decides' | 'ended' | 'claimed' | 'none';

/**
 * Offer the open discard to every other seat. The human always gets the window
 * when they have a legal call; bots answer immediately using the same priority
 * order as a physical table.
 */
function resolveClaimWindow(
  state: AmericanGameState,
  humanMayClaim: boolean
): { state: AmericanGameState; outcome: ClaimOutcome } {
  const discard = state.lastDiscard;
  if (!discard) return { state, outcome: 'none' };
  if (humanMayClaim && legalAmericanClaims(state, AMERICAN_HUMAN_SEAT).length > 0) {
    return { state, outcome: 'human-decides' };
  }

  const claims: { seat: AmericanSeat; claim: AmericanClaim }[] = [];
  for (const seat of [1, 2, 3] as AmericanSeat[]) {
    if (seat === discard.seat) continue;
    const legal = legalAmericanClaims(state, seat);
    if (legal.includes('mah-jongg')) claims.push({ seat, claim: 'mah-jongg' });
    else if (legal.includes('sextet') && botWantsClaim(state, seat, discard.tile, 'sextet')) claims.push({ seat, claim: 'sextet' });
    else if (legal.includes('quint') && botWantsClaim(state, seat, discard.tile, 'quint')) claims.push({ seat, claim: 'quint' });
    else if (legal.includes('kong') && botWantsClaim(state, seat, discard.tile, 'kong')) claims.push({ seat, claim: 'kong' });
    else if (legal.includes('pung') && botWantsClaim(state, seat, discard.tile, 'pung')) claims.push({ seat, claim: 'pung' });
  }
  if (claims.length === 0) return { state, outcome: 'none' };

  const winner = resolveAmericanClaimPriority(discard.seat, claims);
  if (winner.claim === 'mah-jongg') {
    const claimed = claimAmericanMahJong(state, winner.seat);
    return { state: claimed.state, outcome: claimed.declared ? 'ended' : 'none' };
  }
  return { state: claimAmericanDiscard(state, winner.seat, winner.claim), outcome: 'claimed' };
}

/** Draw one tile for a seat, ending the hand when the wall runs out. */
function drawForSeat(state: AmericanGameState, seat: AmericanSeat): boolean {
  const tile = state.wall.shift();
  if (!tile) {
    state.phase = 'ended';
    state.endReason = 'wall-exhausted';
    state.history.push('The wall is exhausted. The hand ends with no winner.');
    return false;
  }
  state.players[seat].hand.push(tile);
  return true;
}

/**
 * Run the table forward until the human has something to decide.
 *
 * `phase: 'turn'` always means the seat in `currentSeat` is holding a tile and
 * owes a discard, whether it drew it or claimed it. Bots take their whole turn
 * here — declaring, discarding, and answering each other's claim windows — so
 * the caller only ever regains control on the human's own turn, on a claim
 * window the human can answer, or at the end of the hand.
 */
function advanceAmerican(state: AmericanGameState): AmericanGameState {
  let current = state;
  // Bounded so a policy bug can never spin the browser: a hand cannot outlast
  // the wall by more than a few claims per tile.
  for (let guard = 0; guard < 500; guard += 1) {
    if (current.phase !== 'turn') return current;
    if (current.currentSeat === AMERICAN_HUMAN_SEAT) return current;

    const seat = current.currentSeat;
    const declared = declareAmericanMahJong(current, seat);
    if (declared.declared) return declared.state;

    const tile = botDiscard(current, seat, botTarget(current, seat));
    current = clone(current);
    current.players[seat].hand = removeFaces(current.players[seat].hand, [tile]);
    current.players[seat].discards.push(tile);
    current.lastDiscard = { seat, tile };
    current.history.push('Seat ' + seat + ' discarded ' + tile + '.');

    // The window has to be open before anyone can be asked to answer it.
    current.phase = 'claim';
    const resolved = resolveClaimWindow(current, true);
    current = resolved.state;
    if (resolved.outcome === 'ended') return current;
    if (resolved.outcome === 'human-decides') {
      current.phase = 'claim';
      return current;
    }
    if (resolved.outcome === 'claimed') continue;

    const upcoming = nextAmericanSeat(seat);
    if (!drawForSeat(current, upcoming)) return current;
    current.currentSeat = upcoming;
    current.phase = 'turn';
    current.lastDiscard = undefined;
    if (upcoming === AMERICAN_HUMAN_SEAT) current.history.push('You drew a tile.');
  }
  return current;
}

/** Discard for the human, then run the table until they are needed again. */
export function playAmericanDiscard(state: AmericanGameState, tile: AmericanTile): AmericanGameState {
  if (state.phase !== 'turn' || state.currentSeat !== AMERICAN_HUMAN_SEAT) throw new Error('It is not the human discard turn.');
  const next = clone(state);
  const hand = next.players[AMERICAN_HUMAN_SEAT].hand;
  const index = hand.indexOf(tile);
  if (index < 0) throw new Error('That tile is not in the current hand.');
  hand.splice(index, 1);
  next.players[AMERICAN_HUMAN_SEAT].discards.push(tile);
  next.lastDiscard = { seat: AMERICAN_HUMAN_SEAT, tile };
  next.history.push('You discarded ' + tile + '.');
  next.phase = 'claim';
  return continueAfterDiscard(next);
}

/** The human declined the open discard; the bots still get their say on it. */
export function passAmericanClaims(state: AmericanGameState): AmericanGameState {
  if (state.phase !== 'claim') throw new Error('No claim decision is pending.');
  const next = clone(state);
  next.history.push('You passed on ' + next.lastDiscard?.tile + '.');
  return continueAfterDiscard(next);
}

/** Settle an open discard nobody has claimed yet, then run the table on. */
function continueAfterDiscard(state: AmericanGameState): AmericanGameState {
  const discarder = state.lastDiscard?.seat ?? AMERICAN_HUMAN_SEAT;
  const resolved = resolveClaimWindow(state, false);
  let current = resolved.state;
  if (resolved.outcome === 'ended') return current;
  if (resolved.outcome === 'claimed') return advanceAmerican(current);

  current.phase = 'turn';
  const upcoming = nextAmericanSeat(discarder);
  if (!drawForSeat(current, upcoming)) return current;
  current.currentSeat = upcoming;
  current.lastDiscard = undefined;
  if (upcoming === AMERICAN_HUMAN_SEAT) current.history.push('You drew a tile.');
  return advanceAmerican(current);
}

export function declareAmericanMahJong(state: AmericanGameState, seat: AmericanSeat = 0) {
  const player = state.players[seat];
  const tiles = fullTiles(player);
  // A hand can complete more than one line; take the most valuable of them.
  const completed = americanActiveLines(state)
    .filter((line) => lineAllowsExposures(line, player.melds))
    .map((line) => ({ card: line, evaluation: evaluateOriginalPracticeHand(line, tiles) }))
    .filter((entry) => entry.evaluation.valid)
    .sort((a, b) => b.card.points - a.card.points)[0];
  if (!completed) {
    // Report against the closest line so the message names a reachable target.
    const closest = americanClosestLine(state, tiles);
    return { state, evaluation: evaluateOriginalPracticeHand(closest, tiles), declared: false };
  }
  const card = completed.card;
  const evaluation = completed.evaluation;
  const next = clone(state); next.phase = 'ended'; next.endReason = 'mah-jongg'; next.players[seat].score += card.points;
  const transfers = [0, 0, 0, 0]; let owed = card.points;
  for (const payer of ([0, 1, 2, 3] as AmericanSeat[]).filter((item) => item !== seat)) { const payment = Math.ceil(owed / ([0, 1, 2, 3].filter((item) => item !== seat && item >= payer).length)); transfers[payer] -= payment; next.players[payer].score -= payment; owed -= payment; }
  transfers[seat] = card.points; next.settlement = { winner: seat, points: card.points, transfers, reason: 'Exact match: ' + card.title + ' ' + card.version }; next.history.push('Seat ' + seat + ' declared Mah Jongg for ' + card.points + ' points.');
  return { state: next, evaluation, declared: true };
}

/**
 * Rebuild a hand from its original seed and its append-only human decisions.
 * Bots are intentionally not logged: their deterministic policy is replayed
 * by the same pure engine, making a tampered final snapshot detectable.
 */
export function replayAmericanActions(source: Pick<AmericanGameState, 'seed' | 'initialCardId' | 'seasonId' | 'options' | 'actions'>): AmericanGameState {
  let game = createAmericanGame(source.seed, source.initialCardId, source.options, source.seasonId);
  for (const action of source.actions ?? []) {
    switch (action.type) {
      case 'lock-card': game = lockAmericanPracticeCard(game, action.cardId); break;
      case 'pass': game = applyAmericanPass(game, action.tiles, action.direction); break;
      case 'second-charleston': game = decideSecondCharleston(game, action.play); break;
      case 'discard': game = playAmericanDiscard(game, action.tile); break;
      case 'pass-claims': game = passAmericanClaims(game); break;
      case 'claim': game = claimAmericanDiscard(game, AMERICAN_HUMAN_SEAT, action.claim); break;
      case 'claim-mah-jongg': {
        const result = claimAmericanMahJong(game, AMERICAN_HUMAN_SEAT);
        if (!result.declared) throw new Error('Recorded Mah Jongg claim did not resolve.');
        game = result.state;
        break;
      }
      case 'declare-mah-jongg': {
        const result = declareAmericanMahJong(game, AMERICAN_HUMAN_SEAT);
        if (!result.declared) throw new Error('Recorded Mah Jongg declaration did not resolve.');
        game = result.state;
        break;
      }
      case 'exchange-joker': game = exchangeAmericanJoker(game, AMERICAN_HUMAN_SEAT, action.owner, action.meldIndex, action.replacement); break;
      default: {
        const neverAction: never = action;
        throw new Error(`Unsupported replay action: ${JSON.stringify(neverAction)}`);
      }
    }
  }
  return game;
}
