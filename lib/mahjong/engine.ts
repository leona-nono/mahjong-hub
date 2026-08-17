/**
 * Four-player mahjong state machine.
 *
 * The engine is deliberately UI-agnostic and deterministic: every game is
 * seeded, every transition is a pure `(state, action) -> state` function, and
 * nothing here touches React or the DOM. That keeps it unit-testable and lets
 * the same engine back a future server-authoritative multiplayer mode.
 */

import {
  buildWall,
  createRng,
  shuffle,
  sortTiles,
  toCounts,
  tileIndex,
  tileFromIndex,
  tileSuit,
  tileRank,
  isBonusTile,
  isRedFive,
  isSameKind,
  isTerminalOrHonour,
  isWind,
  WINDS,
  type Tile
} from './tiles';
import { decomposeWin, isWinningHand, shanten, waitingTiles } from './shanten';
import { scoreHand, type ScoreResult } from './scoring';

import { calculateRiichiPayment } from './riichi';
import { calculateHongKongPayment } from './hongkong';
import { calculateMcrPayment } from './chinese-official';
export type Seat = 0 | 1 | 2 | 3;

/** Ruleset presets. They share the engine and differ in scoring + legal calls. */
export type Ruleset = 'hongkong' | 'riichi' | 'chinese-official';
export type HongKongMode = 'casual' | 'standard';
/**
 * Japanese rule flavour.
 *
 * `wrc` is the World Riichi Championship ruleset this engine implements by
 * default, which deliberately abolishes every abortive draw — a hand is always
 * played to a win or an exhaustive draw. `standard` is the Tenhou / Mahjong
 * Soul flavour most players arriving from those clients expect, where nine
 * terminals, four winds and a spread fourth Kong abandon the hand.
 */
export type RiichiVariant = 'wrc' | 'standard';

export interface RulesetConfig {
  id: Ruleset;
  label: string;
  /** Minimum score required to declare a win (HK: 3 faan, CO: 8 points). */
  minimumScore: number;
  /** Whether sequences may be called from the player to the left. */
  allowChi: boolean;
  /** Seven pairs / thirteen orphans recognised as winning shapes. */
  allowSpecialHands: boolean;
  /** Tile kinds intentionally omitted from this ruleset's physical wall. */
  excludedTiles: readonly Tile[];
}

export const RULESETS: Record<Ruleset, RulesetConfig> = {
  hongkong: {
    id: 'hongkong',
    label: 'Hong Kong Old Style',
    minimumScore: 3,
    allowChi: true,
    allowSpecialHands: true,
    // Product rule: no Flowers/Seasons. All three Dragons are present, so the
    // Dragon fans (Big/Little Three Dragons, All Honours, the three-Dragon
    // 包牌 trigger) are actually reachable.
    excludedTiles: []
  },
  riichi: {
    id: 'riichi',
    label: 'Japanese Riichi',
    minimumScore: 1,
    allowChi: true,
    allowSpecialHands: true,
    excludedTiles: []
  },
  'chinese-official': {
    id: 'chinese-official',
    label: 'Chinese Official (MCR)',
    minimumScore: 8,
    allowChi: true,
    allowSpecialHands: true,
    excludedTiles: []
  }
};

export type MeldKind = 'chi' | 'pon' | 'kan';

export interface Meld {
  kind: MeldKind;
  /** Sorted tiles forming the meld. */
  tiles: Tile[];
  /** Seat the claimed tile came from; undefined for a concealed kan. */
  from?: Seat;
  concealed?: boolean;
}

export interface PlayerState {
  seat: Seat;
  hand: Tile[];
  melds: Meld[];
  discards: Tile[];
  /** MCR Flowers / Seasons already exposed and replaced from the back wall. */
  flowers: Tile[];
  seatWind: Tile;
  score: number;
  isBot: boolean;
  /** Set once the player has declared a ready hand (riichi ruleset). */
  declaredReady: boolean;
  /** True when Riichi was declared before any player had called a meld. */
  doubleReady: boolean;
  riichiPending: boolean;
  doubleRiichiPending: boolean;
  temporaryFuriten: boolean;
  ippatsuEligible: boolean;
  /** Drawn tile kept separately so a declared Riichi hand can only tsumogiri. */
  lastDrawn?: Tile;
  /** True only for the replacement draw immediately following a Kong. */
  lastDrawWasReplacement?: boolean;
}

export type Phase = 'draw' | 'discard' | 'claim' | 'added-kan-claim' | 'over';

export type ClaimKind = 'chi' | 'pon' | 'kan' | 'ron' | 'pass';

export interface ClaimOption {
  kind: ClaimKind;
  /** Tiles from the player's own hand used to make the meld. */
  tiles: Tile[];
}

/**
 * Why a hand ended without a winner. Everything except `exhaustive` is a WRC
 * abortive draw: the hand stops mid-play, nobody pays noten, and the dealer
 * keeps the seat.
 */
export type DrawReason = 'exhaustive' | 'nine-terminals' | 'four-winds' | 'four-kans';

export const ABORTIVE_DRAW_REASONS: readonly DrawReason[] = ['nine-terminals', 'four-winds', 'four-kans'];

export function isAbortiveDraw(result: GameResult | null): boolean {
  return result?.kind === 'draw' && result.reason !== undefined && ABORTIVE_DRAW_REASONS.includes(result.reason);
}

export interface GameResult {
  kind: 'win' | 'draw';
  /** Product-visible explanation for an exhaustive or abortive draw. */
  reason?: DrawReason;
  tenpaiSeats?: Seat[];
  /** Single winner (tsumo, or ron under HK / CO). */
  winner?: Seat;
  loser?: Seat;
  score?: ScoreResult;
  /**
   * Every winner of a ron. Only set for riichi double ron, where several seats
   * win the same discard and each is paid by the discarder.
   */
  winners?: Array<{ seat: Seat; loser?: Seat; score: ScoreResult }>;
}

export interface RiichiMatchResult {
  rankings: Array<{ seat: Seat; rank: number; score: number; uma: number; hanchanScore: number }>;
  /** WRC riichi deposits remain unclaimed when the hanchan ends. */
  remainingRiichiSticks: number;
}

export interface GameState {
  ruleset: Ruleset;
  /** Casual accepts chicken hands; standard enforces the three-Fan gate. */
  hongKongMode: HongKongMode;
  wall: Tile[];
  /** Index of the next tile to be drawn from the live wall. */
  wallIndex: number;
  /** Tiles reserved for kan replacements, drawn from the back. */
  deadWallIndex: number;
  players: PlayerState[];
  turn: Seat;
  phase: Phase;
  dealer: Seat;
  roundWind: Tile;
  /** Number of dealer changes since East 1; used to advance the prevailing wind. */
  handNumber: number;
  lastDiscard: { tile: Tile; from: Seat } | null;
  /** Pending claim options per seat, keyed by seat index. */
  claims: Partial<Record<Seat, ClaimOption[]>>;
  /** Claims already submitted this window. */
  submitted: Partial<Record<Seat, ClaimOption>>;
  /** Wall-clock time the current claim window opened, for the timeout fallback. */
  claimOpenedAt?: number;
  /** An exposed Pung that is waiting to become an Added Kong. */
  pendingAddedKan?: { seat: Seat; tile: Tile; meldIndex: number };
  /** Scoring-only context for the win currently being resolved. */
  winContext?: 'replacement' | 'rob-kong';
  /**
   * Hong Kong product 包牌 liability. Set only by the discard that completes
   * the fourth exposed meld or third exposed Dragon set. A concealed kan
   * never creates liability; a later qualifying call replaces the prior one.
   */
  hongKongLiability?: { seat: Seat; winner: Seat; reason: 'four-open-melds' | 'three-open-dragons' };
  /** WRC pao / responsibility payment, recorded when the decisive called set is made. */
  riichiLiabilities: Array<{ seat: Seat; winner: Seat; yakuman: 'bigThreeDragons' | 'bigFourWinds' | 'fourKans' }>;
  result: GameResult | null;
  log: string[];
  seed: number;
  riichiSticks: number;
  honba: number;
  /** A called meld prevents later first-turn Riichi from being Double Riichi. */
  callsMade: boolean;
  /** WRC has no abortive draws; the standard flavour does. */
  riichiVariant: RiichiVariant;
  /** Riichi product matches finish after South 4 once the dealer changes. */
  matchEnded?: boolean;
  matchResult?: RiichiMatchResult;
}

const DEAD_WALL_SIZE = 14;

/** How long a player gets to answer a claim window before auto-passing. */
export const CLAIM_TIMEOUT_MS = 8000;

export const SEATS: Seat[] = [0, 1, 2, 3];

export function nextSeat(seat: Seat): Seat {
  return ((seat + 1) % 4) as Seat;
}

/** Number of live tiles left to draw. */
export function tilesRemaining(state: GameState): number {
  return state.deadWallIndex - state.wallIndex;
}

/** Product-level Hong Kong win floor. Other variants use their preset. */
export function minimumWinScore(state: GameState): number {
  if (state.ruleset === 'hongkong') return state.hongKongMode === 'casual' ? 1 : 3;
  return RULESETS[state.ruleset].minimumScore;
}

export interface CreateGameOptions {
  ruleset?: Ruleset;
  seed?: number;
  hongKongMode?: HongKongMode;
  /** Defaults to WRC, which has no abortive draws. */
  riichiVariant?: RiichiVariant;
  /** Seat controlled by the person playing; the rest are bots. */
  humanSeat?: Seat;
}

export function createGame(options: CreateGameOptions = {}): GameState {
  const ruleset = options.ruleset ?? 'hongkong';
  const hongKongMode = options.hongKongMode ?? 'standard';
  const riichiVariant = options.riichiVariant ?? 'wrc';
  const seed = options.seed ?? Math.floor(Math.random() * 2 ** 31);
  const humanSeat = options.humanSeat ?? 0;
  const rng = createRng(seed);
  const wall = shuffle(
    buildWall(
      RULESETS[ruleset].excludedTiles,
      ruleset === 'chinese-official',
      // Red fives are a Tenhou / Mahjong Soul table rule; WRC plays without.
      ruleset === 'riichi' && riichiVariant === 'standard'
    ),
    rng
  );

  const players: PlayerState[] = SEATS.map((seat) => ({
    seat,
    hand: [],
    melds: [],
    discards: [],
    flowers: [],
    seatWind: WINDS[seat],
    score: ruleset === 'riichi' ? 30000 : 78000,
    isBot: seat !== humanSeat,
    declaredReady: false,
    doubleReady: false,
    riichiPending: false,
    doubleRiichiPending: false,
    temporaryFuriten: false,
    ippatsuEligible: false
  }));

  let index = 0;
  let replacementIndex = wall.length - DEAD_WALL_SIZE;
  const dealPlayableTile = (seat: Seat) => {
    let tile = wall[index++];
    while (isBonusTile(tile)) {
      players[seat].flowers.push(tile);
      tile = wall[replacementIndex++];
    }
    players[seat].hand.push(tile);
  };
  for (let round = 0; round < 13; round += 1) {
    for (const seat of SEATS) {
      dealPlayableTile(seat);
    }
  }
  for (const player of players) player.hand = sortTiles(player.hand);

  const state: GameState = {
    ruleset,
    hongKongMode,
    wall,
    wallIndex: index,
    deadWallIndex: replacementIndex,
    players,
    turn: 0,
    phase: 'draw',
    dealer: 0,
    roundWind: WINDS[0],
    handNumber: 0,
    lastDiscard: null,
    claims: {},
    submitted: {},
    result: null,
    log: [],
    seed,
    riichiSticks: 0,
    honba: 0,
    callsMade: false,
    riichiVariant,
    riichiLiabilities: []
  };

  return state;
}

/**
 * Deal the next hand while preserving the table score, dealer progression,
 * honba and any unclaimed Riichi sticks. New Game remains the explicit way to
 * start a fresh match from the opening score.
 */
export function startNextHand(state: GameState): GameState {
  if (state.phase !== 'over') return state;
  // A double ron has no single `winner`; the dealer continues if it is among
  // the winning seats.
  const winnerSeats = state.result?.winners?.map((entry) => entry.seat)
    ?? (state.result?.winner === undefined ? [] : [state.result.winner]);
  const dealerKeepsSeat = state.result?.kind === 'draw'
    ? isAbortiveDraw(state.result) || Boolean(state.result.tenpaiSeats?.includes(state.dealer))
    : winnerSeats.includes(state.dealer);
  const dealer = dealerKeepsSeat ? state.dealer : nextSeat(state.dealer);
  const handNumber = state.handNumber + (dealerKeepsSeat ? 0 : 1);
  // East/South match: South 4 is the final scheduled hand. A dealer
  // continuation stays in South 4; a dealer change ends the match.
  if (state.ruleset === 'riichi' && state.handNumber === 7 && !dealerKeepsSeat) {
    const finished = clone(state);
    finished.matchEnded = true;
    finished.matchResult = calculateRiichiMatchResult(finished);
    finished.log.push('South round complete: WRC hanchan ends.');
    return finished;
  }
  const humanSeat = state.players.find((player) => !player.isBot)?.seat ?? 0;
  const next = createGame({
    ruleset: state.ruleset,
    hongKongMode: state.hongKongMode,
    riichiVariant: state.riichiVariant,
    humanSeat,
    seed: state.seed + 1
  });
  next.dealer = dealer;
  next.handNumber = handNumber;
  next.roundWind = WINDS[Math.floor(handNumber / 4) % 4];
  next.honba = state.honba;
  next.riichiSticks = state.riichiSticks;
  next.matchEnded = false;
  next.matchResult = undefined;
  for (const seat of SEATS) {
    next.players[seat].score = state.players[seat].score;
    next.players[seat].seatWind = WINDS[(seat - dealer + 4) % 4];
  }
  next.log = [...state.log, `Next hand: ${next.roundWind} ${handNumber % 4 + 1}; dealer seat ${dealer}.`];
  return next;
}

function clone(state: GameState): GameState {
  return {
    ...state,
    wall: state.wall,
    players: state.players.map((p) => ({
      ...p,
      hand: [...p.hand],
      melds: p.melds.map((m) => ({ ...m, tiles: [...m.tiles] })),
      discards: [...p.discards],
      flowers: [...p.flowers]
    })),
    claims: { ...state.claims },
    submitted: { ...state.submitted },
    pendingAddedKan: state.pendingAddedKan ? { ...state.pendingAddedKan } : undefined,
    riichiLiabilities: state.riichiLiabilities.map((liability) => ({ ...liability })),
    log: [...state.log]
  };
}

function removeTile(hand: Tile[], tile: Tile): boolean {
  const at = hand.indexOf(tile);
  if (at === -1) return false;
  hand.splice(at, 1);
  return true;
}

/**
 * Take one tile of a kind out of a hand and return the copy actually removed.
 *
 * Melds and Kongs are requested by kind, but which physical copy leaves the
 * hand matters: a red five carries a dora with it. Ordinary copies go first so
 * a player never loses a red five they could have kept.
 */
function takeTileOfKind(hand: Tile[], kind: Tile): Tile | null {
  const plain = hand.findIndex((tile) => tile === kind);
  const at = plain >= 0 ? plain : hand.findIndex((tile) => isSameKind(tile, kind));
  if (at === -1) return null;
  const [removed] = hand.splice(at, 1);
  return removed;
}

function handCounts(player: PlayerState): number[] {
  return toCounts(player.hand);
}

/** Kan melds each absorb an extra tile, so count them as one set for shanten. */
function meldCount(player: PlayerState): number {
  return player.melds.length;
}

/** Draw the next live tile for the current player. */
export function drawTile(state: GameState): GameState {
  if (state.phase !== 'draw') return state;
  const next = clone(state);
  const tenpai: Seat[] = [];

  if (tilesRemaining(next) <= 0) {
    next.phase = 'over';
    if (next.ruleset === 'riichi') {
      tenpai.push(...SEATS.filter((seat) => seatShanten(next, seat) === 0));
      if (tenpai.length > 0 && tenpai.length < 4) {
        const gain = 3000 / tenpai.length;
        const loss = 3000 / (4 - tenpai.length);
        for (const seat of SEATS) {
          if (tenpai.includes(seat)) next.players[seat].score += gain;
          else next.players[seat].score -= loss;
        }
      }
      next.honba += 1;
      next.log.push('Exhaustive draw: 3,000-point noten payment settled.');
    }
    next.result = {
      kind: 'draw',
      reason: 'exhaustive',
      tenpaiSeats: next.ruleset === 'riichi' ? tenpai : undefined
    };
    next.log.push('Wall exhausted — the hand is drawn.');
    return next;
  }

  let tile = next.wall[next.wallIndex];
  next.wallIndex += 1;
  const player = next.players[next.turn];
  while (next.ruleset === 'chinese-official' && isBonusTile(tile)) {
    player.flowers.push(tile);
    next.log.push(`Seat ${next.turn} exposes ${tile} and draws a flower replacement.`);
    if (next.deadWallIndex >= next.wall.length) {
      next.phase = 'over';
      next.result = { kind: 'draw', reason: 'exhaustive' };
      return next;
    }
    tile = next.wall[next.deadWallIndex];
    next.deadWallIndex += 1;
  }
  player.hand = sortTiles([...player.hand, tile]);
  player.lastDrawn = tile;
  player.lastDrawWasReplacement = false;
  if (!player.declaredReady) player.temporaryFuriten = false;
  next.phase = 'discard';
  next.lastDiscard = null;
  return next;
}

/** Draw a replacement tile after a kan, taken from the dead wall. */
function drawReplacement(state: GameState, seat: Seat): void {
  if (state.deadWallIndex >= state.wall.length) return;
  let tile = state.wall[state.deadWallIndex];
  state.deadWallIndex += 1;
  while (state.ruleset === 'chinese-official' && isBonusTile(tile)) {
    state.players[seat].flowers.push(tile);
    state.log.push(`Seat ${seat} exposes ${tile} and draws a flower replacement.`);
    if (state.deadWallIndex >= state.wall.length) return;
    tile = state.wall[state.deadWallIndex];
    state.deadWallIndex += 1;
  }
  state.players[seat].hand = sortTiles([...state.players[seat].hand, tile]);
  state.players[seat].lastDrawn = tile;
  state.players[seat].lastDrawWasReplacement = true;
}

export interface SelfDrawEvaluation {
  complete: boolean;
  legal: boolean;
  score: ScoreResult | null;
  minimum: number;
}

/** Distinguish a complete shape from a legal win that clears the score floor. */
export function evaluateSelfDraw(state: GameState, seat: Seat): SelfDrawEvaluation {
  const player = state.players[seat];
  const minimum = minimumWinScore(state);
  if (player.hand.length % 3 !== 2) {
    return { complete: false, legal: false, score: null, minimum };
  }
  const complete = isWinningHand(handCounts(player), meldCount(player), state.ruleset);
  if (!complete) return { complete: false, legal: false, score: null, minimum };
  const score = scoreHand({
    state,
    seat,
    winningTile: player.hand[player.hand.length - 1],
    selfDrawn: true
  });
  const legal = state.ruleset === 'riichi'
    ? Boolean(score.legalYaku)
    : (state.ruleset === 'chinese-official'
      ? (score.qualifyingTotal ?? score.total) >= minimum
      : score.total >= minimum);
  return { complete: true, legal, score, minimum };
}

/** Can this seat declare a self-drawn win right now? */
export function canDeclareTsumo(state: GameState, seat: Seat): boolean {
  return evaluateSelfDraw(state, seat).legal;
}

/** Discards that leave a closed Riichi hand in tenpai. */
export function availableRiichiDiscards(state: GameState, seat: Seat): Tile[] {
  if (state.ruleset !== 'riichi' || state.phase !== 'discard' || state.turn !== seat) return [];
  const player = state.players[seat];
  if (player.declaredReady || player.melds.some((meld) => !meld.concealed)) return [];
  const candidates = new Set<Tile>();
  for (const tile of player.hand) {
    const hand = [...player.hand];
    if (!removeTile(hand, tile)) continue;
    if (shanten(toCounts(hand), meldCount(player), 'riichi') === 0) candidates.add(tile);
  }
  return [...candidates];
}

/** Arm Riichi; the declaration becomes final on a highlighted tenpai discard. */
export function declareRiichi(state: GameState, seat: Seat): GameState {
  if (availableRiichiDiscards(state, seat).length === 0) return state;
  const next = clone(state);
  next.players[seat].riichiPending = true;
  next.players[seat].doubleRiichiPending = next.players[seat].discards.length === 0 && !next.callsMade;
  next.log.push('Seat ' + seat + ' announces riichi.');
  return next;
}
/** Concealed kans available on the current draw. */
export function availableConcealedKans(state: GameState, seat: Seat): Tile[] {
  if (state.phase !== 'discard' || state.turn !== seat) return [];
  const player = state.players[seat];
  if (state.ruleset === 'riichi' && totalKans(state) >= 4) return [];
  if (player.hand.length % 3 !== 2) return [];
  const counts = handCounts(player);
  const tiles: Tile[] = [];
  for (let i = 0; i < counts.length; i += 1) {
    if (counts[i] !== 4) continue;
    const tile = tileFromIndex(i);
    if (!player.declaredReady || riichiKanPreservesWaits(state, seat, tile)) tiles.push(tile);
  }
  return tiles;
}

/** WRC product rule: a Riichi ankan is legal only when its wait set is unchanged. */
function riichiKanPreservesWaits(state: GameState, seat: Seat, tile: Tile): boolean {
  const player = state.players[seat];
  if (!player.lastDrawn) return false;
  const before = [...player.hand];
  if (!removeTile(before, player.lastDrawn)) return false;
  const after = [...player.hand];
  for (let i = 0; i < 4; i += 1) {
    if (!removeTile(after, tile)) return false;
  }
  const beforeWaits = waitingTiles(toCounts(before), meldCount(player), 'riichi').sort();
  const afterWaits = waitingTiles(toCounts(after), meldCount(player) + 1, 'riichi').sort();
  const fixedTripletForEveryWait = beforeWaits.every((wait) => {
    const winning = toCounts([...before, wait]);
    const sets = decomposeWin(winning, meldCount(player));
    return sets?.some((set) => set.kind === 'triplet' && set.tile === tile);
  });
  return beforeWaits.length > 0 && fixedTripletForEveryWait && beforeWaits.length === afterWaits.length && beforeWaits.every((value, index) => value === afterWaits[index]);
}

/** Added Kongs: promote an already exposed Pung with a self-drawn fourth tile. */
export function availableAddedKans(state: GameState, seat: Seat): Tile[] {
  if (state.ruleset !== 'hongkong' && state.ruleset !== 'riichi') return [];
  if (state.phase !== 'discard' || state.turn !== seat) return [];
  if (state.ruleset === 'riichi' && totalKans(state) >= 4) return [];
  const player = state.players[seat];
  return player.melds
    .filter((meld) => meld.kind === 'pon' && !meld.concealed && player.hand.some((tile) => isSameKind(tile, meld.tiles[0])))
    .map((meld) => meld.tiles[0]);
}

export function availableKans(state: GameState, seat: Seat): Tile[] {
  return [...new Set([...availableConcealedKans(state, seat), ...availableAddedKans(state, seat)])];
}

export function declareConcealedKan(state: GameState, seat: Seat, tile: Tile): GameState {
  if (!availableConcealedKans(state, seat).includes(tile)) return state;
  const next = clone(state);
  const player = next.players[seat];
  const taken: Tile[] = [];
  for (let i = 0; i < 4; i += 1) {
    const removed = takeTileOfKind(player.hand, tile);
    if (removed) taken.push(removed);
  }
  player.melds.push({ kind: 'kan', tiles: sortTiles(taken), concealed: true });
  next.callsMade = true;
  drawReplacement(next, seat);
  // Any call, including a concealed kan, breaks ippatsu for every declared
  // Riichi hand. The next Dora indicator is derived from the kan count.
  if (next.ruleset === 'riichi') {
    for (const participant of next.players) participant.ippatsuEligible = false;
  }
  next.log.push(`Seat ${seat} declares a concealed kan.`);
  next.phase = 'discard';
  return next;
}

/**
 * Announce an Added Kong. The fourth tile remains available for a Robbing the
 * Kong win until every eligible opponent has passed or claimed Ron.
 */
export function declareAddedKan(state: GameState, seat: Seat, tile: Tile, now = Date.now()): GameState {
  if (state.ruleset !== 'hongkong' && state.ruleset !== 'riichi') return state;
  if (!availableAddedKans(state, seat).includes(tile)) return state;
  const next = clone(state);
  const meldIndex = next.players[seat].melds.findIndex(
    (meld) => meld.kind === 'pon' && !meld.concealed && meld.tiles[0] === tile
  );
  if (meldIndex < 0) return state;
  const claims: Partial<Record<Seat, ClaimOption[]>> = {};
  for (const claimant of SEATS) {
    if (claimant === seat) continue;
    const player = next.players[claimant];
    const counts = handCounts(player);
    counts[tileIndex(tile)] += 1;
    if (!isWinningHand(counts, meldCount(player), next.ruleset)) continue;
    const score = scoreHand({ state: { ...next, winContext: 'rob-kong' }, seat: claimant, winningTile: tile, selfDrawn: false });
    const legal = next.ruleset === 'riichi' ? Boolean(score.legalYaku) : score.total >= minimumWinScore(next);
    if (legal) claims[claimant] = [{ kind: 'ron', tiles: [tile] }, { kind: 'pass', tiles: [] }];
  }
  if (Object.keys(claims).length === 0) return completeAddedKan(next, seat, tile, meldIndex);
  next.pendingAddedKan = { seat, tile, meldIndex };
  next.claims = claims;
  next.submitted = {};
  next.claimOpenedAt = now;
  next.phase = 'added-kan-claim';
  next.log.push(`Seat ${seat} declares an added kan; rob-kong window opens.`);
  return next;
}

function completeAddedKan(state: GameState, seat: Seat, tile: Tile, meldIndex: number): GameState {
  const player = state.players[seat];
  const promoted = takeTileOfKind(player.hand, tile);
  if (!promoted) return state;
  const existing = player.melds[meldIndex];
  player.melds[meldIndex] = { ...existing, kind: 'kan', tiles: sortTiles([...existing.tiles, promoted]) };
  state.callsMade = true;
  drawReplacement(state, seat);
  state.turn = seat;
  state.phase = 'discard';
  state.lastDiscard = null;
  state.pendingAddedKan = undefined;
  if (state.ruleset === 'riichi') {
    for (const participant of state.players) participant.ippatsuEligible = false;
  }
  state.log.push(`Seat ${seat} completes an added kan.`);
  return state;
}

/** Choose the appropriate concealed or added Kong for a tile. */
export function declareKan(state: GameState, seat: Seat, tile: Tile): GameState {
  if (availableConcealedKans(state, seat).includes(tile)) return declareConcealedKan(state, seat, tile);
  return declareAddedKan(state, seat, tile);
}

/**
 * Discard a tile from the current player's hand.
 * `now` is the wall-clock time the discard happened; when it opens a claim
 * window we record it so the UI can auto-pass a silent player after a timeout.
 */
export function discard(state: GameState, tile: Tile, now = Date.now()): GameState {
  if (state.phase !== 'discard') return state;
  const next = clone(state);
  const player = next.players[next.turn];
  const confirmingRiichi = player.riichiPending;
  if (player.declaredReady && tile !== player.lastDrawn) return state;
  if (player.riichiPending && !availableRiichiDiscards(state, next.turn).includes(tile)) {
    return state;
  }
  if (!removeTile(player.hand, tile)) return state;
  if (player.riichiPending) {
    player.riichiPending = false;
    player.declaredReady = true;
    player.doubleReady = player.doubleRiichiPending;
    player.doubleRiichiPending = false;
    player.score -= 1000;
    player.ippatsuEligible = true;
    next.riichiSticks += 1;
    next.log.push('Riichi declared: 1,000-point stick placed.');
  }
  if (!confirmingRiichi && player.ippatsuEligible) {
    player.ippatsuEligible = false;
  }
  player.hand = sortTiles(player.hand);
  player.lastDrawn = undefined;
  player.lastDrawWasReplacement = false;
  player.discards.push(tile);
  next.lastDiscard = { tile, from: next.turn };

  // Both automatic aborts are decided by the completed discard, before anyone
  // is offered the tile.
  if (isFourWindAbort(next)) {
    next.log.push('Four identical wind discards open the hand: abortive draw.');
    return endInAbortiveDraw(next, 'four-winds');
  }
  if (isFourKanAbort(next)) {
    next.log.push('A fourth Kong is on the table across several seats: abortive draw.');
    return endInAbortiveDraw(next, 'four-kans');
  }

  next.claims = collectClaims(next, tile, next.turn);
  next.submitted = {};

  if (Object.keys(next.claims).length === 0) {
    return advanceAfterUnclaimedDiscard(next);
  } else {
    next.claimOpenedAt = now;
    next.phase = 'claim';
  }
  return next;
}

/**
 * 九種九牌: on an untouched first turn a player holding nine or more distinct
 * terminals and honours may abort the hand rather than play it out.
 */
export function canDeclareNineTerminals(state: GameState, seat: Seat): boolean {
  if (state.ruleset !== 'riichi' || state.riichiVariant !== 'standard') return false;
  if (state.phase !== 'discard' || state.turn !== seat) return false;
  const player = state.players[seat];
  if (player.discards.length > 0 || state.callsMade || player.melds.length > 0) return false;
  // Only the very first go-around counts: nobody may have drawn twice yet.
  if (state.players.some((other) => other.discards.length > 1)) return false;
  const kinds = new Set(player.hand.filter(isTerminalOrHonour));
  return kinds.size >= 9;
}

export function declareNineTerminals(state: GameState, seat: Seat): GameState {
  if (!canDeclareNineTerminals(state, seat)) return state;
  const next = clone(state);
  next.log.push(`Seat ${seat} declares nine terminals and honours; the hand is abandoned.`);
  return endInAbortiveDraw(next, 'nine-terminals');
}

/** Settle an abortive draw: no payments, the honba advances, the dealer stays. */
function endInAbortiveDraw(state: GameState, reason: DrawReason): GameState {
  state.phase = 'over';
  state.claims = {};
  state.submitted = {};
  state.honba += 1;
  state.result = { kind: 'draw', reason };
  return state;
}

/** 四風連打: four identical wind discards open the hand with no call between. */
function isFourWindAbort(state: GameState): boolean {
  if (state.ruleset !== 'riichi' || state.riichiVariant !== 'standard' || state.callsMade) return false;
  if (!state.players.every((player) => player.discards.length === 1)) return false;
  const [first] = state.players[0].discards;
  return isWind(first) && state.players.every((player) => player.discards[0] === first);
}

/** 四槓散了: a fourth Kong on the table while no single seat holds them all. */
function isFourKanAbort(state: GameState): boolean {
  if (state.ruleset !== 'riichi' || state.riichiVariant !== 'standard' || totalKans(state) < 4) return false;
  const owners = state.players.filter((player) => player.melds.some((meld) => meld.kind === 'kan'));
  return owners.length > 1;
}

/** WRC final scoring: no oka, +15/+5/-5/-15 uma, split on equal scores. */
export function calculateRiichiMatchResult(state: GameState): RiichiMatchResult {
  const ordered = [...SEATS].sort((a, b) => state.players[b].score - state.players[a].score);
  const umas = [15, 5, -5, -15];
  const rankings: RiichiMatchResult['rankings'] = [];
  let offset = 0;
  while (offset < ordered.length) {
    const score = state.players[ordered[offset]].score;
    const tied = ordered.slice(offset).filter((seat) => state.players[seat].score === score);
    const uma = umas.slice(offset, offset + tied.length).reduce((sum, value) => sum + value, 0) / tied.length;
    for (const seat of tied) {
      rankings.push({ seat, rank: offset + 1, score, uma, hanchanScore: (score - 30000) / 1000 + uma });
    }
    offset += tied.length;
  }
  return { rankings, remainingRiichiSticks: state.riichiSticks };
}

function advanceAfterUnclaimedDiscard(state: GameState): GameState {
  state.turn = nextSeat(state.turn);
  state.phase = 'draw';
  return state;
}

function totalKans(state: GameState): number {
  return state.players.reduce((total, player) => total + player.melds.filter((meld) => meld.kind === 'kan').length, 0);
}

/**
 * Auto-pass every seat that has not answered an open claim window once the
 * window's deadline has passed. Used as a safety net for a silent human player;
 * bots answer their own windows on a timer. Returns the state unchanged while
 * the window is still open.
 */
export function passUnansweredClaims(state: GameState, now: number): GameState {
  if (state.phase !== 'claim' && state.phase !== 'added-kan-claim') return state;
  if (now - (state.claimOpenedAt ?? now) < CLAIM_TIMEOUT_MS) return state;

  const next = clone(state);
  for (const seat of Object.keys(next.claims).map(Number) as Seat[]) {
    if (next.submitted[seat] === undefined) {
      next.submitted[seat] = { kind: 'pass', tiles: [] };
    }
  }
  return maybeResolveClaims(next);
}

/** Work out what every other seat could call on the discarded tile. */
export function isPermanentFuriten(state: GameState, seat: Seat): boolean {
  if (state.ruleset !== 'riichi') return false;
  const player = state.players[seat];
  const waits = waitingTiles(handCounts(player), meldCount(player), 'riichi');
  return waits.some((tile) => player.discards.includes(tile));
}

function collectClaims(
  state: GameState,
  tile: Tile,
  from: Seat
): Partial<Record<Seat, ClaimOption[]>> {
  const config = RULESETS[state.ruleset];
  const minimum = minimumWinScore(state);
  const claims: Partial<Record<Seat, ClaimOption[]>> = {};

  for (const seat of SEATS) {
    if (seat === from) continue;
    const player = state.players[seat];
    const options: ClaimOption[] = [];
    const counts = handCounts(player);
    const index = tileIndex(tile);

    // Ron — completing the hand on someone else's discard.
    const test = [...counts];
    test[index] += 1;
    const blockedByFuriten = state.ruleset === 'riichi' && (
      player.temporaryFuriten || isPermanentFuriten(state, seat)
    );
    if (!blockedByFuriten && isWinningHand(test, meldCount(player), state.ruleset)) {
      const score = scoreHand({ state, seat, winningTile: tile, selfDrawn: false });
    const meetsMinimum = state.ruleset === 'chinese-official'
      ? (score.qualifyingTotal ?? score.total) >= minimum
      : score.total >= minimum;
    if (state.ruleset === 'riichi' ? score.legalYaku : meetsMinimum) {
        options.push({ kind: 'ron', tiles: [tile] });
      }
    }

    // Pon and kan — available to any seat.
    if (counts[index] >= 2) options.push({ kind: 'pon', tiles: [tile, tile] });
    if (counts[index] >= 3) options.push({ kind: 'kan', tiles: [tile, tile, tile] });

    // Chi — only from the player to the left, numbered suits only.
    if (config.allowChi && seat === nextSeat(from) && tileSuit(tile) !== 'z') {
      const rank = tileRank(tile);
      const suit = tileSuit(tile);
      const has = (r: number) => r >= 1 && r <= 9 && counts[tileIndex(`${suit}${r}`)] > 0;
      if (has(rank - 2) && has(rank - 1)) {
        options.push({ kind: 'chi', tiles: [`${suit}${rank - 2}`, `${suit}${rank - 1}`] });
      }
      if (has(rank - 1) && has(rank + 1)) {
        options.push({ kind: 'chi', tiles: [`${suit}${rank - 1}`, `${suit}${rank + 1}`] });
      }
      if (has(rank + 1) && has(rank + 2)) {
        options.push({ kind: 'chi', tiles: [`${suit}${rank + 1}`, `${suit}${rank + 2}`] });
      }
    }

    if (options.length > 0) claims[seat] = options;
  }

  return claims;
}

const CLAIM_PRIORITY: Record<ClaimKind, number> = {
  ron: 4,
  kan: 3,
  pon: 2,
  chi: 1,
  pass: 0
};

/** Record one seat's decision during a claim window. */
export function submitClaim(
  state: GameState,
  seat: Seat,
  option: ClaimOption
): GameState {
  if (state.phase !== 'claim' && state.phase !== 'added-kan-claim') return state;
  const next = clone(state);
  if (state.ruleset === 'riichi' && option.kind === 'pass' &&
      state.claims[seat]?.some((claim) => claim.kind === 'ron')) {
    next.players[seat].temporaryFuriten = true;
  }

  next.submitted[seat] = option;
  return maybeResolveClaims(next);
}

/** Resolve the claim window once every eligible seat has answered. */
export function maybeResolveClaims(state: GameState): GameState {
  const pending = Object.keys(state.claims).map(Number) as Seat[];
  const answered = pending.every((seat) => state.submitted[seat] !== undefined);
  if (!answered) return state;

  const next = clone(state);
  if (next.phase === 'added-kan-claim' && next.pendingAddedKan) {
    const pendingKan = next.pendingAddedKan;
    const ronSeats = pending.filter((seat) => next.submitted[seat]!.kind === 'ron');
    next.claims = {};
    next.submitted = {};
    if (ronSeats.length > 0) {
      next.winContext = 'rob-kong';
      next.pendingAddedKan = undefined;
      // A robbed Kong resolves like any other claimed tile, double ron included.
      if (ronSeats.length >= 2 && next.ruleset === 'riichi') {
        return finishWithDoubleRon(next, ronSeats, { tile: pendingKan.tile, from: pendingKan.seat });
      }
      const winner = ronSeats.sort((a, b) => ((a - pendingKan.seat + 4) % 4) - ((b - pendingKan.seat + 4) % 4))[0];
      return finishWithWin(next, winner, pendingKan.tile, false, pendingKan.seat);
    }
    return completeAddedKan(next, pendingKan.seat, pendingKan.tile, pendingKan.meldIndex);
  }
  const discardInfo = next.lastDiscard!;

  // Riichi: every seat that declared ron wins the same discard, and the
  // discarder pays each of them. HK / CO keep the single lowest-seat winner.
  const ronSeats = pending.filter(
    (seat) => next.submitted[seat]!.kind === 'ron'
  );
  if (ronSeats.length >= 2 && next.ruleset === 'riichi') {
    next.claims = {};
    next.submitted = {};
    return finishWithDoubleRon(next, ronSeats, discardInfo);
  }

  let best: { seat: Seat; option: ClaimOption } | null = null;
  for (const seat of pending) {
    const option = next.submitted[seat]!;
    if (option.kind === 'pass') continue;
    if (!best || CLAIM_PRIORITY[option.kind] > CLAIM_PRIORITY[best.option.kind]) {
      best = { seat, option };
    }
  }

  next.claims = {};
  next.submitted = {};

  if (!best) {
    return advanceAfterUnclaimedDiscard(next);
  }

  if (best.option.kind === 'ron') {
    return finishWithWin(next, best.seat, discardInfo.tile, false, discardInfo.from);
  }

  // The claimed tile leaves the discard pile and joins the caller's meld.
  const discarder = next.players[discardInfo.from];
  discarder.discards.pop();

  const caller = next.players[best.seat];
  const contributed: Tile[] = [];
  for (const tile of best.option.tiles) {
    const removed = takeTileOfKind(caller.hand, tile);
    if (removed) contributed.push(removed);
  }
  caller.hand = sortTiles(caller.hand);
  caller.lastDrawn = undefined;

  const meldTiles = sortTiles([...contributed, discardInfo.tile]);
  const kind: MeldKind =
    best.option.kind === 'chi' ? 'chi' : best.option.kind === 'kan' ? 'kan' : 'pon';
  caller.melds.push({ kind, tiles: meldTiles, from: discardInfo.from });
  recordHongKongLiability(next, best.seat, discardInfo.from);
  recordRiichiLiability(next, best.seat, discardInfo.from, kind);
  next.callsMade = true;
  if (next.ruleset === 'riichi') {
    for (const participant of next.players) participant.ippatsuEligible = false;
  }
  next.log.push(`Seat ${best.seat} calls ${best.option.kind}.`);

  if (kind === 'kan') drawReplacement(next, best.seat);

  next.turn = best.seat;
  next.phase = 'discard';
  next.lastDiscard = null;
  return next;
}

/** Record the product-defined Hong Kong 包牌 trigger at the moment of the call. */
function recordHongKongLiability(state: GameState, callerSeat: Seat, providerSeat: Seat): void {
  if (state.ruleset !== 'hongkong') return;
  const exposed = state.players[callerSeat].melds.filter((meld) => !meld.concealed);
  const dragonMelds = exposed.filter((meld) => ['z5', 'z6', 'z7'].includes(meld.tiles[0])).length;
  if (dragonMelds >= 3) {
    state.hongKongLiability = { seat: providerSeat, winner: callerSeat, reason: 'three-open-dragons' };
    state.log.push(`Hong Kong 包牌: seat ${providerSeat} supplied the third exposed Dragon set.`);
  } else if (exposed.length >= 4) {
    state.hongKongLiability = { seat: providerSeat, winner: callerSeat, reason: 'four-open-melds' };
    state.log.push(`Hong Kong 包牌: seat ${providerSeat} supplied the fourth exposed meld.`);
  }
}

/** WRC 2025 pao: third called dragon, fourth called wind, or fourth called quad. */
function recordRiichiLiability(
  state: GameState,
  callerSeat: Seat,
  providerSeat: Seat,
  kind: MeldKind
): void {
  if (state.ruleset !== 'riichi') return;
  const melds = state.players[callerSeat].melds;
  const has = (yakuman: 'bigThreeDragons' | 'bigFourWinds' | 'fourKans') =>
    state.riichiLiabilities.some((entry) => entry.winner === callerSeat && entry.yakuman === yakuman);
  const add = (yakuman: 'bigThreeDragons' | 'bigFourWinds' | 'fourKans', message: string) => {
    if (has(yakuman)) return;
    state.riichiLiabilities.push({ seat: providerSeat, winner: callerSeat, yakuman });
    state.log.push(`WRC pao: seat ${providerSeat} is liable for ${message} by seat ${callerSeat}.`);
  };
  const dragonSets = melds.filter((meld) => meld.kind !== 'chi' && ['z5', 'z6', 'z7'].includes(meld.tiles[0])).length;
  const windSets = melds.filter((meld) => meld.kind !== 'chi' && ['z1', 'z2', 'z3', 'z4'].includes(meld.tiles[0])).length;
  if (dragonSets >= 3) add('bigThreeDragons', 'Big Three Dragons');
  if (windSets >= 4) add('bigFourWinds', 'Big Four Winds');
  if (kind === 'kan' && melds.filter((meld) => meld.kind === 'kan').length >= 4) add('fourKans', 'Four Kans');
}

/** Declare a self-drawn win for the seat currently holding 14 tiles. */
export function declareTsumo(state: GameState, seat: Seat): GameState {
  if (!evaluateSelfDraw(state, seat).legal) return state;
  const player = state.players[seat];
  const winningTile = player.hand[player.hand.length - 1];
  return finishWithWin(clone(state), seat, winningTile, true);
}

/**
 * Riichi double ron: every seat that declared ron wins the same discard and the
 * discarder pays each of them in full. The winner nearest the discarder in turn
 * order — the head-bump seat — additionally collects the unclaimed Riichi
 * deposits and the honba bonus, which are only ever paid once.
 */
function finishWithDoubleRon(
  state: GameState,
  ronSeats: Seat[],
  discardInfo: { tile: Tile; from: Seat }
): GameState {
  const ordered = [...ronSeats].sort(
    (a, b) => ((a - discardInfo.from + 4) % 4) - ((b - discardInfo.from + 4) % 4)
  );
  const winners = ordered.map((seat, index) => {
    const score = scoreHand({
      state,
      seat,
      winningTile: discardInfo.tile,
      selfDrawn: false
    });
    const liability = state.riichiLiabilities.find((entry) =>
      entry.winner === seat && score.patterns.some((pattern) => pattern.id === entry.yakuman)
    );
    const payment = calculateRiichiPayment({
      han: score.han ?? score.total,
      fu: score.fu ?? 30,
      winner: seat,
      dealer: state.dealer,
      selfDrawn: false,
      honba: index === 0 ? state.honba : 0,
      yakumanCount: score.yakumanCount,
      loser: discardInfo.from,
      liability: liability ? { seat: liability.seat, yakumanCount: 1 } : undefined
    });
    score.points = payment.winnerGain;
    score.paymentLabel = payment.label;
    // Pao spreads the settlement across seats; without it the discarder alone
    // pays, exactly as in a single ron.
    if (Object.keys(payment.payments).length > 0) {
      for (const payer of SEATS) {
        if (payer === seat) continue;
        state.players[payer].score -= payment.payments[payer] ?? 0;
      }
    } else {
      state.players[discardInfo.from].score -= payment.winnerGain;
    }
    state.players[seat].score += payment.winnerGain;
    return { seat, loser: discardInfo.from, score };
  });
  if (state.riichiSticks > 0) {
    state.players[ordered[0]].score += state.riichiSticks * 1000;
    state.riichiSticks = 0;
  }
  state.honba = ordered.includes(state.dealer) ? state.honba + 1 : 0;
  state.claims = {};
  state.submitted = {};
  state.phase = 'over';
  state.result = { kind: 'win', winners };
  state.log.push(
    `Seat ${discardInfo.from} deals in to seats ${ordered.join(' & ')} for a double ron.`
  );
  return state;
}

function finishWithWin(
  state: GameState,
  seat: Seat,
  winningTile: Tile,
  selfDrawn: boolean,
  loser?: Seat
): GameState {
  const score = scoreHand({ state, seat, winningTile, selfDrawn });
  state.phase = 'over';
  state.result = { kind: 'win', winner: seat, loser, score };
  if (state.ruleset === 'riichi') {
    const liability = state.riichiLiabilities.find((entry) =>
      entry.winner === seat && score.patterns.some((pattern) => pattern.id === entry.yakuman)
    );
    const payment = calculateRiichiPayment({
      han: score.han ?? score.total,
      fu: score.fu ?? 30,
      winner: seat,
      dealer: state.dealer,
      selfDrawn,
      honba: state.honba,
      yakumanCount: score.yakumanCount,
      loser,
      liability: liability ? { seat: liability.seat, yakumanCount: 1 } : undefined
    });
    score.points = payment.winnerGain;
    score.paymentLabel = payment.label;
    if (Object.keys(payment.payments).length > 0) {
      for (const payer of SEATS) {
        if (payer === seat) continue;
        state.players[payer].score -= payment.payments[payer] ?? 0;
      }
    } else if (loser !== undefined) {
      state.players[loser].score -= payment.winnerGain;
    }
    state.players[seat].score += payment.winnerGain;
    if (state.riichiSticks > 0) {
      state.players[seat].score += state.riichiSticks * 1000;
      state.riichiSticks = 0;
    }
    state.honba = seat === state.dealer ? state.honba + 1 : 0;
    state.log.push('Riichi settlement: ' + payment.label + '.');
    return state;
  }
  if (state.ruleset === 'hongkong') {
    const payment = calculateHongKongPayment({
      fan: score.total,
      selfDrawn,
      winner: seat,
      loser,
      liabilitySeat: state.hongKongLiability?.winner === seat ? state.hongKongLiability.seat : undefined
    });
    score.points = payment.winnerGain;
    score.paymentLabel = payment.label;
    for (const payer of SEATS) {
      const amount = payment.payments[payer] ?? 0;
      if (amount > 0) state.players[payer].score -= amount;
    }
    state.players[seat].score += payment.winnerGain;
    state.honba = seat === state.dealer ? state.honba + 1 : 0;
    state.log.push('Hong Kong settlement: ' + payment.label + '.');
    return state;
  }
  const payment = calculateMcrPayment({
    points: score.total,
    selfDrawn,
    winner: seat,
    loser
  });
  score.points = payment.winnerGain;
  score.paymentLabel = payment.label;
  for (const payer of SEATS) {
    if (payer === seat) continue;
    state.players[payer].score -= payment.payments[payer] ?? 0;
  }
  state.players[seat].score += payment.winnerGain;
  state.honba = seat === state.dealer ? state.honba + 1 : 0;
  state.log.push(
    `Seat ${seat} wins ${selfDrawn ? 'by self-draw' : 'on a discard'} for ${score.total}; ${payment.label}.`
  );
  return state;
}

/** Distance to ready for a seat, useful for hints and the AI. */
export function seatShanten(state: GameState, seat: Seat): number {
  const player = state.players[seat];
  return shanten(handCounts(player), meldCount(player), state.ruleset);
}

/** Tiles that would complete the seat's hand right now. */
export function seatWaits(state: GameState, seat: Seat): Tile[] {
  const player = state.players[seat];
  if (player.hand.length % 3 !== 1) return [];
  return waitingTiles(handCounts(player), meldCount(player), state.ruleset);
}
