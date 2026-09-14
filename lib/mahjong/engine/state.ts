/**
 * Four-player mahjong state machine — core types and table lifecycle.
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
  isBonusTile,
  WINDS,
  type Tile
} from '../tiles';
import type { ScoreResult } from '../scoring';
import { clone } from './helpers';

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
