import {
  COPIES_PER_TILE,
  TILE_KINDS,
  tileIndex,
  toCounts,
  type Tile
} from './tiles';
import { shanten } from './shanten';
import type { GameState, Seat } from './engine';

export type DiscardGrade = 'best' | 'acceptable' | 'better';
export type CoachIntensity = 'silent' | 'ask' | 'live';

export interface RankedDiscard {
  tile: Tile;
  shanten: number;
  ukeire: number;
}

/**
 * Unseen copies per tile kind: not yet visible in discards, melds, or this seat's hand.
 */
export function unseenCounts(state: GameState, seat: Seat): number[] {
  const seen = new Array<number>(TILE_KINDS).fill(0);
  for (const player of state.players) {
    for (const tile of player.discards) seen[tileIndex(tile)] += 1;
    for (const meld of player.melds) {
      for (const tile of meld.tiles) seen[tileIndex(tile)] += 1;
    }
  }
  for (const tile of state.players[seat].hand) seen[tileIndex(tile)] += 1;
  return seen.map((n) => Math.max(0, COPIES_PER_TILE - n));
}

/** Ukeire: unseen tiles that would reduce shanten. Higher is better. */
export function acceptance(state: GameState, seat: Seat, hand: Tile[], melds: number): number {
  const counts = toCounts(hand);
  const current = shanten(counts, melds, state.ruleset);
  const unseen = unseenCounts(state, seat);
  let total = 0;
  for (let i = 0; i < TILE_KINDS; i += 1) {
    if (counts[i] >= COPIES_PER_TILE) continue;
    counts[i] += 1;
    const improved = shanten(counts, melds, state.ruleset) < current;
    counts[i] -= 1;
    if (improved) total += unseen[i];
  }
  return total;
}

export function rankDiscards(state: GameState, seat: Seat): RankedDiscard[] {
  const player = state.players[seat];
  const meldCount = player.melds.length;
  const unique = Array.from(new Set(player.hand));
  return unique
    .map((tile) => {
      const rest = [...player.hand];
      rest.splice(rest.indexOf(tile), 1);
      return {
        tile,
        shanten: shanten(toCounts(rest), meldCount, state.ruleset),
        ukeire: acceptance(state, seat, rest, meldCount)
      };
    })
    .sort((a, b) => a.shanten - b.shanten || b.ukeire - a.ukeire || a.tile.localeCompare(b.tile));
}

export function judgeDiscard(
  state: GameState,
  seat: Seat,
  tile: Tile
): { grade: DiscardGrade; best: RankedDiscard; played: RankedDiscard } {
  const ranked = rankDiscards(state, seat);
  const best = ranked[0];
  const played = ranked.find((row) => row.tile === tile) ?? { tile, shanten: 99, ukeire: 0 };
  if (!best || played.tile === best.tile) {
    return { grade: 'best', best: best ?? played, played };
  }
  if (played.shanten === best.shanten && best.ukeire - played.ukeire <= 2) {
    return { grade: 'acceptable', best, played };
  }
  return { grade: 'better', best, played };
}
