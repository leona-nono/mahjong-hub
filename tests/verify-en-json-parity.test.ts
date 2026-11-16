import { describe, expect, it } from 'vitest';
import {
  blogStructureFailures,
  collectParityFailures,
  slugSetFailures
} from '../scripts/verify-en-json-parity';

const post = {
  slug: 'sample',
  title: 'TypeScript title',
  description: 'TypeScript description',
  sections: [
    { heading: 'One', body: ['alpha'] },
    { heading: 'Two', body: ['beta'] }
  ],
  faq: [{ question: 'Q', answer: 'A' }]
};

describe('verify:en structure parity', () => {
  it('passes a text-only divergence', () => {
    const failures = collectParityFailures({
      blogPosts: [post],
      blogJson: {
        sample: {
          title: 'Studio title',
          description: 'Studio description',
          sections: [
            { heading: 'Rewritten one', body: ['different paragraph'] },
            { heading: 'Rewritten two', body: ['another paragraph', 'extra sentence'] }
          ],
          faq: [{ question: 'Different question', answer: 'Different answer' }]
        }
      },
      games: [{ slug: 'hong-kong', content: { howToPlay: ['step'], tips: ['tip'], faq: [{ question: 'Q', answer: 'A' }] } }],
      gamesJson: {
        'hong-kong': {
          title: 'Edited title',
          description: 'Edited description',
          content: {
            intro: 'Edited intro',
            howToPlay: ['rewritten step'],
            tips: ['rewritten tip'],
            faq: [{ question: 'Edited', answer: 'Edited' }]
          }
        }
      }
    });
    expect(failures).toEqual([]);
  });

  it('fails when a slug is missing on either side', () => {
    expect(slugSetFailures('blog', ['a', 'b'], ['a'])).toEqual(['blog: slugs missing in JSON: b']);
    expect(slugSetFailures('blog', ['a'], ['a', 'extra'])).toEqual(['blog: stale slugs in JSON: extra']);
    const failures = collectParityFailures({
      blogPosts: [post],
      blogJson: {},
      games: [],
      gamesJson: { orphan: { title: 'x' } }
    });
    expect(failures.some((line) => line.includes('slugs missing in JSON: sample'))).toBe(true);
    expect(failures.some((line) => line.includes('stale slugs in JSON: orphan'))).toBe(true);
  });

  it('fails when section count or FAQ count differs', () => {
    expect(
      blogStructureFailures(
        'sample',
        post,
        {
          sections: [{ heading: 'Only one', body: ['x'] }],
          faq: post.faq
        }
      )
    ).toEqual(['sample: section count 2 (TS) != 1 (JSON)']);

    expect(
      blogStructureFailures(
        'sample',
        post,
        {
          sections: post.sections,
          faq: []
        }
      )
    ).toEqual(['sample: FAQ count 1 (TS) != 0 (JSON)']);
  });
});
