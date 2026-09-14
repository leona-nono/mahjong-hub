import { isSameKind, toCounts, type Tile } from '../tiles';
import { nextSeat, type GameState, type PlayerState, type Seat } from './state';

export function clone(state: GameState): GameState {
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

export function removeTile(hand: Tile[], tile: Tile): boolean {
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
export function takeTileOfKind(hand: Tile[], kind: Tile): Tile | null {
  const plain = hand.findIndex((tile) => tile === kind);
  const at = plain >= 0 ? plain : hand.findIndex((tile) => isSameKind(tile, kind));
  if (at === -1) return null;
  const [removed] = hand.splice(at, 1);
  return removed;
}

export function handCounts(player: PlayerState): number[] {
  return toCounts(player.hand);
}

/** Kan melds each absorb an extra tile, so count them as one set for shanten. */
export function meldCount(player: PlayerState): number {
  return player.melds.length;
}

export function totalKans(state: GameState): number {
  return state.players.reduce((total, player) => total + player.melds.filter((meld) => meld.kind === 'kan').length, 0);
}

export function advanceAfterUnclaimedDiscard(state: GameState): GameState {
  state.turn = nextSeat(state.turn);
  state.phase = 'draw';
  return state;
}
