import type { HongKongMode, Ruleset, Seat } from '@/lib/mahjong/engine';

/** Replay scaffold. A later pass fills date-keyed {seed, moves[]} puzzles. */
export interface DailyPuzzle {
  dateKey: string;
  seed: number;
  ruleset: Ruleset;
  hongKongMode: HongKongMode;
  humanSeat: Seat;
  moves: unknown[];
}

export const DAILY_PUZZLES: DailyPuzzle[] = [];
