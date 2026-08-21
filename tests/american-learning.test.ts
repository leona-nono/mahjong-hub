import { describe, expect, it } from 'vitest';
import { validateAmericanCardDraft } from '@/lib/mahjong/american-card-validator';
import { AMERICAN_LESSONS, startAmericanLesson } from '@/lib/mahjong/american-learning';

describe('American Mahjong P1 learning and card operations', () => {
  it('starts each product-owned lesson with its card locked', () => {
    for (const lesson of AMERICAN_LESSONS) {
      const started = startAmericanLesson(lesson.id);
      expect(started.game.activeCardIds).toEqual([lesson.cardId]);
      expect(started.game.seed).toBe(lesson.seed);
    }
  });
  it('accepts a 14-tile original draft and rejects an incomplete one', () => {
    const valid = validateAmericanCardDraft({ id: 'draft-garden-v1', version: '1.0.0', title: 'Draft', difficulty: 'advanced', points: 50, description: 'A product-owned draft.', seasonIds: ['foundation-2026'], groups: [{ kind: 'kong', matcher: { type: 'face', face: 'm1' }, label: '1111' }, { kind: 'kong', matcher: { type: 'face', face: 'p1' }, label: '1111' }, { kind: 'quint', matcher: { type: 'face', face: 's1' }, label: '11111' }, { kind: 'single', matcher: { type: 'face', face: 'z1' }, label: 'East' }] });
    expect(valid.valid).toBe(true);
    expect(validateAmericanCardDraft({ id: 'bad', version: '1', title: '', groups: [] }).valid).toBe(false);
  });
});
