import {
  isSimple,
  isTerminalOrHonour,
  tileRank,
  tileSuit,
  type Suit,
  type Tile
} from '../tiles';
import type { HandSet } from '../shanten';

export function isGreenTile(tile: Tile): boolean {
  return (['s2', 's3', 's4', 's6', 's8', 'z6'] as Tile[]).includes(tile);
}

export function isReversibleTile(tile: Tile): boolean {
  return (['p1', 'p2', 'p3', 'p4', 'p5', 'p8', 'p9', 's2', 's4', 's5', 's6', 's8', 's9', 'z5'] as Tile[])
    .includes(tile);
}

export function isSevenShiftedPairs(counts: number[]): boolean {
  for (const suit of ['m', 'p', 's'] as Suit[]) {
    const start = suit === 'm' ? 0 : suit === 'p' ? 9 : 18;
    if (counts.reduce((sum, count, index) => index >= start && index < start + 9 ? sum + count : sum, 0) !== 14) {
      continue;
    }
    for (let offset = 0; offset <= 2; offset += 1) {
      const ranks = counts.slice(start + offset, start + offset + 7);
      if (ranks.length === 7 && ranks.every((count) => count === 2)) return true;
    }
  }
  return false;
}

export function isNineGates(counts: number[]): boolean {
  const suits: Suit[] = ['m', 'p', 's'];
  for (const suit of suits) {
    const start = suit === 'm' ? 0 : suit === 'p' ? 9 : 18;
    if (counts.slice(27).some((count) => count > 0)) continue;
    const ranks = counts.slice(start, start + 9);
    if (ranks.reduce((sum, count) => sum + count, 0) !== 14) continue;
    if (ranks[0] >= 3 && ranks[8] >= 3 && ranks.slice(1, 8).every((count) => count >= 1)) return true;
  }
  return false;
}

export function countIdenticalRunPairs(blocks: HandSet[]): number {
  const count = new Map<string, number>();
  for (const block of blocks) {
    if (block.kind !== 'run') continue;
    count.set(block.tile, (count.get(block.tile) ?? 0) + 1);
  }
  return [...count.values()].reduce((total, value) => total + Math.floor(value / 2), 0);
}

export function hasIttsuu(blocks: HandSet[]): boolean {
  for (const suit of ['m', 'p', 's']) {
    if ([1, 4, 7].every((rank) => blocks.some((block) => block.kind === 'run' && block.tile === `${suit}${rank}`))) return true;
  }
  return false;
}

export function hasSanshokuDoujun(blocks: HandSet[]): boolean {
  for (let rank = 1; rank <= 7; rank += 1) {
    if (['m', 'p', 's'].every((suit) => blocks.some((block) => block.kind === 'run' && block.tile === `${suit}${rank}`))) return true;
  }
  return false;
}

export function hasSanshokuDoukou(blocks: HandSet[]): boolean {
  for (let rank = 1; rank <= 9; rank += 1) {
    if (['m', 'p', 's'].every((suit) => blocks.some((block) => block.kind === 'triplet' && block.tile === `${suit}${rank}`))) return true;
  }
  return false;
}

export function isOutsideBlock(block: HandSet, allowHonours: boolean): boolean {
  if (block.kind === 'run') return tileRank(block.tile) === 1 || tileRank(block.tile) === 7;
  return allowHonours ? isTerminalOrHonour(block.tile) : tileSuit(block.tile) !== 'z' && !isSimple(block.tile);
}

export function hasChanta(blocks: HandSet[]): boolean {
  return blocks.some((block) => block.kind === 'run') &&
    blocks.some((block) => block.kind !== 'run' && tileSuit(block.tile) === 'z') &&
    blocks.every((block) => isOutsideBlock(block, true));
}

export function hasJunchan(blocks: HandSet[]): boolean {
  return blocks.some((block) => block.kind === 'run') && blocks.every((block) => isOutsideBlock(block, false));
}

export function hasTwoSidedWait(sets: HandSet[], winningTile: Tile): boolean {
  if (tileSuit(winningTile) === 'z') return false;
  const rank = tileRank(winningTile);
  return sets.some((block) => {
    if (block.kind !== 'run' || tileSuit(block.tile) !== tileSuit(winningTile)) return false;
    const start = tileRank(block.tile);
    return (rank === start && start > 1) || (rank === start + 2 && start < 7);
  });
}
