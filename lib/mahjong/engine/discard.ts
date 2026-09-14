import { sortTiles, type Tile } from '../tiles';
import { endInAbortiveDraw, isFourKanAbort, isFourWindAbort } from './abort';
import { collectClaims } from './claim';
import { availableRiichiDiscards } from './draw';
import { advanceAfterUnclaimedDiscard, clone, removeTile } from './helpers';
import type { GameState } from './state';

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
