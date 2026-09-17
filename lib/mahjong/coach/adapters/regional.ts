import type { RegionalGameState } from '../../regional';
import type { Tile } from '../../tiles';
import type { CoachAdapter, CoachVerdict } from '../contract';
import { resolveCoachCapability } from '../contract';

/**
 * Sichuan / Taiwan: bot heuristic must NOT grade the human player.
 * Capability is unsupported → watching only.
 *
 * chooseRegionalDiscard remains available for bots; do not call it for
 * player-facing grades.
 */
export function makeRegionalAdapter(ruleset: string): CoachAdapter<RegionalGameState, Tile> {
  const capability = resolveCoachCapability(ruleset);

  return {
    ruleset,
    capability: 'unsupported',
    judge(_state, _seat, _tile): CoachVerdict {
      return { grade: null, capability: 'unsupported' };
    },
    rank() {
      return [];
    }
  };
}
