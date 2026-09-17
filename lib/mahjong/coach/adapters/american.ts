import { americanCoachAdvice, type AmericanGameState, type AmericanSeat } from '../../american';
import type { CoachAdapter, CoachRisk, CoachVerdict } from '../contract';

/**
 * American is the richest implementation (risk / joker / outs).
 * Do NOT flatten away risk/note — the performance layer must display them.
 */
export function makeAmericanAdapter(): CoachAdapter<AmericanGameState, string> {
  return {
    ruleset: 'american',
    capability: 'partial',
    judge(state, seat, tile): CoachVerdict {
      const advice = americanCoachAdvice(state, seat as AmericanSeat);
      const suggested = advice.discard;
      const topDistance = advice.rankings[0]?.distance ?? 0;
      let grade: CoachVerdict['grade'] = null;
      if (suggested) {
        if (tile === suggested) grade = 'best';
        else if (advice.pass.includes(tile)) grade = 'acceptable';
        else grade = 'better';
      }

      const risk: CoachRisk | undefined = advice.discardRisk?.level;
      const noteParts: string[] = [advice.exposure];
      if (advice.jokerExchange) noteParts.push(`joker:${advice.jokerExchange}`);
      if (advice.outs.length) {
        noteParts.push(`outs:${advice.outs.map((o) => `${o.tile}x${o.remaining}`).join(',')}`);
      }

      return {
        // partial: still surface directional grade for American practice (card distance),
        // but capability stays partial so UI can label it honestly.
        grade,
        capability: 'partial',
        suggested,
        played: tile,
        gap: suggested && tile !== suggested ? -1 : 0,
        shanten: topDistance,
        ukeire: advice.outs.reduce((sum, o) => sum + o.remaining, 0),
        risk,
        note: noteParts.join('|')
      };
    },
    rank(state, seat) {
      const advice = americanCoachAdvice(state, seat as AmericanSeat);
      const distance = advice.rankings[0]?.distance ?? 0;
      return advice.pass.map((tile, index) => ({
        tile,
        shanten: distance,
        ukeire: Math.max(0, 10 - index)
      }));
    }
  };
}
