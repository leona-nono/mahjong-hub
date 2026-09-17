/**
 * The one contract every mahjong variant speaks.
 *
 * The performance layer (CoachPanel / coach-stage / feedback budget)
 * consumes ONLY these types — it must never learn which ruleset is running.
 */

export type CoachGrade = 'best' | 'acceptable' | 'better';

/**
 * How much this variant's coach actually knows.
 *   full        -> full L0-L4 output + grades
 *   partial     -> L1 markers + directional info; never a hard grade
 *   unsupported -> watching: present, does not evaluate
 */
export type CoachCapability = 'full' | 'partial' | 'unsupported';

/** Discard danger. American already computes this; others may fill it later. */
export type CoachRisk = 'low' | 'medium' | 'high';

export interface CoachVerdict {
  /** null = the coach declines to judge (silence / partial / unsupported). */
  grade: CoachGrade | null;
  capability: CoachCapability;

  /** The better tile. Unified name — replaces the old best/suggested split. */
  suggested?: string;
  /** What the player actually discarded. */
  played?: string;
  /** Quantified gap (ukeire difference, or pattern-distance difference). <= 0 when worse. */
  gap?: number;
  shanten?: number;
  ukeire?: number;

  /** Deal-in risk. American fills it. */
  risk?: CoachRisk;
  /**
   * Variant-specific note code (not localized copy).
   * Examples: yaku_gate_pending | exposed-group-compatible | call-commits-to-line | wait-for-mah-jongg
   */
  note?: string;
}

export interface RankedOption<T = string> {
  tile: T;
  shanten: number;
  ukeire: number;
}

/**
 * One thin adapter per variant. Adapters do NOT contain algorithms —
 * they wrap the ones that already exist in lib/mahjong/*.ts.
 */
export interface CoachAdapter<S, T = string> {
  ruleset: string;
  capability: CoachCapability;
  judge(state: S, seat: number, tile: T): CoachVerdict;
  rank(state: S, seat: number): RankedOption<T>[];
}

/**
 * Single source of truth for per-variant coach ability.
 * Update this BEFORE writing any variant-specific UI branch.
 *
 * Upgrade path:
 * - riichi / chinese-official → 'full' after scoring-gate (Phase G)
 * - sichuan / taiwan → 'full' after real shanten (Phase G)
 */
export const COACH_CAPABILITIES = {
  hongkong: 'full',
  riichi: 'partial',
  'chinese-official': 'partial',
  american: 'partial',
  sichuan: 'unsupported',
  taiwan: 'unsupported'
} as const satisfies Record<string, CoachCapability>;

export type CoachRuleset = keyof typeof COACH_CAPABILITIES;

export function resolveCoachCapability(ruleset: string): CoachCapability {
  return (COACH_CAPABILITIES as Record<string, CoachCapability>)[ruleset] ?? 'unsupported';
}
