/** Map public site locale to CMS feature / FAQ locale keys. */
export function cmsLocaleForSite(locale: string): string {
  if (locale === 'zh') return 'zh-CN';
  return locale;
}

export const CMS_FEATURE_LOCALES = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko'] as const;

export const CMS_FEATURE_LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  'zh-CN': '中文(简)',
  'zh-TW': '中文(繁)',
  ja: '日本語',
  ko: '한국어'
};
