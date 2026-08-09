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
  WINDS,
  type Tile
} from './tiles';
import { isWinningHand, shanten, waitingTiles } from './shanten';
import { scoreHand, type ScoreResult } from './scoring';

export type Seat = 0 | 1 | 2 | 3;

/** Ruleset presets. They share the engine and differ in scoring + legal calls. */
export type Ruleset = 'hongkong' | 'riichi' | 'chinese-official';

export interface RulesetConfig {
  id: Ruleset;
  label: string;
  /** Minimum score required to declare a win (HK: 3 faan, CO: 8 points). */
  minimumScore: number;
  /** Whether sequences may be called from the player to the left. */
  allowChi: boolean;
  /** Seven pairs / thirteen orphans recognised as winning shapes. */
  allowSpecialHands: boolean;
}

export const RULESETS: Record<Ruleset, RulesetConfig> = {
  hongkong: {
    id: 'hongkong',
    label: 'Hong Kong Old Style',
    minimumScore: 3,
    allowChi: true,
    allowSpecialHands: true
  },
  riichi: {
    id: 'riichi',
    label: 'Japanese Riichi',
    minimumScore: 1,
    allowChi: true,
    allowSpecialHands: true
  },
  'chinese-official': {
    id: 'chinese-official',
    label: 'Chinese Official (MCR)',
    minimumScore: 8,
    allowChi: true,
    allowSpecialHands: true
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
  seatWind: Tile;
  score: number;
  isBot: boolean;
  /** Set once the player has declared a ready hand (riichi ruleset). */
  declaredReady: boolean;
}

export type Phase = 'draw' | 'discard' | 'claim' | 'over';

export type ClaimKind = 'chi' | 'pon' | 'kan' | 'ron' | 'pass';

export interface ClaimOption {
  kind: ClaimKind;
  /** Tiles from the player's own hand used to make the meld. */
  tiles: Tile[];
}

export interface GameResult {
  kind: 'win' | 'draw';
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

export interface GameState {
  ruleset: Ruleset;
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
  lastDiscard: { tile: Tile; from: Seat } | null;
  /** Pending claim options per seat, keyed by seat index. */
  claims: Partial<Record<Seat, ClaimOption[]>>;
  /** Claims already submitted this window. */
  submitted: Partial<Record<Seat, ClaimOption>>;
  /** Wall-clock time the current claim window opened, for the timeout fallback. */
  claimOpenedAt?: number;
  result: GameResult | null;
  log: string[];
  seed: number;
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

export interface CreateGameOptions {
  ruleset?: Ruleset;
  seed?: number;
  /** Seat controlled by the person playing; the rest are bots. */
  humanSeat?: Seat;
}

export function createGame(options: CreateGameOptions = {}): GameState {
  const ruleset = options.ruleset ?? 'hongkong';
  const seed = options.seed ?? Math.floor(Math.random() * 2 ** 31);
  const humanSeat = options.humanSeat ?? 0;
  const rng = createRng(seed);
  const wall = shuffle(buildWall(), rng);

  const players: PlayerState[] = SEATS.map((seat) => ({
    seat,
    hand: [],
    melds: [],
    discards: [],
    seatWind: WINDS[seat],
    score: 78000,
    isBot: seat !== humanSeat,
    declaredReady: false
  }));

  let index = 0;
  for (let round = 0; round < 13; round += 1) {
    for (const seat of SEATS) {
      players[seat].hand.push(wall[index]);
      index += 1;
    }
  }
  for (const player of players) player.hand = sortTiles(player.hand);

  const state: GameState = {
    ruleset,
    wall,
    wallIndex: index,
    deadWallIndex: wall.length - DEAD_WALL_SIZE,
    players,
    turn: 0,
    phase: 'draw',
    dealer: 0,
    roundWind: WINDS[0],
    lastDiscard: null,
    claims: {},
    submitted: {},
    result: null,
    log: [],
    seed
  };

  return state;
}

function clone(state: GameState): GameState {
  return {
    ...state,
    wall: state.wall,
    players: state.players.map((p) => ({
      ...p,
      hand: [...p.hand],
      melds: p.melds.map((m) => ({ ...m, tiles: [...m.tiles] })),
      discards: [...p.discards]
    })),
    claims: { ...state.claims },
    submitted: { ...state.submitted },
    log: [...state.log]
  };
}

function removeTile(hand: Tile[], tile: Tile): boolean {
  const at = hand.indexOf(tile);
  if (at === -1) return false;
  hand.splice(at, 1);
  return true;
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

  if (tilesRemaining(next) <= 0) {
    next.phase = 'over';
    next.result = { kind: 'draw' };
    next.log.push('Wall exhausted — the hand is drawn.');
    return next;
  }

  const tile = next.wall[next.wallIndex];
  next.wallIndex += 1;
  const player = next.players[next.turn];
  player.hand = sortTiles([...player.hand, tile]);
  next.phase = 'discard';
  next.lastDiscard = null;
  return next;
}

/** Draw a replacement tile after a kan, taken from the dead wall. */
function drawReplacement(state: GameState, seat: Seat): void {
  if (state.deadWallIndex >= state.wall.length) return;
  const tile = state.wall[state.deadWallIndex];
  state.deadWallIndex += 1;
  state.players[seat].hand = sortTiles([...state.players[seat].hand, tile]);
}

/** Can this seat declare a self-drawn win right now? */
export function canDeclareTsumo(state: GameState, seat: Seat): boolean {
  const player = state.players[seat];
  if (player.hand.length % 3 !== 2) return false;
  if (!isWinningHand(handCounts(player), meldCount(player), state.ruleset)) return false;
  const score = scoreHand({
    state,
    seat,
    winningTile: player.hand[player.hand.length - 1],
    selfDrawn: true
  });
  return score.total >= RULESETS[state.ruleset].minimumScore;
}

/** Concealed kans available on the current draw. */
export function availableConcealedKans(state: GameState, seat: Seat): Tile[] {
  const player = state.players[seat];
  if (player.hand.length % 3 !== 2) return [];
  const counts = handCounts(player);
  const tiles: Tile[] = [];
  for (let i = 0; i < counts.length; i += 1) {
    if (counts[i] === 4) tiles.push(tileFromIndex(i));
  }
  return tiles;
}

export function declareConcealedKan(state: GameState, seat: Seat, tile: Tile): GameState {
  const next = clone(state);
  const player = next.players[seat];
  for (let i = 0; i < 4; i += 1) removeTile(player.hand, tile);
  player.melds.push({ kind: 'kan', tiles: [tile, tile, tile, tile], concealed: true });
  drawReplacement(next, seat);
  next.log.push(`Seat ${seat} declares a concealed kan.`);
  next.phase = 'discard';
  return next;
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
  if (!removeTile(player.hand, tile)) return state;
  player.hand = sortTiles(player.hand);
  player.discards.push(tile);
  next.lastDiscard = { tile, from: next.turn };

  next.claims = collectClaims(next, tile, next.turn);
  next.submitted = {};

  if (Object.keys(next.claims).length === 0) {
    next.turn = nextSeat(next.turn);
    next.phase = 'draw';
  } else {
    next.claimOpenedAt = now;
    next.phase = 'claim';
  }
  return next;
}

/**
 * Auto-pass every seat that has not answered an open claim window once the
 * window's deadline has passed. Used as a safety net for a silent human player;
 * bots answer their own windows on a timer. Returns the state unchanged while
 * the window is still open.
 */
export function passUnansweredClaims(state: GameState, now: number): GameState {
  if (state.phase !== 'claim') return state;
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
function collectClaims(
  state: GameState,
  tile: Tile,
  from: Seat
): Partial<Record<Seat, ClaimOption[]>> {
  const config = RULESETS[state.ruleset];
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
    if (isWinningHand(test, meldCount(player), state.ruleset)) {
      const score = scoreHand({ state, seat, winningTile: tile, selfDrawn: false });
      if (score.total >= config.minimumScore) {
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
  if (state.phase !== 'claim') return state;
  const next = clone(state);
  next.submitted[seat] = option;
  return maybeResolveClaims(next);
}

/** Resolve the claim window once every eligible seat has answered. */
export function maybeResolveClaims(state: GameState): GameState {
  const pending = Object.keys(state.claims).map(Number) as Seat[];
  const answered = pending.every((seat) => state.submitted[seat] !== undefined);
  if (!answered) return state;

  const next = clone(state);
  const discardInfo = next.lastDiscard!;

  // Riichi: every seat that declared ron wins the same discard, and the
  // discarder pays each of them. HK / CO keep the single lowest-seat winner.
  const ronSeats = pending.filter(
    (seat) => next.submitted[seat]!.kind === 'ron'
  );
  if (ronSeats.length >= 2 && next.ruleset === 'riichi') {
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
    next.turn = nextSeat(discardInfo.from);
    next.phase = 'draw';
    return next;
  }

  if (best.option.kind === 'ron') {
    return finishWithWin(next, best.seat, discardInfo.tile, false, discardInfo.from);
  }

  // The claimed tile leaves the discard pile and joins the caller's meld.
  const discarder = next.players[discardInfo.from];
  discarder.discards.pop();

  const caller = next.players[best.seat];
  for (const tile of best.option.tiles) removeTile(caller.hand, tile);
  caller.hand = sortTiles(caller.hand);

  const meldTiles = sortTiles([...best.option.tiles, discardInfo.tile]);
  const kind: MeldKind =
    best.option.kind === 'chi' ? 'chi' : best.option.kind === 'kan' ? 'kan' : 'pon';
  caller.melds.push({ kind, tiles: meldTiles, from: discardInfo.from });
  next.log.push(`Seat ${best.seat} calls ${best.option.kind}.`);

  if (kind === 'kan') drawReplacement(next, best.seat);

  next.turn = best.seat;
  next.phase = 'discard';
  next.lastDiscard = null;
  return next;
}

/** Declare a self-drawn win for the seat currently holding 14 tiles. */
export function declareTsumo(state: GameState, seat: Seat): GameState {
  const player = state.players[seat];
  const winningTile = player.hand[player.hand.length - 1];
  return finishWithWin(clone(state), seat, winningTile, true);
}

/** Riichi double ron: every winner is paid for the same discard. */
function finishWithDoubleRon(
  state: GameState,
  ronSeats: Seat[],
  discardInfo: { tile: Tile; from: Seat }
): GameState {
  const winners = ronSeats.map((seat) => {
    const score = scoreHand({
      state,
      seat,
      winningTile: discardInfo.tile,
      selfDrawn: false
    });
    state.players[seat].score += score.total;
    return { seat, loser: discardInfo.from, score };
  });
  state.claims = {};
  state.submitted = {};
  state.phase = 'over';
  state.result = { kind: 'win', winners };
  state.log.push(
    `Seat ${discardInfo.from} deals in to seats ${ronSeats.join(' & ')} for a double ron.`
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
  if (selfDrawn) {
    for (const payer of SEATS) {
      if (payer === seat) continue;
      state.players[payer].score -= score.total;
      state.players[seat].score += score.total;
    }
  } else if (loser !== undefined) {
    state.players[loser].score -= score.total;
    state.players[seat].score += score.total;
  }
  state.log.push(
    `Seat ${seat} wins ${selfDrawn ? 'by self-draw' : 'on a discard'} for ${score.total}.`
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
