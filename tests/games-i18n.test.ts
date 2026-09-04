import { describe, expect, it } from 'vitest';
import { getGames, getLocalizedGame } from '@/data/games';
import { GAME_I18N } from '@/data/games.i18n';
import de from '@/data/games-i18n/de.json';
import es from '@/data/games-i18n/es.json';
import fr from '@/data/games-i18n/fr.json';
import ja from '@/data/games-i18n/ja.json';
import ko from '@/data/games-i18n/ko.json';
import ptBR from '@/data/games-i18n/pt-BR.json';
import zh from '@/data/games-i18n/zh.json';
import zhTW from '@/data/games-i18n/zh-TW.json';
import type { GameLocaleJson } from '@/data/games-i18n/types';
import { CONTENT_LOCALES } from '@/lib/locales';

const LOCALE_JSON: Record<(typeof CONTENT_LOCALES)[number], GameLocaleJson> = {
  zh: zh as GameLocaleJson,
  'zh-TW': zhTW as GameLocaleJson,
  ja: ja as GameLocaleJson,
  ko: ko as GameLocaleJson,
  es: es as GameLocaleJson,
  fr: fr as GameLocaleJson,
  de: de as GameLocaleJson,
  'pt-BR': ptBR as GameLocaleJson
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
    expect(getLocalizedGame('hong-kong-mahjong', 'es')?.title).toContain('Hong Kong');
    expect(getLocalizedGame('hong-kong-mahjong', 'fr')?.title).not.toBe(
      getGames().find((g) => g.slug === 'hong-kong-mahjong')?.title
    );
  });

  it('localized content merges with English fallback for optional fields', () => {
    const game = getLocalizedGame('hong-kong-mahjong', 'zh');
    expect(game?.content?.features?.length).toBe(5);
    expect(game?.content?.supportedDevices).toContain('浏览器');
    expect(game?.content?.features?.[0]).not.toMatch(/^[A-Za-z]/);
    expect(game?.content?.howToPlay?.[0]).toContain('十三张牌');
  });

  it('EU locales ship translated features for native rulesets', () => {
    const esGame = getLocalizedGame('hong-kong-mahjong', 'es');
    const en = getGames().find((g) => g.slug === 'hong-kong-mahjong');
    expect(esGame?.content?.features?.[0]).toBeTruthy();
    expect(esGame?.content?.features?.[0]).not.toBe(en?.content?.features?.[0]);
    expect(esGame?.content?.supportedDevices).not.toBe(en?.content?.supportedDevices);
  });

  it('locale JSON files contain title and description for every slug', () => {
    for (const slug of Object.keys(GAME_I18N)) {
      for (const locale of CONTENT_LOCALES) {
        expect(LOCALE_JSON[locale][slug]?.title).toBeTruthy();
        expect(LOCALE_JSON[locale][slug]?.description).toBeTruthy();
      }
    }
  });
});
