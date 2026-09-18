import type { GameState, HongKongMode, Seat } from '../engine';
import type { HandSet } from '../shanten';
import type { Tile } from '../tiles';

export interface ScorePattern {
  id: string;
  label: string;
  value: number;
  /** A genuine yakuman, which stacks separately in strict WRC scoring. */
  yakuman?: boolean;
}

/** Minimum-win gate carried for settlement teaching (Phase E). */
export interface ScoreGate {
  kind: 'yaku' | 'minFan';
  required: number;
  actual: number;
  passed: boolean;
  reasonKey?: 'noYaku' | 'belowMinimum' | 'flowersExcluded';
}

export interface ScoreResult {
  total: number;
  /** MCR's 8-point gate excludes Flower / Season bonus points. */
  qualifyingTotal?: number;
  patterns: ScorePattern[];
  /** True when the hand is a limit hand for the ruleset. */
  limit: boolean;
  /** Riichi requires at least one yaku. */
  legalYaku?: boolean;
  han?: number;
  fu?: number;
  points?: number;
  paymentLabel?: string;
  yakumanCount?: number;

  // —— Phase E review fields (all optional) ——
  /** A: hand shape classification used for settlement teaching. */
  handShape?: 'standard' | 'sevenPairs' | 'thirteenOrphans';
  /** A: decomposition actually used for scoring (not a fresh DFS). */
  decomposition?: HandSet[];
  /** B: minimum-win gate. */
  gate?: ScoreGate;
  /** D: fan/han cap applied for display settlement. */
  capped?: { from: number; to: number; capKey: 'hkFan' | 'riichiHan' | 'mcrNone' };
  /** C: riichi fu line items (labelKey → i18n). */
  fuBreakdown?: { labelKey: string; value: number }[];
  /** C: riichi dora detail. */
  doraDetail?: { indicator: Tile; dora: Tile; hits: Tile[] }[];
}

/** @deprecated Prefer reading hongKongMode from GameState; kept for callers that pass mode alone. */
export type ScoreHongKongMode = HongKongMode;

export interface ScoreInput {
  state: GameState;
  seat: Seat;
  winningTile: Tile;
  selfDrawn: boolean;
}
