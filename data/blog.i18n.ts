/**
 * Blog locale overlays — loaded from JSON under data/blog-i18n/.
 *
 * English source of truth: data/blog-i18n/en.json (exported from blog.ts;
 * Studio can edit EN there). Structure fields (slug, keywords, cta, dates)
 * still live in data/blog.ts + data/blog.cornerstone.ts.
 * Other locales: data/blog-i18n/{zh,zh-TW,...}.json.
 */
import type { BlogFaq, BlogSection } from './blog';
import de from './blog-i18n/de.json';
import en from './blog-i18n/en.json';
import es from './blog-i18n/es.json';
import fr from './blog-i18n/fr.json';
import ja from './blog-i18n/ja.json';
import ko from './blog-i18n/ko.json';
import ptBR from './blog-i18n/pt-BR.json';
import zh from './blog-i18n/zh.json';
import zhTW from './blog-i18n/zh-TW.json';
import type { BlogLocaleJson } from './blog-i18n/types';

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

export interface BlogI18n {
  title?: Partial<Record<LocaleCode, string>>;
  description?: Partial<Record<LocaleCode, string>>;
  sections?: Partial<Record<LocaleCode, BlogSection[]>>;
  faq?: Partial<Record<LocaleCode, BlogFaq[]>>;
}

const EN_FILE = en as BlogLocaleJson;

const LOCALE_FILES: Record<Exclude<LocaleCode, 'en'>, BlogLocaleJson> = {
  zh: zh as BlogLocaleJson,
  'zh-TW': zhTW as BlogLocaleJson,
  ja: ja as BlogLocaleJson,
  ko: ko as BlogLocaleJson,
  es: es as BlogLocaleJson,
  fr: fr as BlogLocaleJson,
  de: de as BlogLocaleJson,
  'pt-BR': ptBR as BlogLocaleJson
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

function buildBlogI18n(): Record<string, BlogI18n> {
  // English file is the slug source of truth — new posts must exist in EN first.
  const slugs = Object.keys(EN_FILE);
  const out: Record<string, BlogI18n> = {};

  for (const slug of slugs) {
    const enPost = EN_FILE[slug];
    const entry: BlogI18n = {
      title: { en: enPost.title },
      description: { en: enPost.description },
      sections: { en: enPost.sections },
      faq: { en: enPost.faq }
    };
    for (const locale of LOCALES) {
      const post = LOCALE_FILES[locale][slug];
      if (!post) {
        throw new Error(`Missing slug "${slug}" in data/blog-i18n/${locale}.json`);
      }
      entry.title![locale] = post.title;
      entry.description![locale] = post.description;
      entry.sections![locale] = post.sections;
      entry.faq![locale] = post.faq;
    }
    out[slug] = entry;
  }

  return out;
}

export const BLOG_I18N: Record<string, BlogI18n> = buildBlogI18n();
