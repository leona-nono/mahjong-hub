/**
 * Campaign / teaching levels (design: levels 1–3 situational onboarding).
 */

import { createBoard, type BoardOptions } from './generator';
import type { Board } from './board';
import type { SolitaireLayout } from './layouts';

export type TutorialFocus = 'free_tile' | 'flower_match' | 'deadlock';

export interface LevelDef {
  id: string;
  order: number;
  /** Short English label (UI may i18n via id). */
  title: string;
  layout: SolitaireLayout;
  /** Fixed seed so coaches can demo consistently. */
  seed: number;
  tutorial: TutorialFocus;
  deal: Pick<
    BoardOptions,
    'includeBonus' | 'avoidLookalikes' | 'forceFlowerPairs'
  >;
  /** Coach copy key under messages.solitaire.* */
  coachKey: 'coachFree' | 'coachFlower' | 'coachDead';
}

export const TEACHING_LEVELS: LevelDef[] = [
  {
    id: 'teach-1',
    order: 1,
    title: 'Lesson 1 · Free tiles',
    layout: 'flat36',
    seed: 1001,
    tutorial: 'free_tile',
    deal: {
      includeBonus: false,
      avoidLookalikes: true,
      forceFlowerPairs: false
    },
    coachKey: 'coachFree'
  },
  {
    id: 'teach-2',
    order: 2,
    title: 'Lesson 2 · Flowers',
    layout: 'flat36',
    seed: 2002,
    tutorial: 'flower_match',
    deal: {
      includeBonus: true,
      avoidLookalikes: true,
      forceFlowerPairs: true
    },
    coachKey: 'coachFlower'
  },
  {
    id: 'teach-3',
    order: 3,
    title: 'Lesson 3 · Dead ends',
    layout: 'mini',
    seed: 3003,
    tutorial: 'deadlock',
    deal: {
      includeBonus: true,
      avoidLookalikes: false,
      forceFlowerPairs: true
    },
    coachKey: 'coachDead'
  }
];

export function getLevel(id: string): LevelDef | undefined {
  return TEACHING_LEVELS.find((l) => l.id === id);
}

export function createLevelBoard(level: LevelDef): Board {
  return createBoard({
    layout: level.layout,
    seed: level.seed,
    ...level.deal
  });
}

export function nextLevelId(currentId: string): string | null {
  const i = TEACHING_LEVELS.findIndex((l) => l.id === currentId);
  if (i < 0 || i >= TEACHING_LEVELS.length - 1) return null;
  return TEACHING_LEVELS[i + 1].id;
}
