import type { CoachGrade, CoachVerdict } from './contract';

/** Semantic reason codes — localized in messages coachFb.reasons.* */
export type DiscardExplainCode =
  | 'best-tile'
  | 'same-shanten'
  | 'worse-shanten'
  | 'worse-ukeire'
  | 'acceptable-ukeire'
  | 'yaku_gate_pending'
  | 'unsupported'
  | 'no-suggestion';

export interface DiscardExplanation {
  codes: DiscardExplainCode[];
}

/**
 * Pure reason codes for a verdict. No localized copy.
 */
export function explainDiscard(verdict: CoachVerdict): DiscardExplanation {
  if (verdict.capability === 'unsupported') {
    return { codes: ['unsupported'] };
  }

  const codes: DiscardExplainCode[] = [];

  if (verdict.note === 'yaku_gate_pending') {
    codes.push('yaku_gate_pending');
  }

  if (!verdict.suggested) {
    codes.push('no-suggestion');
    return { codes };
  }

  if (verdict.grade === 'best' || (verdict.played && verdict.played === verdict.suggested)) {
    codes.push('best-tile');
    return { codes };
  }

  if (verdict.grade === 'acceptable') {
    codes.push('same-shanten', 'acceptable-ukeire');
    return { codes };
  }

  // better or graded-null with a different suggestion
  if (typeof verdict.gap === 'number' && verdict.gap < 0) {
    codes.push('worse-ukeire');
  }
  if (
    typeof verdict.shanten === 'number' &&
    verdict.played &&
    verdict.suggested &&
    verdict.grade === 'better'
  ) {
    codes.push('worse-shanten');
  }
  if (codes.length === 0) {
    codes.push(gradeFallback(verdict.grade));
  }
  return { codes };
}

function gradeFallback(grade: CoachGrade | null): DiscardExplainCode {
  if (grade === 'best') return 'best-tile';
  if (grade === 'acceptable') return 'acceptable-ukeire';
  if (grade === 'better') return 'worse-ukeire';
  return 'no-suggestion';
}
