import { describe, expect, it } from 'vitest';
import {
  buildShareText,
  dealChallenge,
  encodeChallengeSeed,
  parseChallengeSeed,
  specialtyIdForAnswers,
  titleIdForScore
} from '@/lib/challenge';

describe('challenge seed codec', () => {
  it('round-trips seeds', () => {
    const seed = 123456789;
    expect(parseChallengeSeed(encodeChallengeSeed(seed))).toBe(seed >>> 0);
  });

  it('rejects junk', () => {
    expect(parseChallengeSeed('')).toBeNull();
    expect(parseChallengeSeed('not!ok')).toBeNull();
  });
});

describe('dealChallenge', () => {
  it('is deterministic for the same seed', () => {
    const a = dealChallenge(42);
    const b = dealChallenge(42);
    expect(a.questions.map((q) => q.id)).toEqual(b.questions.map((q) => q.id));
    expect(a.questions.map((q) => q.options.map((o) => o.id))).toEqual(
      b.questions.map((q) => q.options.map((o) => o.id))
    );
  });

  it('returns five questions with identify/term/rule mix', () => {
    const deal = dealChallenge(99);
    expect(deal.questions).toHaveLength(5);
    const kinds = deal.questions.map((q) => q.kind);
    expect(kinds.filter((k) => k === 'identify')).toHaveLength(2);
    expect(kinds.filter((k) => k === 'term')).toHaveLength(2);
    expect(kinds.filter((k) => k === 'rule')).toHaveLength(1);
  });

  it('differs across seeds', () => {
    const a = dealChallenge(1).questions.map((q) => q.id).join(',');
    const b = dealChallenge(2).questions.map((q) => q.id).join(',');
    expect(a).not.toEqual(b);
  });
});

describe('titles and share', () => {
  it('maps every score including zero to a title', () => {
    expect(titleIdForScore(0)).toBe('blank_tile');
    expect(titleIdForScore(5)).toBe('grand_master');
  });

  it('never puts answers in the share text', () => {
    const text = buildShareText({
      locale: 'en',
      correct: 0,
      total: 5,
      titleId: 'blank_tile',
      specialtyId: null,
      seed: 7
    });
    expect(text).toContain('Blank Tile');
    expect(text).toContain('?c=');
    expect(text.toLowerCase()).not.toContain('answer');
    expect(text).not.toMatch(/pong|chow|kong/i);
  });

  it('awards a specialty when two correct share a family', () => {
    const tag = specialtyIdForAnswers([
      { group: 'calls', correct: true },
      { group: 'calls', correct: true },
      { group: 'tiles', correct: false },
      { group: 'winning', correct: false },
      { group: 'rules', correct: false }
    ]);
    expect(tag).toBe('call_master');
  });
});
