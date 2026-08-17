import { describe, expect, it } from 'vitest';
import { applySeoTemplate, clipSeo } from '@/lib/seo-templates';

describe('applySeoTemplate', () => {
  it('replaces known placeholders', () => {
    expect(
      applySeoTemplate('{game} - Free Online | {brand}', {
        game: 'Hong Kong Mahjong',
        brand: 'Mahjong Hub'
      })
    ).toBe('Hong Kong Mahjong - Free Online | Mahjong Hub');
  });

  it('keeps unknown placeholders', () => {
    expect(applySeoTemplate('{game} | {missing}', { game: 'Solitaire' })).toBe(
      'Solitaire | {missing}'
    );
  });
});

describe('clipSeo', () => {
  it('leaves short text unchanged', () => {
    expect(clipSeo('Play free mahjong', 160)).toBe('Play free mahjong');
  });

  it('clips long text on a word boundary', () => {
    const out = clipSeo('Play free mahjong solitaire connect and classic games online now', 28);
    expect(out.endsWith('…')).toBe(true);
    expect(out.length).toBeLessThanOrEqual(28);
  });
});
