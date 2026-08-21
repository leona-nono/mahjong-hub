import { createAmericanGame, type AmericanGameState } from './american';

export type AmericanLessonStage = 'read-card' | 'charleston' | 'joker' | 'exposure' | 'endgame';
export type AmericanPracticeScenario = {
  id: string;
  stage: AmericanLessonStage;
  title: string;
  goal: string;
  cardId: string;
  seed: number;
  seasonId: string;
};

/** Product-owned, replayable lessons. They never contain an NMJL annual line. */
export const AMERICAN_LESSONS: AmericanPracticeScenario[] = [
  { id: 'read-colour-relay', stage: 'read-card', title: 'Read Colour Relay', goal: 'Identify the single, pair, Pung and two Kongs before passing.', cardId: 'colour-relay-v1', seed: 20260901, seasonId: 'harvest-2026' },
  { id: 'charleston-flexibility', stage: 'charleston', title: 'Charleston Flexibility', goal: 'Pass three low-commitment tiles; keep Jokers and two live lines.', cardId: 'garden-ladder-v1', seed: 20260902, seasonId: 'foundation-2026' },
  { id: 'joker-boundaries', stage: 'joker', title: 'Joker Boundaries', goal: 'Keep the Joker for a group of three or more; do not use it for a pair.', cardId: 'pair-parade-v1', seed: 20260903, seasonId: 'foundation-2026' },
  { id: 'exposure-commitment', stage: 'exposure', title: 'Exposure Commitment', goal: 'Call only a group your locked card allows, then review the commitment warning.', cardId: 'colour-relay-v1', seed: 20260904, seasonId: 'harvest-2026' },
  { id: 'long-ribbon-finish', stage: 'endgame', title: 'Long Ribbon Endgame', goal: 'Use remaining outs and public risk to finish the Quint/Sextet line.', cardId: 'long-ribbon-v1', seed: 20260905, seasonId: 'harvest-2026' }
];

export function startAmericanLesson(id: string): { lesson: AmericanPracticeScenario; game: AmericanGameState } {
  const lesson = AMERICAN_LESSONS.find((item) => item.id === id);
  if (!lesson) throw new Error(`Unknown American Mahjong lesson: ${id}`);
  const game = createAmericanGame(lesson.seed, lesson.cardId, undefined, lesson.seasonId);
  game.activeCardIds = [lesson.cardId];
  game.history.push(`Lesson started: ${lesson.id}.`);
  return { lesson, game };
}
