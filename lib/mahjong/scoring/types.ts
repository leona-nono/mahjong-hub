import type { GameState, Seat } from '../engine';
import type { Tile } from '../tiles';

export interface ScorePattern {
  id: string;
  label: string;
  value: number;
  /** A genuine yakuman, which stacks separately in strict WRC scoring. */
  yakuman?: boolean;
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
}

export interface ScoreInput {
  state: GameState;
  seat: Seat;
  winningTile: Tile;
  selfDrawn: boolean;
}
