/**
 * Four-player mahjong state machine.
 *
 * The engine is deliberately UI-agnostic and deterministic: every game is
 * seeded, every transition is a pure `(state, action) -> state` function, and
 * nothing here touches React or the DOM. That keeps it unit-testable and lets
 * the same engine back a future server-authoritative multiplayer mode.
 *
 * Implementation lives under `./engine/`; this file is the stable public barrel.
 */

export type {
  Seat,
  Ruleset,
  HongKongMode,
  RiichiVariant,
  RulesetConfig,
  MeldKind,
  Meld,
  PlayerState,
  Phase,
  ClaimKind,
  ClaimOption,
  DrawReason,
  GameResult,
  RiichiMatchResult,
  GameState,
  CreateGameOptions
} from './engine/state';
export {
  RULESETS,
  ABORTIVE_DRAW_REASONS,
  isAbortiveDraw,
  CLAIM_TIMEOUT_MS,
  SEATS,
  nextSeat,
  tilesRemaining,
  minimumWinScore,
  createGame,
  startNextHand,
  calculateRiichiMatchResult
} from './engine/state';

export {
  canDeclareNineTerminals,
  declareNineTerminals
} from './engine/abort';

export type { SelfDrawEvaluation } from './engine/draw';
export {
  drawTile,
  evaluateSelfDraw,
  canDeclareTsumo,
  availableRiichiDiscards,
  declareRiichi,
  availableConcealedKans,
  availableAddedKans,
  availableKans,
  declareConcealedKan,
  declareAddedKan,
  declareKan,
  seatShanten,
  seatWaits
} from './engine/draw';

export { discard } from './engine/discard';

export {
  passUnansweredClaims,
  isPermanentFuriten,
  submitClaim,
  maybeResolveClaims
} from './engine/claim';

export { declareTsumo } from './engine/win';
