/**
 * Game locale overrides — loaded from JSON under data/games-i18n/.
 *
 * English base: data/games.ts. Non-English title/description/content live in
 * data/games-i18n/{zh,zh-TW,ja,ko}.json and are merged by getLocalizedGame().
 */
import type { GameContent } from './games';
import type { GameLocaleJson } from './games-i18n/types';
import ja from './games-i18n/ja.json';
import ko from './games-i18n/ko.json';
import zh from './games-i18n/zh.json';
import zhTW from './games-i18n/zh-TW.json';

export type LocaleCode = 'en' | 'zh' | 'zh-TW' | 'ja' | 'ko';

export interface GameI18n {
  title?: Partial<Record<LocaleCode, string>>;
  description?: Partial<Record<LocaleCode, string>>;
  content?: Partial<Record<LocaleCode, Partial<GameContent>>>;
}

const LOCALE_FILES: Record<Exclude<LocaleCode, 'en'>, GameLocaleJson> = {
  zh: zh as GameLocaleJson,
  'zh-TW': zhTW as GameLocaleJson,
  ja: ja as GameLocaleJson,
  ko: ko as GameLocaleJson
};

const LOCALES = ['zh', 'zh-TW', 'ja', 'ko'] as const;

function buildGameI18n(): Record<string, GameI18n> {
  const out: Record<string, GameI18n> = {};
  const slugs = new Set<string>();

  for (const locale of LOCALES) {
    for (const slug of Object.keys(LOCALE_FILES[locale])) slugs.add(slug);
  }

  for (const slug of slugs) {
    const entry: GameI18n = { title: {}, description: {}, content: {} };
    for (const locale of LOCALES) {
      const data = LOCALE_FILES[locale][slug];
      if (!data) continue;
      entry.title![locale] = data.title;
      entry.description![locale] = data.description;
      if (data.content) entry.content![locale] = data.content as Partial<GameContent>;
    }
    out[slug] = entry;
  }

  return out;
}

export const GAME_I18N: Record<string, GameI18n> = buildGameI18n();
