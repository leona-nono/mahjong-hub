/**
 * Hand scoring — public API barrel.
 * Implementation lives in ./scoring/*.
 */
export type { ScorePattern, ScoreResult, ScoreInput } from './scoring/types';
export { scoreHand, describeScore } from './scoring/score-hand';
export { isDragon, isHonour } from './tiles';
