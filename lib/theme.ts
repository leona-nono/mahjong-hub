/** L1 site theme. Independent of L2 table felt / tile backs. */

export const SITE_THEME_KEY = 'mahjong-hub.site-theme.v1';

export const SITE_THEMES = [
  'rainbow',
  'jade',
  'amber',
  'porcelain',
  'vermilion',
  'ink'
] as const;

export type SiteTheme = (typeof SITE_THEMES)[number];

export function isSiteTheme(value: string): value is SiteTheme {
  return (SITE_THEMES as readonly string[]).includes(value);
}

export function savedSiteTheme(): SiteTheme {
  if (typeof window === 'undefined') return 'rainbow';
  const raw = localStorage.getItem(SITE_THEME_KEY);
  return raw && isSiteTheme(raw) ? raw : 'rainbow';
}

export function applySiteTheme(theme: SiteTheme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(SITE_THEME_KEY, theme);
  } catch {
    /* private mode */
  }
}
