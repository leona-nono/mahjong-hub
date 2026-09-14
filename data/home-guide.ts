import type { Locale } from '@/i18n/routing';
import type { HomeGuideDoc } from './home-guide-i18n/types';
import { mergeHomeGuideDoc } from './merge-doc';
import de from './home-guide-i18n/de.json';
import en from './home-guide-i18n/en.json';
import es from './home-guide-i18n/es.json';
import fr from './home-guide-i18n/fr.json';
import ja from './home-guide-i18n/ja.json';
import ko from './home-guide-i18n/ko.json';
import ptBR from './home-guide-i18n/pt-BR.json';
import zh from './home-guide-i18n/zh.json';
import zhTW from './home-guide-i18n/zh-TW.json';

export type {
  HomeGuideBullet,
  HomeGuideChoice,
  HomeGuideDoc,
  HomeGuideSection
} from './home-guide-i18n/types';
export { mergeHomeGuideDoc } from './merge-doc';

const homeGuideByLocale: Record<string, HomeGuideDoc> = {
  en: en as HomeGuideDoc,
  zh: zh as HomeGuideDoc,
  'zh-TW': zhTW as HomeGuideDoc,
  ja: ja as HomeGuideDoc,
  ko: ko as HomeGuideDoc,
  es: es as HomeGuideDoc,
  fr: fr as HomeGuideDoc,
  de: de as HomeGuideDoc,
  'pt-BR': ptBR as HomeGuideDoc
};

const enDoc = en as HomeGuideDoc;

/**
 * Locale home-guide copy with field-level English fallback (partial overlays are safe).
 * Missing locale → full English document.
 */
export function getHomeGuideDoc(locale: string): HomeGuideDoc {
  if (locale === 'en') return enDoc;
  const overlay = homeGuideByLocale[locale as Locale];
  if (!overlay) return enDoc;
  return mergeHomeGuideDoc(enDoc, overlay);
}
