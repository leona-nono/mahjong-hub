'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export type TileScale = 'normal' | 'large';
export type TableTheme = 'teal' | 'felt' | 'night';

export interface MahjongPreferences {
  soundEnabled: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  tileScale: TileScale;
  /** Highlight free (playable) tiles — TheMahjong-style assist. */
  highlightFreeTiles: boolean;
  /** Dual-encode suit+rank so tiles do not rely on color alone. */
  colorblindMarks: boolean;
  /** Board felt / backdrop theme. */
  tableTheme: TableTheme;
}

const KEY = 'mahjong-hub.table-preferences.v1';
const DEFAULTS: MahjongPreferences = {
  soundEnabled: true,
  highContrast: false,
  reducedMotion: false,
  tileScale: 'normal',
  highlightFreeTiles: true,
  colorblindMarks: false,
  tableTheme: 'teal'
};

function readPreferences(): MahjongPreferences {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<MahjongPreferences>;
    return { ...DEFAULTS, ...stored };
  } catch {
    return DEFAULTS;
  }
}

export function useMahjongPreferences() {
  const [preferences, setPreferences] = useState<MahjongPreferences>(readPreferences);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(preferences));
    } catch {
      /* private mode: keep the current session */
    }
  }, [preferences]);
  return {
    preferences,
    setPreference<K extends keyof MahjongPreferences>(key: K, value: MahjongPreferences[K]) {
      setPreferences((current) => ({ ...current, [key]: value }));
    }
  };
}

export default function MahjongAccessibilityPanel({
  preferences,
  onChange,
  onClose,
  /** When true, show solitaire-only assists (free-tile highlight, table theme). */
  solitaireExtras = false
}: {
  preferences: MahjongPreferences;
  onChange: <K extends keyof MahjongPreferences>(key: K, value: MahjongPreferences[K]) => void;
  onClose: () => void;
  solitaireExtras?: boolean;
}) {
  const t = useTranslations('a11y');
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('title')}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4"
    >
      <div className="w-full max-w-sm rounded-2xl border border-emerald-100/30 bg-[#f7f4e9] p-5 text-slate-900 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black">{solitaireExtras ? t('settingsTitle') : t('title')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-black text-white"
          >
            {t('done')}
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {solitaireExtras ? t('settingsBlurb') : t('blurb')}
        </p>
        <div className="mt-4 space-y-3 text-sm font-bold">
          {solitaireExtras && (
            <Setting
              label={t('highlightFree')}
              checked={preferences.highlightFreeTiles}
              onChange={(checked) => onChange('highlightFreeTiles', checked)}
            />
          )}
          {solitaireExtras && (
            <Setting
              label={t('colorblindMarks')}
              checked={preferences.colorblindMarks}
              onChange={(checked) => onChange('colorblindMarks', checked)}
            />
          )}
          <Setting
            label={t('highContrast')}
            checked={preferences.highContrast}
            onChange={(checked) => onChange('highContrast', checked)}
          />
          <Setting
            label={t('reducedMotion')}
            checked={preferences.reducedMotion}
            onChange={(checked) => onChange('reducedMotion', checked)}
          />
          <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-3">
            {t('tileSize')}
            <select
              aria-label={t('tileSize')}
              value={preferences.tileScale}
              onChange={(event) =>
                onChange('tileScale', event.target.value as TileScale)
              }
              className="rounded-md border border-slate-300 bg-white px-2 py-1"
            >
              <option value="normal">{t('tileNormal')}</option>
              <option value="large">{t('tileLarge')}</option>
            </select>
          </label>
          {solitaireExtras && (
            <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-3">
              {t('tableTheme')}
              <select
                aria-label={t('tableTheme')}
                value={preferences.tableTheme}
                onChange={(event) =>
                  onChange('tableTheme', event.target.value as TableTheme)
                }
                className="rounded-md border border-slate-300 bg-white px-2 py-1"
              >
                <option value="teal">{t('themeTeal')}</option>
                <option value="felt">{t('themeFelt')}</option>
                <option value="night">{t('themeNight')}</option>
              </select>
            </label>
          )}
          {solitaireExtras && (
            <p className="rounded-xl border border-slate-200 bg-white/60 px-3 py-2 text-xs font-medium text-slate-600">
              {t('hotkeysHint')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Setting({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-3">
      {label}
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-emerald-700"
      />
    </label>
  );
}
