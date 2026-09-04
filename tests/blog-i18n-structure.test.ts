import { describe, expect, it } from 'vitest';
import { getBlogPosts, getLocalizedBlogPost } from '@/data/blog';
import { BLOG_I18N } from '@/data/blog.i18n';
import de from '@/data/blog-i18n/de.json';
import es from '@/data/blog-i18n/es.json';
import fr from '@/data/blog-i18n/fr.json';
import ja from '@/data/blog-i18n/ja.json';
import ko from '@/data/blog-i18n/ko.json';
import ptBR from '@/data/blog-i18n/pt-BR.json';
import zh from '@/data/blog-i18n/zh.json';
import zhTW from '@/data/blog-i18n/zh-TW.json';
import type { BlogLocaleJson } from '@/data/blog-i18n/types';
import { CONTENT_LOCALES } from '@/lib/locales';

const LOCALE_JSON: Record<(typeof CONTENT_LOCALES)[number], BlogLocaleJson> = {
  zh: zh as BlogLocaleJson,
  'zh-TW': zhTW as BlogLocaleJson,
  ja: ja as BlogLocaleJson,
  ko: ko as BlogLocaleJson,
  es: es as BlogLocaleJson,
  fr: fr as BlogLocaleJson,
  de: de as BlogLocaleJson,
  'pt-BR': ptBR as BlogLocaleJson
};

function sectionShape(sections: unknown) {
  if (!Array.isArray(sections)) return [];
  return sections.map((section) => {
    const record =
      section !== null && typeof section === 'object' && !Array.isArray(section)
        ? (section as Record<string, unknown>)
        : null;
    const body = record && Array.isArray(record.body) ? record.body : [];
    const tiles = record?.tiles;
    return {
      bodyLen: body.length,
      hasTiles: Array.isArray(tiles) && tiles.length > 0
    };
  });
}

describe('blog i18n structure', () => {
  for (const post of getBlogPosts()) {
    describe(post.slug, () => {
      const enShape = sectionShape(post.sections);
      const enFaqLen = post.faq.length;

      it('is wired in BLOG_I18N with all content locales', () => {
        const entry = BLOG_I18N[post.slug];
        expect(entry?.sections).toBeDefined();
        expect(entry?.faq).toBeDefined();
        for (const locale of CONTENT_LOCALES) {
          expect(entry?.sections?.[locale]?.length).toBe(post.sections.length);
          expect(entry?.faq?.[locale]?.length).toBe(enFaqLen);
        }
      });

      it('matches English section body counts and tile flags', () => {
        for (const locale of CONTENT_LOCALES) {
          const localized = BLOG_I18N[post.slug]?.sections?.[locale];
          expect(localized).toBeDefined();
          expect(sectionShape(localized!)).toEqual(enShape);
        }
      });
    });
  }

  it('exports every slug from locale JSON files', () => {
    const slugs = getBlogPosts().map((p) => p.slug);
    for (const slug of slugs) {
      for (const locale of CONTENT_LOCALES) {
        expect(LOCALE_JSON[locale][slug]?.sections).toBeDefined();
        expect(LOCALE_JSON[locale][slug]?.faq).toBeDefined();
      }
    }
  });

  it('EU locales do not fall back to English body for what-is-mahjong', () => {
    const en = getLocalizedBlogPost('what-is-mahjong', 'en');
    for (const locale of ['es', 'fr', 'de', 'pt-BR'] as const) {
      const localized = getLocalizedBlogPost('what-is-mahjong', locale);
      expect(localized?.title).toBeTruthy();
      expect(localized?.title).not.toBe(en?.title);
      expect(localized?.sections[0]?.body[0]).not.toBe(en?.sections[0]?.body[0]);
    }
  });
});
