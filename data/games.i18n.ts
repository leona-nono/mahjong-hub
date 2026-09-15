/**
 * Game locale overrides — loaded from JSON under data/games-i18n/.
 *
 * English source of truth for copy: data/games-i18n/en.json (exported from
 * games.ts; Studio can edit EN there). Structural fields (native, navGroup,
 * region, gameType) stay in data/games.ts.
 * Non-English: data/games-i18n/{zh,zh-TW,...}.json, merged by getLocalizedGame().
 */
import type { GameContent } from './games';
import type { GameLocaleJson } from './games-i18n/types';
import de from './games-i18n/de.json';
import en from './games-i18n/en.json';
import es from './games-i18n/es.json';
import fr from './games-i18n/fr.json';
import ja from './games-i18n/ja.json';
import ko from './games-i18n/ko.json';
import ptBR from './games-i18n/pt-BR.json';
import zh from './games-i18n/zh.json';
import zhTW from './games-i18n/zh-TW.json';

export type LocaleCode =
  | 'en'
  | 'zh'
  | 'zh-TW'
  | 'ja'
  | 'ko'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt-BR';

export interface GameI18n {
  title?: Partial<Record<LocaleCode, string>>;
  description?: Partial<Record<LocaleCode, string>>;
  content?: Partial<Record<LocaleCode, Partial<GameContent>>>;
}

const EN_FILE = en as GameLocaleJson;

const LOCALE_FILES: Record<Exclude<LocaleCode, 'en'>, GameLocaleJson> = {
  zh: zh as GameLocaleJson,
  'zh-TW': zhTW as GameLocaleJson,
  ja: ja as GameLocaleJson,
  ko: ko as GameLocaleJson,
  es: es as GameLocaleJson,
  fr: fr as GameLocaleJson,
  de: de as GameLocaleJson,
  'pt-BR': ptBR as GameLocaleJson
};

const LOCALES = [
  'zh',
  'zh-TW',
  'ja',
  'ko',
  'es',
  'fr',
  'de',
  'pt-BR'
] as const satisfies readonly Exclude<LocaleCode, 'en'>[];

function buildGameI18n(): Record<string, GameI18n> {
  const out: Record<string, GameI18n> = {};
  const slugs = new Set<string>(Object.keys(EN_FILE));

  for (const locale of LOCALES) {
    for (const slug of Object.keys(LOCALE_FILES[locale])) slugs.add(slug);
  }

  for (const slug of slugs) {
    const entry: GameI18n = { title: {}, description: {}, content: {} };
    const enData = EN_FILE[slug];
    if (enData) {
      entry.title!.en = enData.title;
      entry.description!.en = enData.description;
      if (enData.content) entry.content!.en = enData.content as Partial<GameContent>;
    }
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
