import { AMERICAN_PRACTICE_SEASONS, practiceGroupCount, type OriginalPracticeCard } from './american';

export type AmericanCardDraft = OriginalPracticeCard & { seasonIds?: string[]; status?: 'draft' | 'published' | 'retired' };

/** Validation shared by future admin UI/API before an original card can publish. */
export function validateAmericanCardDraft(card: Partial<AmericanCardDraft>) {
  const errors: string[] = [];
  if (!card.id?.match(/^[a-z0-9-]+-v\d+$/)) errors.push('id must be kebab-case and end in -vN');
  if (!card.version?.match(/^\d+\.\d+\.\d+$/)) errors.push('version must be semantic x.y.z');
  if (!card.title?.trim()) errors.push('title is required');
  if (!['beginner', 'intermediate', 'advanced'].includes(card.difficulty ?? '')) errors.push('difficulty must be beginner, intermediate, or advanced');
  if (!Number.isInteger(card.points) || (card.points ?? 0) < 1 || (card.points ?? 0) > 200) errors.push('points must be an integer between 1 and 200');
  if (!card.description?.trim()) errors.push('description is required');
  if (card.status && !['draft', 'published', 'retired'].includes(card.status)) errors.push('status must be draft, published, or retired');
  if (card.seasonIds?.some((id) => !AMERICAN_PRACTICE_SEASONS.some((season) => season.id === id))) errors.push('seasonIds contains an unknown season');
  if (!card.groups?.length) errors.push('at least one group is required');
  const total = card.groups?.reduce((sum, group) => sum + practiceGroupCount(group), 0) ?? 0;
  if (total !== 14) errors.push('a practice card must contain exactly 14 tiles');
  for (const group of card.groups ?? []) {
    if (!group.label?.trim()) errors.push('every group needs a label');
    if (practiceGroupCount(group) < 1 || practiceGroupCount(group) > 6) errors.push('group size must be between 1 and 6');
    if (!group.face && !group.matcher) errors.push('every group needs a face or matcher');
    if (group.matcher?.type === 'rank' && (!group.matcher.suitKey || group.matcher.rank < 1 || group.matcher.rank > 9)) errors.push('rank matchers require suitKey and rank 1-9');
  }
  return { valid: errors.length === 0, errors, total };
}
