import { describe, expect, it } from 'vitest';
import { catalogCover, resolveGameCover } from '@/lib/game-cover';

describe('game covers', () => {
  it('uses catalogue stills for classic and solitaire slugs', () => {
    expect(catalogCover('american-mahjong')).toBe(
      '/images/catalog/classic/american-mahjong.png'
    );
    expect(
      resolveGameCover({
        slug: 'american-mahjong',
        cover: '/assets/mahjong-solitaire/tiles/wind-e.png',
        category: 'four-player',
        native: 'american-mahjong'
      })
    ).toBe('/images/catalog/classic/american-mahjong.png');
    expect(
      resolveGameCover({
        slug: 'mahjong-solitaire-classic',
        cover: '',
        category: 'solitaire',
        native: 'mahjong-solitaire'
      })
    ).toBe('/images/catalog/solitaire/mahjong-solitaire-classic.png');
  });
});
