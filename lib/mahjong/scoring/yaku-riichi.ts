import { isDragon, isSimple, type Tile } from '../tiles';
import type { HandSet } from '../shanten';
import type { GameState } from '../engine';
import { roundFu } from '../riichi';
import { waitFu } from './fu';
import {
  countIdenticalRunPairs,
  hasChanta,
  hasIttsuu,
  hasJunchan,
  hasSanshokuDoujun,
  hasSanshokuDoukou,
  hasTwoSidedWait
} from './shapes';

/**
 * A standard winning hand can be partitioned in several ways. Fu is tied to
 * the specific partition (especially a ron-completed triplet and the wait),
 * so choose the partition with the strongest ordinary Han. When Han is tied,
 * keep the one with the highest fu; the main scorer then
 * calculates the final Han with that same legal partition.
 */
export function selectBestRiichiDecomposition(
  candidates: HandSet[][],
  melds: Array<{ kind: 'chi' | 'pon' | 'kan'; tiles: Tile[]; concealed?: boolean }>,
  winningTile: Tile,
  selfDrawn: boolean,
  isConcealed: boolean,
  seatWind: Tile,
  roundWind: Tile
): HandSet[] | null {
  if (candidates.length === 0) return null;
  const withMelds = (sets: HandSet[]) => [
    ...sets,
    ...melds.map((meld) => ({
      kind: (meld.kind === 'chi' ? 'run' : 'triplet') as HandSet['kind'],
      tile: meld.tiles[0],
      open: !meld.concealed
    }))
  ];
  const value = (sets: HandSet[]) => {
    const blocks = withMelds(sets);
    const pair = sets.find((block) => block.kind === 'pair')?.tile;
    const runs = blocks.filter((block) => block.kind === 'run');
    const trips = blocks.filter((block) => block.kind === 'triplet');
    const pinfu = Boolean(
      isConcealed && runs.length === 4 && pair && !isDragon(pair) &&
      pair !== seatWind && pair !== roundWind && hasTwoSidedWait(sets, winningTile)
    );
    let fu = 20;
    if (isConcealed && !selfDrawn) fu += 10;
    if (selfDrawn && !pinfu) fu += 2;
    if (pair && isDragon(pair)) fu += 2;
    else if (pair === seatWind || pair === roundWind) fu += 2;
    for (const block of sets) {
      if (block.kind !== 'triplet') continue;
      const completedByRon = !selfDrawn && block.tile === winningTile;
      fu += completedByRon ? (isSimple(block.tile) ? 2 : 4) : (isSimple(block.tile) ? 4 : 8);
    }
    for (const meld of melds) {
      if (meld.kind === 'chi') continue;
      const terminal = !isSimple(meld.tiles[0]);
      if (meld.kind === 'pon') fu += terminal ? 4 : 2;
      if (meld.kind === 'kan') fu += meld.concealed ? (terminal ? 32 : 16) : (terminal ? 16 : 8);
    }
    fu += waitFu(sets, winningTile);
    if (!isConcealed && fu === 20) fu = 30;
    const identicalPairs = countIdenticalRunPairs(runs);
    const hanPotential =
      (pinfu ? 1 : 0) +
      (isConcealed ? (identicalPairs >= 2 ? 3 : identicalPairs) : 0) +
      (hasIttsuu(runs) ? (isConcealed ? 2 : 1) : 0) +
      (hasSanshokuDoujun(runs) ? (isConcealed ? 2 : 1) : 0) +
      (hasSanshokuDoukou(trips) ? 2 : 0) +
      (hasJunchan(blocks) ? (isConcealed ? 3 : 2) : hasChanta(blocks) ? (isConcealed ? 2 : 1) : 0) +
      (trips.length === 4 ? 2 : 0) +
      (trips.filter((block) => !block.open && (selfDrawn || block.tile !== winningTile)).length >= 3 ? 2 : 0);
    return { fu: roundFu(fu), hanPotential };
  };
  return candidates.reduce((best, candidate) => {
    const a = value(best);
    const b = value(candidate);
    if (b.hanPotential > a.hanPotential || (b.hanPotential === a.hanPotential && b.fu > a.fu)) return candidate;
    return best;
  });
}

export function noDiscardHasOccurred(state: GameState): boolean {
  return state.players.every((player) => player.discards.length === 0);
}
