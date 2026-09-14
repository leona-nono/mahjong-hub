import type { HongKongMode } from '../engine';
import type { ScorePattern } from './types';

/**
 * Hong Kong–specific scoring helpers.
 * Most HK fan branches remain interleaved in score-hand.ts; only pure
 * predicates that are cleanly extractable live here.
 */
export function isHongKongCasualChickenHand(
  mode: HongKongMode | undefined,
  patterns: ScorePattern[]
): boolean {
  return mode === 'casual' && patterns.reduce((sum, pattern) => sum + pattern.value, 0) === 0;
}
