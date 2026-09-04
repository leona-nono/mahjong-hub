import { describe, expect, it } from 'vitest';
import { getAboutDoc } from '@/data/about';
import { getHomeGuideDoc } from '@/data/home-guide';
import aboutEn from '@/data/about-i18n/en.json';
import homeEn from '@/data/home-guide-i18n/en.json';
import type { AboutDoc } from '@/data/about';
import type { HomeGuideDoc } from '@/data/home-guide';
import { CONTENT_LOCALES } from '@/lib/locales';

describe('about page', () => {
  it('returns the English base for en and unsupported locales', () => {
    expect(getAboutDoc('en').title).toBe('About Mahjong Hub');
    expect(getAboutDoc('xx').title).toBe('About Mahjong Hub');
  });

  it('loads translated about JSON for every content locale', () => {
    const en = aboutEn as AboutDoc;
    for (const locale of CONTENT_LOCALES) {
      const doc = getAboutDoc(locale);
      expect(doc.sections.length).toBe(en.sections.length);
      expect(doc.title).not.toBe(en.title);
      expect(doc.intro).not.toBe(en.intro);
    }
  });
});

describe('home guide', () => {
  it('returns the English base for en and unsupported locales', () => {
    expect(getHomeGuideDoc('en').eyebrow).toBe('PLAY · LEARN · RELAX');
    expect(getHomeGuideDoc('xx').title).toContain('Why play mahjong online');
  });

  it('matches English section structure in every content locale', () => {
    const en = homeEn as HomeGuideDoc;
    for (const locale of CONTENT_LOCALES) {
      const doc = getHomeGuideDoc(locale);
      expect(doc.sections.length).toBe(en.sections.length);
      expect(doc.closing.length).toBe(en.closing.length);
      expect(doc.title).not.toBe(en.title);
    }
  });
});
