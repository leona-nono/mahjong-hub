/**
 * Bridge from the blog's presentation-only tile spec (`data/tiles.ts`) to the
 * engine's canonical tile ids (`lib/mahjong/tiles.ts`).
 *
 * Article authors describe tiles by readable suit name so the content stays
 * legible; every renderer and every rule works in engine ids. Putting the
 * translation in one place is what lets a blog 牌图 reuse the game's artwork
 * instead of maintaining a second, hand-drawn set of faces.
 *
 * Validation is deliberately loud. Tile specs live in JSON locale files that
 * TypeScript cannot type-check at load time, and a quiet fallback would render
 * the *wrong tile* inside a teaching article — the one failure mode a reader
 * cannot detect. A build error is far cheaper than shipping a lie.
 */
import type { TileSpec } from '@/data/tiles';
import { type Tile } from './tiles';

const SUIT_LETTER = { char: 'm', dot: 'p', bamboo: 's' } as const;

/** Seat order, matching `WINDS` in the engine. */
const WIND_TILE = { east: 'z1', south: 'z2', west: 'z3', north: 'z4' } as const;

/** Matches `DRAGONS`: White, Green, Red. */
const DRAGON_TILE = { white: 'z5', green: 'z6', red: 'z7' } as const;

function bad(spec: TileSpec): Error {
  return new Error(`Invalid blog tile spec: ${JSON.stringify(spec)}`);
}

export function toEngineTile(spec: TileSpec): Tile {
  switch (spec.suit) {
    case 'char':
    case 'dot':
    case 'bamboo': {
      const rank = spec.rank;
      if (!Number.isInteger(rank) || rank === undefined || rank < 1 || rank > 9) {
        throw bad(spec);
      }
      return `${SUIT_LETTER[spec.suit]}${rank}`;
    }
    case 'wind': {
      const tile: Tile | undefined = WIND_TILE[spec.wind as keyof typeof WIND_TILE];
      if (!tile) throw bad(spec);
      return tile;
    }
    case 'dragon': {
      const tile: Tile | undefined = DRAGON_TILE[spec.dragon as keyof typeof DRAGON_TILE];
      if (!tile) throw bad(spec);
      return tile;
    }
    default:
      throw bad(spec);
  }
}

export function toEngineTiles(specs: readonly TileSpec[]): Tile[] {
  return specs.map(toEngineTile);
}
