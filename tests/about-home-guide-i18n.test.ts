import { describe, expect, it } from 'vitest';
import { getAboutDoc, mergeAboutDoc } from '@/data/about';
import { getHomeGuideDoc, mergeHomeGuideDoc } from '@/data/home-guide';
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

describe('mergeAboutDoc field-level fallback', () => {
  const en = aboutEn as AboutDoc;

  it('returns en when overlay is undefined', () => {
    expect(mergeAboutDoc(en, undefined)).toBe(en);
  });

  it('falls back empty title / missing section arrays to English', () => {
    const partial: AboutDoc = {
      title: '',
      intro: 'Localized intro',
      metaDescription: en.metaDescription,
      sections: [
        {
          heading: 'Localized heading'
          // paragraphs omitted → fall back to en.sections[0].paragraphs
        }
      ]
    };
    const merged = mergeAboutDoc(en, partial);
    expect(merged.title).toBe(en.title);
    expect(merged.intro).toBe('Localized intro');
    expect(merged.sections[0].heading).toBe('Localized heading');
    expect(merged.sections[0].paragraphs).toEqual(en.sections[0].paragraphs);
    expect(merged.sections[1].heading).toBe(en.sections[1].heading);
  });
});

describe('mergeHomeGuideDoc field-level fallback', () => {
  const en = homeEn as HomeGuideDoc;

  it('returns en when overlay is undefined', () => {
    expect(mergeHomeGuideDoc(en, undefined)).toBe(en);
  });

  it('falls back missing bullets/choices and empty eyebrow to English', () => {
    const partial: HomeGuideDoc = {
      eyebrow: '   ',
      title: 'Localized title',
      intro: en.intro,
      sections: [
        {
          heading: 'Localized section'
          // bullets omitted
        },
        {
          heading: '',
          choices: [{ prompt: 'Only choice overlay' }]
        }
      ],
      closing: en.closing
    };
    const merged = mergeHomeGuideDoc(en, partial);
    expect(merged.eyebrow).toBe(en.eyebrow);
    expect(merged.title).toBe('Localized title');
    expect(merged.sections[0].heading).toBe('Localized section');
    expect(merged.sections[0].bullets).toEqual(en.sections[0].bullets);
    expect(merged.sections[1].heading).toBe(en.sections[1].heading);
    expect(merged.sections[1].choices).toEqual([{ prompt: 'Only choice overlay' }]);
  });
});
