/**
 * Settlement teaching helpers for the performance layer.
 * Evidence generation lives in lib/mahjong/coach/evidence.ts (engine-safe).
 * This module maps Evidence kinds → i18n template keys under review.evidence.*.
 */

import type { Evidence } from '@/lib/mahjong/coach/review';

export function evidenceTemplateKey(evidence: Evidence): string {
  switch (evidence.kind) {
    case 'allTiles':
      return `allTiles.${evidence.predicate}`;
    case 'setComposition':
      return `setComposition.${evidence.all}`;
    case 'specificSets':
      return `specificSets.${evidence.what}`;
    case 'waitShape':
      return `waitShape.${evidence.shape}`;
    case 'winCondition':
      return `winCondition.${evidence.condition}`;
    case 'declaration':
      return `declaration.${evidence.what}`;
    case 'doraCount':
      return 'doraCount';
    case 'specialShape':
      return `specialShape.${evidence.shape}`;
    case 'sequencePattern':
      return `sequencePattern.${evidence.pattern}`;
    case 'kongCount':
      return 'kongCount';
    case 'flowerCount':
      return 'flowerCount';
    case 'gate':
      return evidence.reason === 'chickenHand' ? 'gate.chickenHand' : 'gate.generic';
    case 'fallback':
    default:
      return 'fallback';
  }
}
