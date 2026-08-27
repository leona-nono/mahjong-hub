/** Public-site locales used for native game SEO CMS. */
export const NATIVE_SEO_LOCALES = ['en', 'zh', 'zh-TW', 'ja', 'ko'] as const;
export type NativeSeoLocale = (typeof NATIVE_SEO_LOCALES)[number];

export const NATIVE_SEO_LOCALE_LABELS: Record<NativeSeoLocale, string> = {
  en: 'English',
  zh: '中文(简)',
  'zh-TW': '中文(繁)',
  ja: '日本語',
  ko: '한국어'
};

export function isNativeSeoLocale(value: string): value is NativeSeoLocale {
  return (NATIVE_SEO_LOCALES as readonly string[]).includes(value);
}

export function resolveAdminContentLocale(
  raw: string | string[] | undefined,
  fallback: string = 'en'
): NativeSeoLocale {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value && isNativeSeoLocale(value)) return value;
  if (value === 'zh-CN') return 'zh';
  if (fallback === 'zh-CN') return 'zh';
  if (isNativeSeoLocale(fallback)) return fallback;
  return 'en';
}
