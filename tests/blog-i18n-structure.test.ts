import { describe, expect, it } from 'vitest';
import { getBlogPosts } from '@/data/blog';
import { BLOG_I18N } from '@/data/blog.i18n';
import ja from '@/data/blog-i18n/ja.json';
import ko from '@/data/blog-i18n/ko.json';
import zh from '@/data/blog-i18n/zh.json';
import zhTW from '@/data/blog-i18n/zh-TW.json';
import type { BlogLocaleJson } from '@/data/blog-i18n/types';

const LOCALES = ['zh', 'zh-TW', 'ja', 'ko'] as const;
const LOCALE_JSON: Record<(typeof LOCALES)[number], BlogLocaleJson> = {
  zh: zh as BlogLocaleJson,
  'zh-TW': zhTW as BlogLocaleJson,
  ja: ja as BlogLocaleJson,
  ko: ko as BlogLocaleJson
};

function sectionShape(sections: { body: string[]; tiles?: unknown }[]) {
  return sections.map((s) => ({
    bodyLen: s.body.length,
    hasTiles: Boolean(s.tiles?.length)
  }));
}

describe('blog i18n structure', () => {
  for (const post of getBlogPosts()) {
    describe(post.slug, () => {
      const enShape = sectionShape(post.sections);
      const enFaqLen = post.faq.length;

      it('is wired in BLOG_I18N with all locales', () => {
        const entry = BLOG_I18N[post.slug];
        expect(entry?.sections).toBeDefined();
        expect(entry?.faq).toBeDefined();
        for (const locale of LOCALES) {
          expect(entry?.sections?.[locale]?.length).toBe(post.sections.length);
          expect(entry?.faq?.[locale]?.length).toBe(enFaqLen);
        }
      });

      it('matches English section body counts and tile flags', () => {
        for (const locale of LOCALES) {
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
      for (const locale of LOCALES) {
        expect(LOCALE_JSON[locale][slug]?.sections).toBeDefined();
        expect(LOCALE_JSON[locale][slug]?.faq).toBeDefined();
      }
    }
  });
});
