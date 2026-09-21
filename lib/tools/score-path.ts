import { createGame, minimumWinScore, type GameState } from '@/lib/mahjong/engine';
import { scoreHand, type ScoreResult } from '@/lib/mahjong/scoring';
import { isWinningHand } from '@/lib/mahjong/shanten';
import { sortTiles, toCounts, WINDS, type Tile } from '@/lib/mahjong/tiles';

export type ToolsScoreInput = {
  /** Complete 14-tile closed hand including the winning tile. */
  hand14: Tile[];
  winningTile: Tile;
  selfDrawn: boolean;
  /** Seat wind of the scoring player. Default East. */
  seatWind?: Tile;
  /** Round wind. Default East. */
  roundWind?: Tile;
  hongKongMode?: 'standard' | 'casual';
};

export type ToolsScoreOutcome =
  | { ok: true; score: ScoreResult; minimum: number; state: GameState }
  | { ok: false; reason: 'notWinning' | 'belowMinimum' | 'error'; message?: string; score?: ScoreResult; minimum?: number };

/**
 * Rebuild a minimal Hong Kong GameState and score it — the same path the
 * score calculator UI must use (MAHJONG_TOOLS_SPEC §4.2).
 */
export function scoreHongKongToolsHand(input: ToolsScoreInput): ToolsScoreOutcome {
  try {
    const winningTile = input.winningTile;
    if (!input.hand14.includes(winningTile) || input.hand14.length !== 14) {
      return { ok: false, reason: 'notWinning' };
    }

    if (!isWinningHand(toCounts(input.hand14), 0, 'hongkong')) {
      return { ok: false, reason: 'notWinning' };
    }

    const state = createGame({
      ruleset: 'hongkong',
      hongKongMode: input.hongKongMode ?? 'standard',
      seed: 1
    });

    // Ron: winning tile is not yet in hand. Tsumo: hand already holds it.
    const concealed = input.selfDrawn
      ? [...input.hand14]
      : (() => {
          const next = [...input.hand14];
          const index = next.lastIndexOf(winningTile);
          if (index >= 0) next.splice(index, 1);
          return next;
        })();

    state.players[0].hand = sortTiles(concealed);
    state.players[0].melds = [];
    state.players[0].seatWind = input.seatWind ?? WINDS[0];
    state.roundWind = input.roundWind ?? WINDS[0];
    state.turn = 0;

    const score = scoreHand({
      state,
      seat: 0,
      winningTile,
      selfDrawn: input.selfDrawn
    });
    const minimum = minimumWinScore(state);

    if (score.total < minimum) {
      return { ok: false, reason: 'belowMinimum', score, minimum };
    }

    return { ok: true, score, minimum, state };
  } catch (error) {
    return {
      ok: false,
      reason: 'error',
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

/** Hong Kong non-zero pattern ids for tools i18n (values.ts base / HK column). */
export const HK_PATTERN_IDS = [
  'chickenHand',
  'selfDraw',
  'replacementWin',
  'lastTileWin',
  'robbingKong',
  'concealed',
  'allSimples',
  'allSequences',
  'dragonTriplet',
  'seatWind',
  'roundWind',
  'allTerminalsHonours',
  'allTriplets',
  'halfFlush',
  'sevenPairs',
  'littleThreeDragons',
  'fullFlush',
  'bigThreeDragons',
  'smallFourWinds',
  'bigFourWinds',
  'allTerminals',
  'allHonours',
  'fourConcealedTriplets',
  'thirteenOrphans'
] as const;

export type HkPatternId = (typeof HK_PATTERN_IDS)[number];
