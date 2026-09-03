import type { Locale } from '@/i18n/routing';
import type { HomeGuideDoc } from './home-guide-i18n/types';
import en from './home-guide-i18n/en.json';
import ja from './home-guide-i18n/ja.json';
import ko from './home-guide-i18n/ko.json';
import zh from './home-guide-i18n/zh.json';
import zhTW from './home-guide-i18n/zh-TW.json';

export type {
  HomeGuideBullet,
  HomeGuideChoice,
  HomeGuideDoc,
  HomeGuideSection
} from './home-guide-i18n/types';

const homeGuideByLocale: Record<string, HomeGuideDoc> = {
  en: en as HomeGuideDoc,
  zh: zh as HomeGuideDoc,
  'zh-TW': zhTW as HomeGuideDoc,
  ja: ja as HomeGuideDoc,
  ko: ko as HomeGuideDoc
};

export function getHomeGuideDoc(locale: string): HomeGuideDoc {
  return homeGuideByLocale[locale as Locale] ?? (en as HomeGuideDoc);
}
