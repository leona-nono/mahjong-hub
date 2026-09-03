import { describe, expect, it } from 'vitest';
import { getAboutDoc } from '@/data/about';
import { getHomeGuideDoc } from '@/data/home-guide';
import aboutEn from '@/data/about-i18n/en.json';
import homeEn from '@/data/home-guide-i18n/en.json';
import type { AboutDoc } from '@/data/about';
import type { HomeGuideDoc } from '@/data/home-guide';

const LOCALES = ['zh', 'zh-TW', 'ja', 'ko'] as const;

describe('about page', () => {
  it('returns the English base for en and unsupported locales', () => {
    expect(getAboutDoc('en').title).toBe('About Mahjong Hub');
    expect(getAboutDoc('fr').title).toBe('About Mahjong Hub');
  });

  it('loads translated about JSON for CJK locales', () => {
    const zh = getAboutDoc('zh');
    expect(zh.sections.length).toBeGreaterThan(0);
    expect(zh.title).not.toBe('About Mahjong Hub');
    expect(zh.title).toContain('Mahjong Hub');
    expect(zh.intro).not.toBe((aboutEn as AboutDoc).intro);
  });
});

describe('home guide', () => {
  it('returns the English base for en and unsupported locales', () => {
    expect(getHomeGuideDoc('en').eyebrow).toBe('PLAY · LEARN · RELAX');
    expect(getHomeGuideDoc('de').title).toContain('Why play mahjong online');
  });

  it('matches English section structure in every locale', () => {
    const en = homeEn as HomeGuideDoc;
    for (const locale of LOCALES) {
      const doc = getHomeGuideDoc(locale);
      expect(doc.sections.length).toBe(en.sections.length);
      expect(doc.closing.length).toBe(en.closing.length);
    }
  });

  it('uses translated home-guide copy for CJK locales', () => {
    expect(getHomeGuideDoc('zh').title).not.toBe((homeEn as HomeGuideDoc).title);
    expect(getHomeGuideDoc('ja').eyebrow).not.toBe('PLAY · LEARN · RELAX');
  });
});

describe('about JSON', () => {
  it('keeps the same section count across locales', () => {
    const en = aboutEn as AboutDoc;
    for (const locale of LOCALES) {
      const doc = getAboutDoc(locale);
      expect(doc.sections.length).toBe(en.sections.length);
    }
  });
});
