import { isTerminalOrHonour, isWind } from '../tiles';
import { clone, totalKans } from './helpers';
import type { DrawReason, GameState, Seat } from './state';

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
export function endInAbortiveDraw(state: GameState, reason: DrawReason): GameState {
  state.phase = 'over';
  state.claims = {};
  state.submitted = {};
  state.honba += 1;
  state.result = { kind: 'draw', reason };
  return state;
}

/** 四風連打: four identical wind discards open the hand with no call between. */
export function isFourWindAbort(state: GameState): boolean {
  if (state.ruleset !== 'riichi' || state.riichiVariant !== 'standard' || state.callsMade) return false;
  if (!state.players.every((player) => player.discards.length === 1)) return false;
  const [first] = state.players[0].discards;
  return isWind(first) && state.players.every((player) => player.discards[0] === first);
}

/** 四槓散了: a fourth Kong on the table while no single seat holds them all. */
export function isFourKanAbort(state: GameState): boolean {
  if (state.ruleset !== 'riichi' || state.riichiVariant !== 'standard' || totalKans(state) < 4) return false;
  const owners = state.players.filter((player) => player.melds.some((meld) => meld.kind === 'kan'));
  return owners.length > 1;
}
