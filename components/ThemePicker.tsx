'use client';

import { useEffect, useState } from 'react';
import { SITE_THEMES, applySiteTheme, savedSiteTheme, type SiteTheme } from '@/lib/theme';

const LABEL: Record<SiteTheme, string> = {
  rainbow: 'Rainbow',
  jade: 'Jade',
  amber: 'Amber',
  porcelain: 'Porcelain',
  vermilion: 'Vermilion',
  ink: 'Ink'
};

export default function ThemePicker() {
  const [theme, setTheme] = useState<SiteTheme>('rainbow');

  useEffect(() => {
    const saved = savedSiteTheme();
    setTheme(saved);
    applySiteTheme(saved);
  }, []);

  return (
    <label className="hidden items-center gap-1 text-xs text-portal-muted sm:flex">
      <span className="sr-only">Theme</span>
      <select
        value={theme}
        onChange={(event) => {
          const next = event.target.value as SiteTheme;
          setTheme(next);
          applySiteTheme(next);
        }}
        className="rounded-lg border border-portal-border bg-portal-panel px-2 py-1 text-xs text-portal-text"
      >
        {SITE_THEMES.map((id) => (
          <option key={id} value={id}>
            {LABEL[id]}
          </option>
        ))}
      </select>
    </label>
  );
}
