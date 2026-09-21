import {
  COPIES_PER_TILE,
  TILE_KINDS,
  tileIndex,
  type Tile
} from '@/lib/mahjong/tiles';

const MAX_TILES = 14;

/** Encode a hand for `?hand=` share URLs (concatenated tile ids, e.g. `m1m2m3`). */
export function encodeSharedHand(tiles: readonly Tile[]): string {
  return tiles.join('');
}

/**
 * Parse `?hand=m1m2m3...` from a search string.
 * Malformed input returns [] — never throws (tools share-URL contract).
 */
export function parseSharedHand(search: string): Tile[] {
  const raw = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search).get('hand');
  if (!raw) return [];
  const ids = raw.match(/[mpsz][1-9]/g);
  if (!ids) return [];
  const valid = ids.filter((id) => {
    const index = tileIndex(id);
    return index >= 0 && index < TILE_KINDS;
  });
  if (valid.length === 0 || valid.length > MAX_TILES) return [];
  const tally = new Map<string, number>();
  const kept: Tile[] = [];
  for (const id of valid) {
    const seen = tally.get(id) ?? 0;
    if (seen >= COPIES_PER_TILE) continue;
    tally.set(id, seen + 1);
    kept.push(id as Tile);
  }
  return kept;
}

export { MAX_TILES as SHARED_HAND_MAX_TILES };
