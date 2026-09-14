import { tileRank, tileSuit, type Tile } from '../tiles';
import type { HandSet } from '../shanten';

export function waitFu(sets: HandSet[], winningTile: Tile): number {
  if (sets.some((block) => block.kind === 'pair' && block.tile === winningTile)) return 2;
  if (tileSuit(winningTile) === 'z') return 0;
  const rank = tileRank(winningTile);
  const hasBadRun = sets.some((block) => {
    if (block.kind !== 'run' || tileSuit(block.tile) !== tileSuit(winningTile)) return false;
    const start = tileRank(block.tile);
    return rank === start + 1 || (start === 1 && rank === 3) || (start === 7 && rank === 7);
  });
  return hasBadRun ? 2 : 0;
}
