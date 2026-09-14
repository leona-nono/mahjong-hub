import type { Locale } from '@/i18n/routing';
import type { AboutDoc } from './about-i18n/types';
import { mergeAboutDoc } from './merge-doc';
import de from './about-i18n/de.json';
import en from './about-i18n/en.json';
import es from './about-i18n/es.json';
import fr from './about-i18n/fr.json';
import ja from './about-i18n/ja.json';
import ko from './about-i18n/ko.json';
import ptBR from './about-i18n/pt-BR.json';
import zh from './about-i18n/zh.json';
import zhTW from './about-i18n/zh-TW.json';

export type { AboutBullet, AboutDoc, AboutSection } from './about-i18n/types';
export { mergeAboutDoc } from './merge-doc';

const aboutByLocale: Record<string, AboutDoc> = {
  en: en as AboutDoc,
  zh: zh as AboutDoc,
  'zh-TW': zhTW as AboutDoc,
  ja: ja as AboutDoc,
  ko: ko as AboutDoc,
  es: es as AboutDoc,
  fr: fr as AboutDoc,
  de: de as AboutDoc,
  'pt-BR': ptBR as AboutDoc
};

const enDoc = en as AboutDoc;

/**
 * Locale about copy with field-level English fallback (partial overlays are safe).
 * Missing locale → full English document.
 */
export function getAboutDoc(locale: string): AboutDoc {
  if (locale === 'en') return enDoc;
  const overlay = aboutByLocale[locale as Locale];
  if (!overlay) return enDoc;
  return mergeAboutDoc(enDoc, overlay);
}
