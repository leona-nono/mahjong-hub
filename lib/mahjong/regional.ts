/**
 * Small, self-contained engines for regional tables that do not share the
 * 13-tile assumptions of the Hong Kong / Riichi / MCR engine.  They intentionally
 * stay pure so the same state can later be used by a server-authoritative table.
 */
import {
  buildWall,
  createRng,
  isBonusTile,
  normalTile,
  shuffle,
  sortTiles,
  tileRank,
  tileFromIndex,
  tileSuit,
  toCounts,
  type Suit,
  type Tile
} from './tiles';
import type { Seat } from './engine';

export type RegionalRuleset = 'sichuan' | 'taiwan';
export type RegionalPhase = 'exchange' | 'choose-void' | 'draw' | 'discard' | 'claim' | 'added-kan-claim' | 'over';
export type RegionalMeldKind = 'chi' | 'pon' | 'kan';
export type RegionalClaimKind = 'chi' | 'pon' | 'kan' | 'ron' | 'pass';

export interface RegionalMeld {
  kind: RegionalMeldKind;
  tiles: Tile[];
  from?: Seat;
  concealed?: boolean;
}

export interface RegionalClaimOption {
  kind: RegionalClaimKind;
  /** Tiles the caller contributes; the discarded tile is implicit. */
  tiles: Tile[];
}

/** Append-only inputs required to replay a seeded regional hand exactly. */
export type RegionalAction =
  | { type: 'exchange'; seat: Seat; tiles: Tile[] }
  | { type: 'void'; seat: Seat; suit: Suit }
  | { type: 'discard'; seat: Seat; tile: Tile; declaredReady?: boolean }
  | { type: 'claim'; seat: Seat; option: RegionalClaimOption }
  | { type: 'kan'; seat: Seat; tile: Tile }
  | { type: 'tsumo'; seat: Seat };

export interface RegionalPlayer {
  seat: Seat;
  hand: Tile[];
  melds: RegionalMeld[];
  flowers: Tile[];
  discards: Tile[];
  /** Sichuan 定缺; a player may not win while holding this suit. */
  voidSuit?: Suit;
  /** Sichuan 血战: a winner leaves the draw order but the hand continues. */
  won: boolean;
  isBot: boolean;
  score: number;
  lastDrawWasReplacement?: boolean;
  lastDrawnTile?: Tile;
  /** Taiwan 宣告听牌; a valid declaration awards one Tai on a later win. */
  declaredReady?: boolean;
  /** Taiwan 地听: a ready declaration within the first two uncalled rounds. */
  groundReady?: boolean;
}

export interface RegionalResult {
  kind: 'win' | 'draw';
  winners: Seat[];
  /** Product-baseline scoring shown at the table, not a tournament ledger. */
  tai?: number;
  /** Taiwan table base.  The current product baseline uses base + Tai. */
  base?: number;
  fan?: number;
  loser?: Seat;
  payments?: Partial<Record<Seat, number>>;
  readySeats?: Seat[];
  flowerPigSeats?: Seat[];
}

export interface RegionalGameState {
  ruleset: RegionalRuleset;
  wall: Tile[];
  wallIndex: number;
  /** Taiwan replacement tiles are consumed from the tail of the wall. */
  replacementIndex: number;
  players: RegionalPlayer[];
  turn: Seat;
  dealer: Seat;
  /** Taiwan circle wind, represented by the East/South/West/North seat. */
  roundWind: Seat;
  /** Consecutive dealer wins; Taiwan grants two Tai for each continuation. */
  dealerStreak: number;
  handNumber: number;
  phase: RegionalPhase;
  seed: number;
  exchangeSelections: Partial<Record<Seat, Tile[]>>;
  lastDiscard: { tile: Tile; from: Seat } | null;
  claims: Partial<Record<Seat, RegionalClaimOption[]>>;
  submitted: Partial<Record<Seat, RegionalClaimOption>>;
  claimOpenedAt?: number;
  pendingAddedKan?: { seat: Seat; tile: Tile; meldIndex: number };
  /** Taiwan 起手八花/七抢一：补花后须在首个正常摸牌节点结算。 */
  openingFlowerWin?: { winner: Seat; robbedFrom?: Seat };
  result: RegionalResult | null;
  log: string[];
  actions: RegionalAction[];
  /** Individual Kong payments, retained for 成都呼叫转移 / 无叫回退. */
  kongTransfers: Array<{ payer: Seat; winner: Seat; amount: number; reversed?: boolean }>;
}

const SEATS: Seat[] = [0, 1, 2, 3];
const NUMBERED_SUITS: Suit[] = ['m', 'p', 's'];
/** MahJongo's Taiwan table reserves its final sixteen wall tiles for replacements. */
const TAIWAN_DEAD_WALL_SIZE = 16;

function nextSeat(seat: Seat): Seat {
  return ((seat + 1) % 4) as Seat;
}

function clone(state: RegionalGameState): RegionalGameState {
  return {
    ...state,
    wall: state.wall,
    players: state.players.map((player) => ({
      ...player,
      hand: [...player.hand],
      melds: player.melds.map((meld) => ({ ...meld, tiles: [...meld.tiles] })),
      flowers: [...player.flowers],
      discards: [...player.discards]
    })),
    exchangeSelections: Object.fromEntries(
      Object.entries(state.exchangeSelections).map(([seat, tiles]) => [Number(seat), [...(tiles ?? [])]])
    ) as Partial<Record<Seat, Tile[]>>,
    result: state.result ? { ...state.result, winners: [...state.result.winners] } : null,
    claims: { ...state.claims },
    submitted: { ...state.submitted },
    pendingAddedKan: state.pendingAddedKan ? { ...state.pendingAddedKan } : undefined,
    openingFlowerWin: state.openingFlowerWin ? { ...state.openingFlowerWin } : undefined,
    log: [...state.log],
    actions: state.actions.map((action) => ({ ...action, ...('tiles' in action ? { tiles: [...action.tiles] } : {}), ...('option' in action ? { option: { ...action.option, tiles: [...action.option.tiles] } } : {}) })),
    kongTransfers: state.kongTransfers.map((entry) => ({ ...entry }))
  };
}

function isRunStart(index: number): boolean {
  return index < 27 && index % 9 <= 6;
}

/** Exact standard shape with an arbitrary number of melds (4 for Sichuan, 5 for Taiwan). */
export function isStandardMeldHand(counts: number[], melds: number): boolean {
  const work = [...counts];
  const recurse = (need: number): boolean => {
    let index = 0;
    while (index < work.length && work[index] === 0) index += 1;
    if (index === work.length) return need === 0;
    if (need === 0) return false;
    if (work[index] >= 3) {
      work[index] -= 3;
      if (recurse(need - 1)) return true;
      work[index] += 3;
    }
    if (isRunStart(index) && work[index + 1] > 0 && work[index + 2] > 0) {
      work[index] -= 1;
      work[index + 1] -= 1;
      work[index + 2] -= 1;
      if (recurse(need - 1)) return true;
      work[index] += 1;
      work[index + 1] += 1;
      work[index + 2] += 1;
    }
    return false;
  };

  for (let index = 0; index < work.length; index += 1) {
    if (work[index] < 2) continue;
    work[index] -= 2;
    if (recurse(melds)) return true;
    work[index] += 2;
  }
  return false;
}

/** A standard hand whose concealed portion contains sequences only. */
function isAllRunsHand(hand: Tile[], melds: number): boolean {
  const work = toCounts(hand);
  const recurse = (need: number): boolean => {
    let index = 0;
    while (index < work.length && work[index] === 0) index += 1;
    if (index === work.length) return need === 0;
    if (need === 0 || !isRunStart(index) || work[index + 1] === 0 || work[index + 2] === 0) return false;
    work[index] -= 1;
    work[index + 1] -= 1;
    work[index + 2] -= 1;
    const matches = recurse(need - 1);
    work[index] += 1;
    work[index + 1] += 1;
    work[index + 2] += 1;
    return matches;
  };
  for (let index = 0; index < work.length; index += 1) {
    if (work[index] < 2) continue;
    work[index] -= 2;
    if (recurse(melds)) return true;
    work[index] += 2;
  }
  return false;
}

export function canWinSichuan(hand: Tile[], voidSuit?: Suit, meldCount = 0): boolean {
  const hasForbiddenSuit = voidSuit !== undefined && hand.some((tile) => tileSuit(tile) === voidSuit);
  return !hasForbiddenSuit && (isStandardMeldHand(toCounts(hand), 4 - meldCount) || (meldCount === 0 && isSichuanSevenPairs(hand)));
}

function isSichuanSevenPairs(hand: Tile[]): boolean {
  if (hand.length !== 14) return false;
  return toCounts(hand).reduce((pairs, count) => pairs + Math.floor(count / 2), 0) === 7;
}

export function canWinTaiwan(hand: Tile[], meldCount = 0): boolean {
  return isStandardMeldHand(toCounts(hand), 5 - meldCount);
}

/** Publicly useful for the end-of-hand ready/penalty settlement and hints. */
export function regionalWaitingTiles(state: RegionalGameState, seat: Seat): Tile[] {
  const player = state.players[seat];
  const waits: Tile[] = [];
  const upper = state.ruleset === 'sichuan' ? 27 : 34;
  for (let index = 0; index < upper; index += 1) {
    const tile = tileFromIndex(index);
    if (countOf(player.hand, tile) >= 4) continue;
    const hand = [...player.hand, tile];
    const wins = state.ruleset === 'sichuan'
      ? canWinSichuan(hand, player.voidSuit, player.melds.length)
      : canWinTaiwan(hand, player.melds.length);
    if (wins) waits.push(tile);
  }
  return waits;
}

/** Exact one-tile wait category used by Taiwan 独听 and 平胡 scoring. */
export function taiwanWaitType(state: RegionalGameState, seat: Seat, tile: Tile): TaiwanScoreContext['wait'] {
  const player = state.players[seat];
  const waits = regionalWaitingTiles(state, seat);
  if (waits.length !== 1 || normalTile(waits[0]) !== normalTile(tile) || tileSuit(tile) === 'z') return 'none';
  const rank = tileRank(tile);
  const suit = tileSuit(tile);
  const has = (value: number) => value >= 1 && value <= 9 && countOf(player.hand, `${suit}${value}`);
  if (countOf(player.hand, tile) === 1) return 'single';
  if ((rank === 3 && has(1) && has(2)) || (rank === 7 && has(8) && has(9))) return 'edge';
  if (rank >= 2 && rank <= 8 && has(rank - 1) && has(rank + 1)) return 'closed';
  return 'two-sided';
}

/** Discards that leave a Taiwan hand waiting, for the 宣告听牌 table control. */
export function taiwanReadyDiscards(state: RegionalGameState, seat: Seat): Tile[] {
  if (state.ruleset !== 'taiwan' || state.phase !== 'discard' || state.turn !== seat) return [];
  const seen = new Set<Tile>();
  for (const tile of state.players[seat].hand) {
    if (seen.has(tile)) continue;
    const candidate = clone(state);
    candidate.players[seat].hand.splice(candidate.players[seat].hand.indexOf(tile), 1);
    if (regionalWaitingTiles(candidate, seat).length > 0) seen.add(tile);
  }
  return [...seen];
}

export interface TaiwanScoreContext {
  selfDrawn: boolean;
  dealer: boolean;
  roundWind?: Seat;
  dealerStreak?: number;
  /** These are explicit win-event facts, rather than inferred from a finished hand. */
  winKind?: 'normal' | 'rob-kong' | 'kong-draw';
  wait?: 'none' | 'edge' | 'closed' | 'single' | 'two-sided';
  isLastTile?: boolean;
  declaredReady?: boolean;
  groundReady?: boolean;
  flatHand?: boolean;
  allSeeking?: boolean;
  firstTurn?: 'none' | 'heaven' | 'earth' | 'human';
}

/**
 * MahJongo current Taiwan table baseline.  It intentionally models only the
 * published table, not every family-rule variant.  ``base`` is settled
 * separately as one point plus the accumulated Tai.
 */
export function taiwanTai(player: RegionalPlayer, context: TaiwanScoreContext | boolean = { selfDrawn: true, dealer: false }, legacyDealer = false): number {
  const options: TaiwanScoreContext = typeof context === 'boolean'
    ? { selfDrawn: context, dealer: legacyDealer }
    : context;
  const tiles = [...player.hand, ...player.melds.flatMap((meld) => meld.tiles)];
  const suits = new Set(tiles.filter((tile) => tileSuit(tile) !== 'z').map(tileSuit));
  const hasHonours = tiles.some((tile) => tileSuit(tile) === 'z');
  const matchingFlowers = player.flowers.filter((tile) => tile === `f${player.seat + 1}` || tile === `f${player.seat + 5}`).length;
  const allPungs = player.melds.every((meld) => meld.kind !== 'chi') && isAllTriplets(tiles);
  const concealed = player.melds.every((meld) => meld.concealed || meld.from === undefined);
  const dragons = ['z5', 'z6', 'z7'].filter((tile) => countOf(tiles, tile) >= 3);
  const dragonPair = ['z5', 'z6', 'z7'].some((tile) => countOf(tiles, tile) === 2);
  const winds = ['z1', 'z2', 'z3', 'z4'].filter((tile) => countOf(tiles, tile) >= 3);
  const windPair = ['z1', 'z2', 'z3', 'z4'].some((tile) => countOf(tiles, tile) === 2);

  // Table-limit hands replace their component Tai rather than double-counting.
  if (options.firstTurn === 'heaven') return 24;
  if (options.firstTurn === 'earth' || winds.length === 4) return 16;
  if (player.flowers.length === 8 || dragons.length === 3 || winds.length === 3 ||
      (suits.size === 1 && !hasHonours) || (suits.size === 0 && hasHonours)) return 8;

  let tai = matchingFlowers;
  if (winds.includes(`z${player.seat + 1}`)) tai += 1;
  if (options.roundWind !== undefined && winds.includes(`z${options.roundWind + 1}`)) tai += 1;
  if (dragons.length < 2) tai += dragons.length;
  if (!options.selfDrawn && concealed) tai += 1; // 门清
  if (options.winKind === 'rob-kong' || options.winKind === 'kong-draw' || options.isLastTile ||
      options.wait === 'edge' || options.wait === 'closed' || options.wait === 'single') tai += 1;
  if (options.declaredReady) tai += 1;
  if (options.groundReady) tai += 4;
  if (options.dealer) tai += 1 + (options.dealerStreak ?? 0) * 2;

  if (options.firstTurn === 'human') tai += 8;
  if (options.flatHand) tai += 2;
  if (options.allSeeking) tai += 2;
  if (allPungs) tai += 4;
  if (dragons.length === 2 && dragonPair) tai += 4; // 小三元，不叠加三元台
  if (suits.size === 1 && hasHonours) tai += 4;
  const concealedTriplets = countConcealedTriplets(player, tiles);
  if (concealedTriplets >= 4) tai += 5;
  else if (concealedTriplets >= 3) tai += 2;
  // 门清自摸为固定 3 台，取代门清与自摸的单项相加。
  if (options.selfDrawn && concealed) tai += 3;
  else if (options.selfDrawn) tai += 1;
  return tai;
}

function countConcealedTriplets(player: RegionalPlayer, tiles: Tile[]): number {
  const exposedTriplets = player.melds.filter((meld) => meld.from !== undefined && !meld.concealed).length;
  return Math.max(0, Array.from(toCounts(tiles)).filter((count) => count >= 3).length - exposedTriplets);
}

function isAllTriplets(tiles: Tile[]): boolean {
  return toCounts(tiles).every((count) => count % 3 === 0 || count === 2);
}

function sichuanFan(player: RegionalPlayer, eventFan = 0): number {
  const tiles = [...player.hand, ...player.melds.flatMap((meld) => meld.tiles)];
  const suits = new Set(tiles.map(tileSuit));
  // 成都产品基线：0 番基础分 1，参与基础分计算的番数封顶 3。
  let fan = Array.from(toCounts(tiles)).filter((count) => count === 4).length; // 根
  if (isSichuanSevenPairs(player.hand)) fan += 2;
  if (isAllTriplets(tiles)) fan += 1;
  if (suits.size === 1) fan += 2;
  if (player.melds.length === 4 && player.hand.length === 2) fan += 1;
  if (player.lastDrawWasReplacement) fan += 1;
  fan += eventFan; // 杠后炮、海底捞月/炮等由和牌事件提供
  return Math.min(3, fan);
}

/** Highest displayed Chengdu fan among the seat's current waits. */
export function maximumSichuanWaitFan(state: RegionalGameState, seat: Seat): number {
  const player = state.players[seat];
  const waits = regionalWaitingTiles(state, seat);
  return waits.reduce((best, tile) => Math.max(best, sichuanFan({ ...player, hand: [...player.hand, tile] })), 0);
}

function takeTaiwanPlayableTile(state: RegionalGameState, seat: Seat, replacement = false): Tile | null {
  if (state.wallIndex > state.replacementIndex) return null;
  if (!replacement && state.wallIndex >= state.wall.length - TAIWAN_DEAD_WALL_SIZE) return null;
  if (replacement && state.replacementIndex < state.wall.length - TAIWAN_DEAD_WALL_SIZE) return null;
  let tile = replacement ? state.wall[state.replacementIndex--] : state.wall[state.wallIndex++];
  while (isBonusTile(tile)) {
    state.players[seat].flowers.push(tile);
    if (state.replacementIndex < state.wallIndex) return null;
    tile = state.wall[state.replacementIndex--];
  }
  return tile;
}

function taiwanFlowerWinner(state: RegionalGameState): { winner: Seat; robbedFrom?: Seat } | null {
  if (state.players.reduce((total, player) => total + player.flowers.length, 0) < 8) return null;
  const eightFlowers = state.players.find((player) => player.flowers.length === 8);
  if (eightFlowers) return { winner: eightFlowers.seat };
  const sevenFlowers = state.players.find((player) => player.flowers.length === 7);
  if (!sevenFlowers) return null;
  const holder = state.players.find((player) => player.seat !== sevenFlowers.seat && player.flowers.length > 0);
  return holder ? { winner: sevenFlowers.seat, robbedFrom: holder.seat } : null;
}

function finishTaiwanFlowerWin(state: RegionalGameState, opening = false): boolean {
  const flowerWin = opening ? state.openingFlowerWin ?? null : taiwanFlowerWinner(state);
  if (!flowerWin) return false;
  const payments: Partial<Record<Seat, number>> = {};
  const tai = 8 + (opening ? 4 : 0); // 配牌花胡在七抢一/八仙过海之外另计四台
  const amount = 1 + tai;
  if (flowerWin.robbedFrom !== undefined) {
    payments[flowerWin.robbedFrom] = amount;
  } else {
    for (const seat of SEATS) if (seat !== flowerWin.winner) payments[seat] = amount;
  }
  for (const payer of SEATS) state.players[payer].score -= payments[payer] ?? 0;
  state.players[flowerWin.winner].score += Object.values(payments).reduce((sum, value) => sum + (value ?? 0), 0);
  state.phase = 'over';
  state.result = { kind: 'win', winners: [flowerWin.winner], loser: flowerWin.robbedFrom, tai, base: 1, payments };
  state.openingFlowerWin = undefined;
  state.log.push(`Taiwan ${flowerWin.robbedFrom === undefined ? 'Eight Flowers' : 'Seven Rob One'}${opening ? ' opening bonus' : ''} win for seat ${flowerWin.winner}.`);
  return true;
}

export function createRegionalGame(options: { ruleset: RegionalRuleset; seed?: number; humanSeat?: Seat; dealer?: Seat; scores?: number[]; handNumber?: number; roundWind?: Seat; dealerStreak?: number } ): RegionalGameState {
  const seed = options.seed ?? Math.floor(Math.random() * 2 ** 31);
  const humanSeat = options.humanSeat ?? 0;
  const wall = shuffle(
    options.ruleset === 'sichuan'
      ? buildWall().filter((tile) => tileSuit(tile) !== 'z')
      : buildWall([], true),
    createRng(seed)
  );
  const state: RegionalGameState = {
    ruleset: options.ruleset,
    wall,
    wallIndex: 0,
    replacementIndex: wall.length - 1,
    players: SEATS.map((seat) => ({ seat, hand: [], melds: [], flowers: [], discards: [], won: false, isBot: seat !== humanSeat, score: options.scores?.[seat] ?? 1000 })),
    turn: options.dealer ?? 0,
    dealer: options.dealer ?? 0,
    roundWind: options.roundWind ?? 0,
    dealerStreak: options.dealerStreak ?? 0,
    handNumber: options.handNumber ?? 0,
    phase: options.ruleset === 'sichuan' ? 'exchange' : 'draw',
    seed,
    exchangeSelections: {},
    lastDiscard: null,
    claims: {},
    submitted: {},
    result: null,
    log: [],
    actions: []
    ,kongTransfers: []
  };
  const handSize = options.ruleset === 'sichuan' ? 13 : 16;
  for (let round = 0; round < handSize; round += 1) {
    for (const seat of SEATS) {
      const tile = options.ruleset === 'taiwan'
        ? takeTaiwanPlayableTile(state, seat)
        : state.wall[state.wallIndex++];
      if (tile) state.players[seat].hand.push(tile);
    }
  }
  for (const player of state.players) player.hand = sortTiles(player.hand);
  if (options.ruleset === 'taiwan') state.openingFlowerWin = taiwanFlowerWinner(state) ?? undefined;
  return state;
}

/** Deal the next hand while retaining scores and the dealer/hand progression. */
export function startNextRegionalHand(state: RegionalGameState): RegionalGameState {
  if (state.phase !== 'over') return state;
  const dealerKeeps = state.result?.kind === 'draw' || Boolean(state.result?.winners.includes(state.dealer));
  const dealer = dealerKeeps ? state.dealer : nextSeat(state.dealer);
  const dealerStreak = dealerKeeps && state.result?.kind === 'win' ? state.dealerStreak + 1 : 0;
  const roundWind = !dealerKeeps && dealer === 0 ? nextSeat(state.roundWind) : state.roundWind;
  const humanSeat = state.players.find((player) => !player.isBot)?.seat ?? 0;
  const next = createRegionalGame({
    ruleset: state.ruleset,
    seed: state.seed + 1,
    humanSeat,
    dealer,
    roundWind,
    dealerStreak,
    handNumber: state.handNumber + (dealerKeeps ? 0 : 1),
    scores: state.players.map((player) => player.score)
  });
  next.log = [...state.log, `Next hand: dealer seat ${dealer}.`];
  return next;
}

/** Only same-suit three-tile exchanges are legal in the Chengdu baseline. */
export function submitSichuanExchange(state: RegionalGameState, seat: Seat, tiles: Tile[]): RegionalGameState {
  if (state.ruleset !== 'sichuan' || state.phase !== 'exchange' || tiles.length !== 3) return state;
  const player = state.players[seat];
  const requested = new Map<Tile, number>();
  for (const tile of tiles) requested.set(tile, (requested.get(tile) ?? 0) + 1);
  if (Array.from(requested.entries()).some(([tile, count]) => player.hand.filter((candidate) => candidate === tile).length < count) || new Set(tiles.map(tileSuit)).size !== 1) return state;
  const next = clone(state);
  next.actions.push({ type: 'exchange', seat, tiles: [...tiles] });
  next.exchangeSelections[seat] = [...tiles];
  if (SEATS.every((candidate) => next.exchangeSelections[candidate])) {
    for (const giver of SEATS) {
      const outgoing = next.exchangeSelections[giver]!;
      const receiver = nextSeat(giver); // clockwise exchange is the product baseline.
      for (const tile of outgoing) next.players[giver].hand.splice(next.players[giver].hand.indexOf(tile), 1);
      next.players[receiver].hand.push(...outgoing);
    }
    for (const candidate of next.players) candidate.hand = sortTiles(candidate.hand);
    next.phase = 'choose-void';
    next.log.push('Exchange Three completed; choose a forbidden suit.');
  }
  return next;
}

export function allowedSichuanVoidSuits(hand: Tile[]): Suit[] {
  const totals = NUMBERED_SUITS.map((suit) => ({ suit, count: hand.filter((tile) => tileSuit(tile) === suit).length }));
  const minimum = Math.min(...totals.map(({ count }) => count));
  return totals.filter(({ count }) => count === minimum).map(({ suit }) => suit);
}

export function chooseSichuanVoidSuit(state: RegionalGameState, seat: Seat, suit: Suit): RegionalGameState {
  if (state.ruleset !== 'sichuan' || state.phase !== 'choose-void' || !NUMBERED_SUITS.includes(suit)) return state;
  if (!allowedSichuanVoidSuits(state.players[seat].hand).includes(suit)) return state;
  const next = clone(state);
  next.actions.push({ type: 'void', seat, suit });
  next.players[seat].voidSuit = suit;
  if (next.players.every((player) => player.voidSuit)) {
    next.phase = 'draw';
    next.log.push('All players chose a forbidden suit. East draws first.');
  }
  return next;
}

function nextActiveSeat(state: RegionalGameState, from: Seat): Seat | null {
  for (let offset = 1; offset <= 4; offset += 1) {
    const seat = ((from + offset) % 4) as Seat;
    if (!state.players[seat].won) return seat;
  }
  return null;
}

export const REGIONAL_CLAIM_TIMEOUT_MS = 8000;

function countOf(hand: Tile[], tile: Tile): number {
  return hand.filter((candidate) => normalTile(candidate) === normalTile(tile)).length;
}

function removeKind(hand: Tile[], tile: Tile): Tile | null {
  const index = hand.findIndex((candidate) => normalTile(candidate) === normalTile(tile));
  return index < 0 ? null : hand.splice(index, 1)[0];
}

function canRon(state: RegionalGameState, seat: Seat, tile: Tile): boolean {
  const player = state.players[seat];
  const hand = [...player.hand, tile];
  if (state.ruleset === 'sichuan') {
    return !player.won && !hand.some((candidate) => tileSuit(candidate) === player.voidSuit) &&
      (isStandardMeldHand(toCounts(hand), 4 - player.melds.length) || (player.melds.length === 0 && isSichuanSevenPairs(hand)));
  }
  return canWinTaiwan(hand, player.melds.length);
}

function collectClaims(state: RegionalGameState, tile: Tile, from: Seat, robKan = false): Partial<Record<Seat, RegionalClaimOption[]>> {
  const claims: Partial<Record<Seat, RegionalClaimOption[]>> = {};
  for (const seat of SEATS) {
    if (seat === from || state.players[seat].won) continue;
    const hand = state.players[seat].hand;
    const options: RegionalClaimOption[] = [];
    if (canRon(state, seat, tile)) options.push({ kind: 'ron', tiles: [tile] });
    if (!robKan && !state.players[seat].declaredReady) {
      if (countOf(hand, tile) >= 2) options.push({ kind: 'pon', tiles: [tile, tile] });
      if (countOf(hand, tile) >= 3) options.push({ kind: 'kan', tiles: [tile, tile, tile] });
      if (state.ruleset === 'taiwan' && seat === nextSeat(from) && tileSuit(tile) !== 'z') {
        const rank = Number(tile.slice(1));
        const suit = tileSuit(tile);
        const has = (value: number) => value >= 1 && value <= 9 && countOf(hand, `${suit}${value}`) > 0;
        if (has(rank - 2) && has(rank - 1)) options.push({ kind: 'chi', tiles: [`${suit}${rank - 2}`, `${suit}${rank - 1}`] });
        if (has(rank - 1) && has(rank + 1)) options.push({ kind: 'chi', tiles: [`${suit}${rank - 1}`, `${suit}${rank + 1}`] });
        if (has(rank + 1) && has(rank + 2)) options.push({ kind: 'chi', tiles: [`${suit}${rank + 1}`, `${suit}${rank + 2}`] });
      }
    }
    if (options.length) claims[seat] = options;
  }
  return claims;
}

function openClaims(state: RegionalGameState, tile: Tile, from: Seat, addedKan = false, now = Date.now()): RegionalGameState {
  const claims = collectClaims(state, tile, from, addedKan);
  if (Object.keys(claims).length === 0) {
    if (addedKan && state.pendingAddedKan) {
      const pending = state.pendingAddedKan;
      state.players[pending.seat].melds[pending.meldIndex] = { ...state.players[pending.seat].melds[pending.meldIndex], kind: 'kan', tiles: [...state.players[pending.seat].melds[pending.meldIndex].tiles, tile] };
      state.pendingAddedKan = undefined;
      settleRegionalKong(state, pending.seat);
      if (supplementDraw(state, pending.seat)) return state;
      state.turn = pending.seat;
      state.phase = 'discard';
      return state;
    }
    return advanceAfterNoClaim(state);
  }
  state.claims = claims;
  state.submitted = {};
  state.claimOpenedAt = now;
  state.phase = addedKan ? 'added-kan-claim' : 'claim';
  return state;
}

function advanceAfterNoClaim(state: RegionalGameState): RegionalGameState {
  const following = nextActiveSeat(state, state.turn);
  if (following === null) {
    state.phase = 'over';
    state.result = { kind: 'draw', winners: state.players.filter((player) => player.won).map((player) => player.seat) };
  } else {
    state.turn = following;
    state.phase = 'draw';
  }
  return state;
}

function finishRegionalDraw(state: RegionalGameState): void {
  const winners = state.players.filter((player) => player.won).map((player) => player.seat);
  const result: RegionalResult = { kind: 'draw', winners };
  if (state.ruleset === 'sichuan') {
    const flowerPigs = state.players.filter((player) => !player.won && player.voidSuit && player.hand.some((tile) => tileSuit(tile) === player.voidSuit)).map((player) => player.seat);
    const ready = flowerPigs.length === 0
      ? state.players.filter((player) => !player.won && regionalWaitingTiles(state, player.seat).length > 0).map((player) => player.seat)
      : [];
    result.flowerPigSeats = flowerPigs;
    result.readySeats = ready;
    for (const seat of flowerPigs) {
      for (const receiver of SEATS) {
        if (receiver === seat || state.players[receiver].won) continue;
        // 成都产品基线：花猪按本桌 3 番封顶基础分赔付给每一名仍在局玩家。
        state.players[seat].score -= 8;
        state.players[receiver].score += 8;
      }
    }
    for (const payer of SEATS) {
      if (state.players[payer].won || flowerPigs.includes(payer) || ready.includes(payer)) continue;
      for (const receiver of ready) {
        const amount = 2 ** maximumSichuanWaitFan(state, receiver);
        state.players[payer].score -= amount;
        state.players[receiver].score += amount;
      }
    }
    // 成都基线：杠家若荒牌时无叫，撤回本局已收的杠分。
    for (const transfer of state.kongTransfers) {
      if (transfer.reversed || state.players[transfer.winner].won || regionalWaitingTiles(state, transfer.winner).length > 0) continue;
      state.players[transfer.winner].score -= transfer.amount;
      state.players[transfer.payer].score += transfer.amount;
      transfer.reversed = true;
    }
    state.log.push(`Sichuan draw: ready ${ready.join(',') || 'none'}; flower pigs ${flowerPigs.join(',') || 'none'}.`);
  }
  state.phase = 'over';
  state.result = result;
}

function supplementDraw(state: RegionalGameState, seat: Seat): boolean {
  if (state.replacementIndex < state.wallIndex) return false;
  const tile = state.ruleset === 'taiwan'
    ? takeTaiwanPlayableTile(state, seat, true)
    : state.wall[state.replacementIndex--];
  if (tile) {
    state.players[seat].hand = sortTiles([...state.players[seat].hand, tile]);
    state.players[seat].lastDrawWasReplacement = true;
    state.players[seat].lastDrawnTile = tile;
  }
  return state.ruleset === 'taiwan' && finishTaiwanFlowerWin(state);
}

const CLAIM_PRIORITY: Record<RegionalClaimKind, number> = { ron: 4, kan: 3, pon: 2, chi: 1, pass: 0 };

export function drawRegionalTile(state: RegionalGameState): RegionalGameState {
  if (state.phase !== 'draw') return state;
  const next = clone(state);
  if (next.wallIndex > next.replacementIndex) {
    finishRegionalDraw(next);
    return next;
  }
  const tile = next.ruleset === 'taiwan'
    ? takeTaiwanPlayableTile(next, next.turn)
    : next.wall[next.wallIndex++];
  if (next.ruleset === 'taiwan' && next.openingFlowerWin && finishTaiwanFlowerWin(next, true)) return next;
  if (next.ruleset === 'taiwan' && finishTaiwanFlowerWin(next)) return next;
  if (!tile) {
    finishRegionalDraw(next);
    return next;
  }
  next.players[next.turn].hand = sortTiles([...next.players[next.turn].hand, tile]);
  next.players[next.turn].lastDrawWasReplacement = false;
  next.players[next.turn].lastDrawnTile = tile;
  next.phase = 'discard';
  return next;
}

export function discardRegionalTile(state: RegionalGameState, seat: Seat, tile: Tile, declareReady = false): RegionalGameState {
  if (state.phase !== 'discard' || state.turn !== seat) return state;
  const index = state.players[seat].hand.indexOf(tile);
  if (index === -1) return state;
  if (state.ruleset === 'taiwan' && state.players[seat].declaredReady && state.players[seat].lastDrawnTile !== tile) return state;
  if (state.ruleset === 'sichuan' && state.players[seat].voidSuit &&
      state.players[seat].hand.some((candidate) => tileSuit(candidate) === state.players[seat].voidSuit) &&
      tileSuit(tile) !== state.players[seat].voidSuit) return state;
  if (state.ruleset === 'sichuan' && state.replacementIndex - state.wallIndex + 1 <= 4 &&
      canWinSichuan(state.players[seat].hand, state.players[seat].voidSuit, state.players[seat].melds.length)) return state;
  const next = clone(state);
  next.players[seat].hand.splice(index, 1);
  if (declareReady) {
    if (next.ruleset !== 'taiwan' || next.players[seat].declaredReady || regionalWaitingTiles(next, seat).length === 0) return state;
    next.players[seat].declaredReady = true;
    const uncalledOpening = next.actions.filter((action) => action.type === 'discard').length < 8 &&
      next.players.every((player) => player.melds.length === 0);
    next.players[seat].groundReady = uncalledOpening;
    next.log.push(`Seat ${seat} declared ready${uncalledOpening ? ' (ground ready)' : ''}.`);
  }
  next.actions.push({ type: 'discard', seat, tile, ...(declareReady ? { declaredReady: true } : {}) });
  next.players[seat].discards.push(tile);
  next.lastDiscard = { tile, from: seat };
  return openClaims(next, tile, seat);
}

function settleRegionalWin(state: RegionalGameState, seat: Seat, selfDrawn: boolean, loser?: Seat, robKong = false, wait: TaiwanScoreContext['wait'] = 'none'): RegionalResult {
  const player = state.players[seat];
  const tiles = [...player.hand, ...player.melds.flatMap((meld) => meld.tiles)];
  const flatHand = !selfDrawn && player.flowers.length === 0 && !tiles.some((tile) => tileSuit(tile) === 'z') &&
    player.melds.every((meld) => meld.kind === 'chi') && isAllRunsHand(player.hand, 5 - player.melds.length) && wait === 'two-sided';
  const allSeeking = !selfDrawn && player.melds.length === 5 && player.hand.length === 2;
  const discardCount = state.actions.filter((action) => action.type === 'discard').length;
  const noCalls = state.players.every((candidate) => candidate.melds.length === 0);
  const firstTurn: TaiwanScoreContext['firstTurn'] = state.ruleset !== 'taiwan' ? 'none'
    : selfDrawn && ((seat === state.dealer && discardCount === 0) || (seat !== state.dealer && discardCount === 1 && noCalls)) ? (seat === state.dealer ? 'heaven' : 'earth')
      : !selfDrawn && discardCount === 1 && noCalls ? 'human' : 'none';
  const tai = state.ruleset === 'taiwan' ? taiwanTai(player, {
    selfDrawn,
    dealer: seat === state.dealer,
    roundWind: state.roundWind,
    dealerStreak: state.dealerStreak,
    winKind: robKong ? 'rob-kong' : player.lastDrawWasReplacement ? 'kong-draw' : 'normal',
    isLastTile: state.wallIndex > state.replacementIndex
    ,wait
    ,declaredReady: player.declaredReady
    ,groundReady: player.groundReady
    ,flatHand
    ,allSeeking
    ,firstTurn
  }) : undefined;
  const sichuanEventFan = state.ruleset === 'sichuan'
    ? (selfDrawn ? 0 : (state.players[loser!].lastDrawWasReplacement ? 1 : 0)) + (state.wallIndex > state.replacementIndex ? 1 : 0)
    : 0;
  const fan = state.ruleset === 'sichuan' ? sichuanFan(player, sichuanEventFan) : undefined;
  const base = state.ruleset === 'taiwan' ? 1 : undefined;
  const unit = state.ruleset === 'taiwan' ? base! + (tai ?? 0) : 2 ** (fan ?? 0);
  const payments: Partial<Record<Seat, number>> = {};
  if (selfDrawn) {
    const payment = state.ruleset === 'sichuan' ? unit + 1 : unit;
    for (const payer of SEATS) if (payer !== seat && !state.players[payer].won) payments[payer] = payment;
  } else if (loser !== undefined) {
    payments[loser] = unit;
  }
  const gain = Object.values(payments).reduce((sum, value) => sum + (value ?? 0), 0);
  for (const payer of SEATS) state.players[payer].score -= payments[payer] ?? 0;
  state.players[seat].score += gain;
  return { kind: 'win', winners: [seat], loser, tai, fan, base, payments };
}

/** Product baseline Kong settlement: a discard Kong is paid by its provider; a concealed Kong is shared. */
function settleRegionalKong(state: RegionalGameState, winner: Seat, from?: Seat): void {
  const unit = state.ruleset === 'sichuan' ? 2 : 1;
  if (from !== undefined) {
    const amount = unit * 3;
    state.players[from].score -= amount;
    state.players[winner].score += amount;
    state.kongTransfers.push({ payer: from, winner, amount });
    state.log.push(`Seat ${from} pays ${amount} for seat ${winner}'s discard Kong.`);
    return;
  }
  for (const seat of SEATS) {
    if (seat === winner || state.players[seat].won) continue;
    state.players[seat].score -= unit;
    state.players[winner].score += unit;
    state.kongTransfers.push({ payer: seat, winner, amount: unit });
  }
  state.log.push(`Seat ${winner} collects concealed Kong payments.`);
}

function finishRon(state: RegionalGameState, seats: Seat[], tile: Tile, from: Seat, robKong = false): RegionalGameState {
  const byDiscardOrder = [...seats].sort((a, b) => ((a - from + 4) % 4) - ((b - from + 4) % 4));
  // 成都一炮多响：每位和牌者各自向放铳者结算；呼叫转移只交给最近的和牌者，避免重复转移同一笔杠分。
  const winners = state.ruleset === 'sichuan' ? byDiscardOrder : [byDiscardOrder[0]];
  for (const seat of winners) {
    const wait = state.ruleset === 'taiwan' ? taiwanWaitType(state, seat, tile) : 'none';
    state.players[seat].hand = sortTiles([...state.players[seat].hand, tile]);
    const result = settleRegionalWin(state, seat, false, from, robKong, wait);
    if (state.ruleset === 'taiwan') {
      state.phase = 'over';
      state.result = result;
      return state;
    }
    if (seat === winners[0]) {
      for (const transfer of state.kongTransfers) {
        if (transfer.winner !== from || transfer.reversed) continue;
        state.players[from].score -= transfer.amount;
        state.players[seat].score += transfer.amount;
        transfer.reversed = true;
      }
    }
    state.players[seat].won = true;
  }
  // Sichuan Blood Battle ends after three winners; the remaining seat is the loser.
  if (state.players.filter((player) => player.won).length >= 3) {
    state.phase = 'over';
    state.result = { kind: 'win', winners: state.players.filter((player) => player.won).map((player) => player.seat), loser: state.players.find((player) => !player.won)?.seat };
    return state;
  }
  state.turn = nextActiveSeat(state, from) ?? from;
  state.phase = 'draw';
  state.log.push(`Seats ${winners.join(', ')} win on seat ${from}'s discard; Blood Battle continues.`);
  return state;
}

/** Submit one answer to a discard or added-Kong claim window. */
export function submitRegionalClaim(state: RegionalGameState, seat: Seat, option: RegionalClaimOption): RegionalGameState {
  if (state.phase !== 'claim' && state.phase !== 'added-kan-claim') return state;
  if (!state.claims[seat]?.some((candidate) => candidate.kind === option.kind && candidate.tiles.join(',') === option.tiles.join(',')) && option.kind !== 'pass') return state;
  const next = clone(state);
  next.actions.push({ type: 'claim', seat, option: { kind: option.kind, tiles: [...option.tiles] } });
  next.submitted[seat] = option;
  const pending = Object.keys(next.claims).map(Number) as Seat[];
  if (!pending.every((candidate) => next.submitted[candidate])) return next;
  const tile = next.phase === 'added-kan-claim' ? next.pendingAddedKan?.tile : next.lastDiscard?.tile;
  const from = next.phase === 'added-kan-claim' ? next.pendingAddedKan?.seat : next.lastDiscard?.from;
  if (!tile || from === undefined) return next;
  const ronSeats = pending.filter((candidate) => next.submitted[candidate]?.kind === 'ron');
  const answers = { ...next.submitted };
  next.claims = {};
  next.submitted = {};
  next.claimOpenedAt = undefined;
  if (ronSeats.length) {
    next.pendingAddedKan = undefined;
    return finishRon(next, ronSeats, tile, from, next.phase === 'added-kan-claim');
  }
  if (next.phase === 'added-kan-claim' && next.pendingAddedKan) {
    const pendingKan = next.pendingAddedKan;
    next.players[pendingKan.seat].melds[pendingKan.meldIndex] = { ...next.players[pendingKan.seat].melds[pendingKan.meldIndex], kind: 'kan', tiles: [...next.players[pendingKan.seat].melds[pendingKan.meldIndex].tiles, tile] };
    next.pendingAddedKan = undefined;
    settleRegionalKong(next, pendingKan.seat);
    if (supplementDraw(next, pendingKan.seat)) return next;
    next.turn = pendingKan.seat;
    next.phase = 'discard';
    return next;
  }
  let best: { seat: Seat; option: RegionalClaimOption } | null = null;
  for (const candidate of pending) {
    const option = answers[candidate]!;
    if (option.kind === 'pass') continue;
    if (!best || CLAIM_PRIORITY[option.kind] > CLAIM_PRIORITY[best.option.kind]) best = { seat: candidate, option };
  }
  if (!best) return advanceAfterNoClaim(next);
  next.players[from].discards.pop();
  const caller = next.players[best.seat];
  const contributed = best.option.tiles.map((candidate) => removeKind(caller.hand, candidate)).filter((candidate): candidate is Tile => Boolean(candidate));
  const kind: RegionalMeldKind = best.option.kind === 'chi' ? 'chi' : best.option.kind === 'pon' ? 'pon' : 'kan';
  caller.melds.push({ kind, tiles: sortTiles([...contributed, tile]), from });
  if (kind === 'kan') {
    settleRegionalKong(next, best.seat, from);
    if (supplementDraw(next, best.seat)) return next;
  }
  next.turn = best.seat;
  next.lastDiscard = null;
  next.phase = 'discard';
  return next;
}

export function passUnansweredRegionalClaims(state: RegionalGameState, now: number): RegionalGameState {
  if ((state.phase !== 'claim' && state.phase !== 'added-kan-claim') || now - (state.claimOpenedAt ?? now) < REGIONAL_CLAIM_TIMEOUT_MS) return state;
  let next = state;
  for (const seat of Object.keys(state.claims).map(Number) as Seat[]) {
    if (!next.submitted[seat]) next = submitRegionalClaim(next, seat, { kind: 'pass', tiles: [] });
  }
  return next;
}

export function availableRegionalKans(state: RegionalGameState, seat: Seat): Tile[] {
  if (state.phase !== 'discard' || state.turn !== seat) return [];
  const player = state.players[seat];
  const concealed = [...new Set(player.hand.filter((tile) => countOf(player.hand, tile) === 4).map(normalTile))];
  const added = player.melds.filter((meld) => meld.kind === 'pon').map((meld) => meld.tiles[0]).filter((tile) => countOf(player.hand, tile) > 0).map(normalTile);
  return [...new Set([...concealed, ...added])];
}

export function declareRegionalKan(state: RegionalGameState, seat: Seat, tile: Tile): RegionalGameState {
  if (!availableRegionalKans(state, seat).includes(normalTile(tile))) return state;
  const next = clone(state);
  next.actions.push({ type: 'kan', seat, tile: normalTile(tile) });
  const player = next.players[seat];
  const ponIndex = player.melds.findIndex((meld) => meld.kind === 'pon' && normalTile(meld.tiles[0]) === normalTile(tile));
  if (ponIndex >= 0) {
    removeKind(player.hand, tile);
    next.pendingAddedKan = { seat, tile: normalTile(tile), meldIndex: ponIndex };
    return openClaims(next, normalTile(tile), seat, true);
  }
  const tiles = Array.from({ length: 4 }, () => removeKind(player.hand, tile)).filter((candidate): candidate is Tile => Boolean(candidate));
  player.melds.push({ kind: 'kan', tiles, concealed: true });
  settleRegionalKong(next, seat);
  if (supplementDraw(next, seat)) return next;
  next.phase = 'discard';
  return next;
}

export function declareRegionalTsumo(state: RegionalGameState, seat: Seat): RegionalGameState {
  if (state.phase !== 'discard' || state.turn !== seat) return state;
  const player = state.players[seat];
  const legal = state.ruleset === 'sichuan'
    ? canWinSichuan(player.hand, player.voidSuit, player.melds.length)
    : canWinTaiwan(player.hand, player.melds.length);
  if (!legal) return state;
  const next = clone(state);
  next.actions.push({ type: 'tsumo', seat });
  if (next.ruleset === 'taiwan') {
    next.phase = 'over';
    next.result = settleRegionalWin(next, seat, true);
    return next;
  }
  settleRegionalWin(next, seat, true);
  next.players[seat].won = true;
  if (next.players.filter((candidate) => candidate.won).length >= 3) {
    next.phase = 'over';
    next.result = { kind: 'win', winners: next.players.filter((candidate) => candidate.won).map((candidate) => candidate.seat), loser: next.players.find((candidate) => !candidate.won)?.seat };
  } else {
    const following = nextActiveSeat(next, seat);
    if (following === null) return next;
    next.turn = following;
    next.phase = 'draw';
    next.log.push(`Seat ${seat} wins; Blood Battle continues.`);
  }
  return next;
}

/** A deterministic no-claim bot policy used by the first playable table slice. */
export function chooseRegionalDiscard(state: RegionalGameState, seat: Seat): Tile {
  const player = state.players[seat];
  const voidTile = player.voidSuit && player.hand.find((tile) => tileSuit(tile) === player.voidSuit);
  if (voidTile) return voidTile;
  // A lightweight, deterministic tile-efficiency policy: retain pairs and
  // connected suit tiles, then prefer discarding isolated honours/terminals.
  // It deliberately stays explainable rather than pretending to be a solver.
  const value = (tile: Tile) => {
    const suit = tileSuit(tile);
    const rank = tileRank(tile);
    let score = (countOf(player.hand, tile) - 1) * 3;
    if (suit === 'z') return score - 2;
    for (const gap of [-2, -1, 1, 2]) {
      const candidate = rank + gap;
      if (candidate >= 1 && candidate <= 9) score += countOf(player.hand, `${suit}${candidate}`);
    }
    if (rank === 1 || rank === 9) score -= 1;
    return score;
  };
  return [...player.hand].sort((a, b) => value(a) - value(b) || a.localeCompare(b))[0];
}

export type RegionalDiscardRisk = 'low' | 'medium' | 'high';

/** Conservative public-information risk indicator for the table UI and bots. */
export function regionalDiscardRisk(state: RegionalGameState, seat: Seat, tile: Tile): RegionalDiscardRisk {
  const kind = normalTile(tile);
  let danger = 0;
  for (const opponent of state.players) {
    if (opponent.seat === seat || opponent.won) continue;
    if (opponent.discards.some((discard) => normalTile(discard) === kind)) danger -= 2; // already safe against that seat
    const matchingExposure = opponent.melds.filter((meld) => meld.tiles.some((candidate) => normalTile(candidate) === kind)).length;
    danger += matchingExposure * 2;
    if (opponent.melds.length >= 2) danger += 1;
  }
  return danger <= -2 ? 'low' : danger >= 3 ? 'high' : 'medium';
}

/** Rebuild one hand from its seed plus every recorded player/bot decision. */
export function replayRegionalActions(source: Pick<RegionalGameState, 'ruleset' | 'seed' | 'players' | 'actions'>): RegionalGameState {
  const humanSeat = source.players.find((player) => !player.isBot)?.seat ?? 0;
  let state = createRegionalGame({ ruleset: source.ruleset, seed: source.seed, humanSeat });
  for (const action of source.actions) {
    while (state.phase === 'draw') state = drawRegionalTile(state);
    switch (action.type) {
      case 'exchange': state = submitSichuanExchange(state, action.seat, action.tiles); break;
      case 'void': state = chooseSichuanVoidSuit(state, action.seat, action.suit); break;
      case 'discard': state = discardRegionalTile(state, action.seat, action.tile, action.declaredReady); break;
      case 'claim': state = submitRegionalClaim(state, action.seat, action.option); break;
      case 'kan': state = declareRegionalKan(state, action.seat, action.tile); break;
      case 'tsumo': state = declareRegionalTsumo(state, action.seat); break;
    }
  }
  // The end state may be waiting for the next automatic draw, which is part of
  // the deterministic engine rather than a user decision.
  while (state.phase === 'draw') state = drawRegionalTile(state);
  return state;
}
