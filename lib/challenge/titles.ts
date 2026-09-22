import type { ChallengeGroup, SpecialtyId, TitleId } from './types';

const TITLE_BY_SCORE: TitleId[] = [
  'blank_tile',
  'lucky_guess',
  'still_learning',
  'steady_hand',
  'tile_scholar',
  'grand_master'
];

export function titleIdForScore(correct: number): TitleId {
  const n = Math.max(0, Math.min(5, Math.floor(correct)));
  return TITLE_BY_SCORE[n]!;
}

type Answered = { group: ChallengeGroup; correct: boolean };

/**
 * Optional specialty tag when ≥2 correct answers share a theme family.
 */
export function specialtyIdForAnswers(answers: Answered[]): SpecialtyId | null {
  const correct = answers.filter((a) => a.correct);
  const count = (groups: ChallengeGroup[]) =>
    correct.filter((a) => groups.includes(a.group)).length;

  const candidates: { id: SpecialtyId; n: number }[] = [
    { id: 'tile_spotter', n: count(['tiles', 'honours']) },
    { id: 'call_master', n: count(['calls']) },
    { id: 'win_reader', n: count(['winning']) },
    { id: 'pattern_reader', n: count(['patterns', 'rules']) }
  ];

  candidates.sort((a, b) => b.n - a.n || a.id.localeCompare(b.id));
  const top = candidates[0];
  if (!top || top.n < 2) return null;
  return top.id;
}
