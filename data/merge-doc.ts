/**
 * Field-level English fallback for about / home-guide locale overlays.
 * Partial locale JSON is safe: missing or empty fields fall back to `en`.
 */
import type { AboutDoc, AboutSection } from './about-i18n/types';
import type { HomeGuideDoc, HomeGuideSection } from './home-guide-i18n/types';

function pickString(localeVal: string | undefined, enVal: string): string {
  return localeVal && localeVal.trim() ? localeVal : enVal;
}

function mergeAboutSection(
  en: AboutSection,
  loc: AboutSection | undefined
): AboutSection {
  if (!loc) return en;
  return {
    heading: pickString(loc.heading, en.heading),
    paragraphs: loc.paragraphs ?? en.paragraphs,
    bullets: loc.bullets ?? en.bullets,
    afterBullets: loc.afterBullets ?? en.afterBullets
  };
}

/** Merge a locale about overlay onto English with field-level fallback. */
export function mergeAboutDoc(en: AboutDoc, locale: AboutDoc | undefined): AboutDoc {
  if (!locale) return en;
  const sectionCount = Math.max(en.sections.length, locale.sections?.length ?? 0);
  const sections: AboutSection[] = [];
  for (let i = 0; i < sectionCount; i++) {
    const enSec = en.sections[i];
    const locSec = locale.sections?.[i];
    if (enSec) {
      sections.push(mergeAboutSection(enSec, locSec));
    } else if (locSec) {
      sections.push(locSec);
    }
  }
  return {
    title: pickString(locale.title, en.title),
    intro: pickString(locale.intro, en.intro),
    metaDescription: pickString(locale.metaDescription, en.metaDescription),
    sections
  };
}

function mergeHomeGuideSection(
  en: HomeGuideSection,
  loc: HomeGuideSection | undefined
): HomeGuideSection {
  if (!loc) return en;
  return {
    heading: pickString(loc.heading, en.heading),
    bullets: loc.bullets ?? en.bullets,
    choices: loc.choices ?? en.choices
  };
}

/** Merge a locale home-guide overlay onto English with field-level fallback. */
export function mergeHomeGuideDoc(
  en: HomeGuideDoc,
  locale: HomeGuideDoc | undefined
): HomeGuideDoc {
  if (!locale) return en;
  const sectionCount = Math.max(en.sections.length, locale.sections?.length ?? 0);
  const sections: HomeGuideSection[] = [];
  for (let i = 0; i < sectionCount; i++) {
    const enSec = en.sections[i];
    const locSec = locale.sections?.[i];
    if (enSec) {
      sections.push(mergeHomeGuideSection(enSec, locSec));
    } else if (locSec) {
      sections.push(locSec);
    }
  }
  return {
    eyebrow: pickString(locale.eyebrow, en.eyebrow),
    title: pickString(locale.title, en.title),
    intro: pickString(locale.intro, en.intro),
    sections,
    closing: locale.closing ?? en.closing
  };
}
