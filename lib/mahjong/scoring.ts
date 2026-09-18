/**
 * Hand scoring — public API barrel.
 * Implementation lives in ./scoring/*.
 */
export type { ScorePattern, ScoreResult, ScoreInput, ScoreGate } from './scoring/types';
export { scoreHand, describeScore } from './scoring/score-hand';
export { isDragon, isHonour } from './tiles';
export { expandSet, type HandSet } from './shanten';
