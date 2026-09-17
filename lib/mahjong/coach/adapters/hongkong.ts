import { judgeDiscard, rankDiscards } from '../../coach';
import type { GameState, Seat } from '../../engine';
import type { Tile } from '../../tiles';
import type { CoachAdapter, CoachVerdict } from '../contract';
import { resolveCoachCapability } from '../contract';

/**
 * Hong Kong / Riichi / Chinese Official share GameState.
 * Capability differs per ruleset — read it from the registry.
 *
 * Review P1-1: partial (riichi / MCR) MUST NOT go silent.
 * They still surface suggested / shanten / ukeire with note yaku_gate_pending,
 * but never emit a hard grade until Phase G scoring gates land.
 */
export function makeGameStateAdapter(ruleset: string): CoachAdapter<GameState, Tile> {
  const capability = resolveCoachCapability(ruleset);

  return {
    ruleset,
    capability,
    judge(state, seat, tile): CoachVerdict {
      if (capability === 'unsupported') {
        return { grade: null, capability };
      }

      const { grade, best, played } = judgeDiscard(state, seat as Seat, tile);
      const gap = played.ukeire - best.ukeire;

      if (capability === 'partial') {
        return {
          grade: null,
          capability,
          suggested: best.tile,
          played: played.tile,
          gap,
          shanten: best.shanten,
          ukeire: best.ukeire,
          note: 'yaku_gate_pending'
        };
      }

      return {
        grade,
        capability,
        suggested: best.tile,
        played: played.tile,
        gap,
        shanten: best.shanten,
        ukeire: best.ukeire
      };
    },
    rank(state, seat) {
      return rankDiscards(state, seat as Seat).map(({ tile, shanten, ukeire }) => ({
        tile,
        shanten,
        ukeire
      }));
    }
  };
}
