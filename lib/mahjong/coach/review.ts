import type { HandSet } from '../shanten';
import type { Tile } from '../tiles';
import type { CoachCapability } from './contract';

/** A machine-readable reason a fan is awarded. Templates live in i18n. */
export type Evidence =
  | { kind: 'allTiles'; predicate: 'simple' | 'terminal' | 'honour' | 'green' | 'reversible' | 'oneSuit'; hits: Tile[] }
  | { kind: 'setComposition'; all: 'triplet' | 'run'; sets: HandSet[] }
  | { kind: 'specificSets'; what: 'dragon' | 'wind' | 'concealed'; count: number; sets: HandSet[] }
  | { kind: 'waitShape'; shape: 'twoSided' | 'closed' | 'edge' | 'single'; set: HandSet; winningTile: Tile }
  | { kind: 'winCondition'; condition: 'selfDraw' | 'haitei' | 'rinshan' | 'robKong' | 'lastTile' }
  | { kind: 'declaration'; what: 'riichi' | 'doubleRiichi' | 'ippatsu' | 'concealed' }
  | { kind: 'doraCount'; groups: { indicator: Tile; dora: Tile; hits: Tile[] }[] }
  | { kind: 'specialShape'; shape: 'sevenPairs' | 'thirteenOrphans' | 'nineGates'; tiles: Tile[] }
  | { kind: 'sequencePattern'; pattern: 'ittsuu' | 'sanshoku' | 'iipeikou'; sets: HandSet[] }
  | { kind: 'kongCount'; concealed: number; melded: number }
  | { kind: 'flowerCount'; tiles: Tile[] }
  | { kind: 'gate'; required: number; actual: number; passed: boolean; reason?: string }
  /** No generator yet → render the fan name only. */
  | { kind: 'fallback'; fanId: string };

/**
 * What the coach says at settlement. Structurally parallel to CoachVerdict:
 * the performance layer must not learn which ruleset is running.
 */
export interface CoachReview {
  capability: CoachCapability;
  outcome: 'iWon' | 'opponentWon' | 'draw';

  /** A: hand shape + the decomposition actually used for scoring. */
  shape?: {
    kind: 'standard' | 'sevenPairs' | 'thirteenOrphans';
    sets?: HandSet[];
    winningTile?: Tile;
  };
  /** B: minimum-win gate. */
  gate?: {
    kind: 'yaku' | 'minFan';
    required: number;
    actual: number;
    passed: boolean;
    reasonKey?: 'noYaku' | 'belowMinimum' | 'flowersExcluded';
  };
  /** C: fans + machine-readable evidence. */
  fans?: { id: string; value: number; evidence: Evidence }[];
  /** D: payment formula, structured (never translate a whole sentence). */
  formula?: { items: { labelKey: string; value: number }[]; total: number; note?: string };
  /** When the player did not win: from shanten/waits, not from ScoreResult. */
  missInfo?: { shanten: number; waits: Tile[]; note?: string };
  /** First-ever settlement review: disclose that tiles are revealed now. */
  discloseReveal?: boolean;
}
