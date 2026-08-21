export const APPEARANCE_STORAGE_KEY = 'mahjong-hub-appearance';
export type AppearanceChapter = 'foundation' | 'solar' | 'festival';

export const APPEARANCES = {
  jade: {
    table: '/images/solitaire/backgrounds/solitaire-jade-table-v1.webp',
    back: '/images/tiles/backs/jade-moon-gate-tile-back-v1.webp',
    chapter: 'foundation' as AppearanceChapter,
    season: 'permanent', availableFrom: null, availableUntil: null
  },
  lunar: {
    table: '/images/solitaire/backgrounds/lunar-new-year-vermilion-table-v1.webp',
    back: '/images/tiles/backs/lunar-new-year-vermilion-back-v1.webp',
    chapter: 'festival' as AppearanceChapter,
    season: 'festival', availableFrom: '2027-01-20', availableUntil: '2027-02-20'
  },
  spring: {
    table: '/images/seasonal/tables/spring-equinox-table-v1.webp',
    back: '/images/tiles/backs/jade-moon-gate-tile-back-v1.webp',
    chapter: 'solar' as AppearanceChapter,
    season: 'spring', availableFrom: '2027-03-01', availableUntil: '2027-05-31'
  },
  summer: {
    table: '/images/seasonal/tables/summer-solstice-table-v1.webp',
    back: '/images/tiles/backs/jade-moon-gate-tile-back-v1.webp',
    chapter: 'solar' as AppearanceChapter,
    season: 'summer', availableFrom: '2026-06-01', availableUntil: '2026-08-31'
  },
  autumn: {
    table: '/images/seasonal/tables/autumn-equinox-table-v1.webp',
    back: '/images/tiles/backs/jade-moon-gate-tile-back-v1.webp',
    chapter: 'solar' as AppearanceChapter,
    season: 'autumn', availableFrom: '2026-09-01', availableUntil: '2026-11-30'
  },
  winter: {
    table: '/images/seasonal/tables/winter-solstice-table-v1.webp',
    back: '/images/tiles/backs/winter-solstice-moon-back-v1.webp',
    chapter: 'solar' as AppearanceChapter,
    season: 'winter', availableFrom: '2026-12-01', availableUntil: '2027-02-28'
  }
} as const;

export type AppearanceId = keyof typeof APPEARANCES;

export function applyAppearance(id: AppearanceId) {
  const choice = APPEARANCES[id];
  document.documentElement.style.setProperty('--mahjong-table-image', `url('${choice.table}')`);
  document.documentElement.style.setProperty('--mahjong-tile-back-image', `url('${choice.back}')`);
  localStorage.setItem(APPEARANCE_STORAGE_KEY, id);
  window.dispatchEvent(new CustomEvent('mahjong-appearance-change', { detail: id }));
}

export function savedAppearance(): AppearanceId {
  const stored = localStorage.getItem(APPEARANCE_STORAGE_KEY);
  return stored && stored in APPEARANCES ? stored as AppearanceId : 'jade';
}
