import { describe, expect, it } from 'vitest';
import { getGames } from '@/data/games';
import { getLocalizedGame } from '@/data/games';
import { GAME_I18N } from '@/data/games.i18n';
import ja from '@/data/games-i18n/ja.json';
import ko from '@/data/games-i18n/ko.json';
import zh from '@/data/games-i18n/zh.json';
import zhTW from '@/data/games-i18n/zh-TW.json';
import type { GameLocaleJson } from '@/data/games-i18n/types';

const LOCALES = ['zh', 'zh-TW', 'ja', 'ko'] as const;
const LOCALE_JSON: Record<(typeof LOCALES)[number], GameLocaleJson> = {
  zh: zh as GameLocaleJson,
  'zh-TW': zhTW as GameLocaleJson,
  ja: ja as GameLocaleJson,
  ko: ko as GameLocaleJson
};

describe('games i18n', () => {
  it('every localized game slug exists in the base catalogue', () => {
    const base = new Set(getGames().map((g) => g.slug));
    for (const slug of Object.keys(GAME_I18N)) {
      expect(base.has(slug)).toBe(true);
    }
  });

  it('getLocalizedGame returns locale title and description', () => {
    expect(getLocalizedGame('hong-kong-mahjong', 'zh')?.title).toBe('香港麻将');
    expect(getLocalizedGame('mahjong-solitaire-classic', 'ja')?.title).toBe(
      '麻雀ソリティアクラシック'
    );
  });

  it('localized content merges with English fallback for optional fields', () => {
    const game = getLocalizedGame('hong-kong-mahjong', 'zh');
    expect(game?.content?.features?.length).toBe(5);
    expect(game?.content?.supportedDevices).toContain('浏览器');
    expect(game?.content?.features?.[0]).not.toMatch(/^[A-Za-z]/);
    expect(game?.content?.howToPlay?.[0]).toContain('十三张牌');
  });

  it('locale JSON files contain title and description for every slug', () => {
    for (const slug of Object.keys(GAME_I18N)) {
      for (const locale of LOCALES) {
        expect(LOCALE_JSON[locale][slug]?.title).toBeTruthy();
        expect(LOCALE_JSON[locale][slug]?.description).toBeTruthy();
      }
    }
  });
});
