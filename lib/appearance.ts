export const APPEARANCE_STORAGE_KEY = 'mahjong-hub-appearance';
export const OWNED_APPEARANCES_KEY = 'mh.owned-appearances.v1';
export const PENDING_CHECKIN_KEY = 'mh.pending-checkin.v1';

export type AppearanceTier = 'foundation' | 'seasonal' | 'premium' | 'limited';
export type UnlockRule = 'free' | 'seasonal_checkin' | 'points' | 'fragments';

export type AppearanceDef = {
  table: string;
  back: string;
  tier: AppearanceTier;
  unlock: UnlockRule;
  /** Points price when unlock === 'points'. */
  price?: number;
  /** Fragments required when unlock === 'fragments'. */
  fragmentsRequired?: number;
  fragmentId?: string;
  availableFrom: string | null;
  availableUntil: string | null;
  /** Amazon/Shopify deep link for matching physical set. */
  shopUrl?: string;
};

const JADE_TABLE = '/images/solitaire/backgrounds/solitaire-jade-table-v1.webp';
const JADE_BACK = '/images/tiles/backs/jade-moon-gate-tile-back-v1.webp';

/**
 * Wardrobe catalog — Foundation free · Seasonal check-in · Premium points · Limited fragments.
 * Premium tile backs ship as SVG placeholders until final art lands.
 */
export const APPEARANCES = {
  // ── Foundation (5 free) ───────────────────────────────────────────────
  jade: {
    table: JADE_TABLE,
    back: JADE_BACK,
    tier: 'foundation',
    unlock: 'free',
    availableFrom: null,
    availableUntil: null
  },
  'ivory-classic': {
    table: JADE_TABLE,
    back: '/images/tiles/backs/foundation/ivory-classic.svg',
    tier: 'foundation',
    unlock: 'free',
    availableFrom: null,
    availableUntil: null
  },
  'charcoal-night': {
    table: '/images/seasonal/tables/winter-solstice-table-v1.webp',
    back: '/images/tiles/backs/foundation/charcoal-night.svg',
    tier: 'foundation',
    unlock: 'free',
    availableFrom: null,
    availableUntil: null
  },
  'coral-dawn': {
    table: '/images/seasonal/tables/summer-solstice-table-v1.webp',
    back: '/images/tiles/backs/foundation/coral-dawn.svg',
    tier: 'foundation',
    unlock: 'free',
    availableFrom: null,
    availableUntil: null
  },
  'mist-lilac': {
    table: '/images/seasonal/tables/spring-equinox-table-v1.webp',
    back: '/images/tiles/backs/foundation/mist-lilac.svg',
    tier: 'foundation',
    unlock: 'free',
    availableFrom: null,
    availableUntil: null
  },

  // ── Seasonal (4 + festival) — free with check-in during window ────────
  summer: {
    table: '/images/seasonal/tables/summer-solstice-table-v1.webp',
    back: JADE_BACK,
    tier: 'seasonal',
    unlock: 'seasonal_checkin',
    availableFrom: '2026-06-01',
    availableUntil: '2026-08-31'
  },
  autumn: {
    table: '/images/seasonal/tables/autumn-equinox-table-v1.webp',
    back: JADE_BACK,
    tier: 'seasonal',
    unlock: 'seasonal_checkin',
    availableFrom: '2026-09-01',
    availableUntil: '2026-11-30'
  },
  winter: {
    table: '/images/seasonal/tables/winter-solstice-table-v1.webp',
    back: '/images/tiles/backs/winter-solstice-moon-back-v1.webp',
    tier: 'seasonal',
    unlock: 'seasonal_checkin',
    availableFrom: '2026-12-01',
    availableUntil: '2027-02-28'
  },
  spring: {
    table: '/images/seasonal/tables/spring-equinox-table-v1.webp',
    back: JADE_BACK,
    tier: 'seasonal',
    unlock: 'seasonal_checkin',
    availableFrom: '2027-03-01',
    availableUntil: '2027-05-31'
  },
  lunar: {
    table: '/images/solitaire/backgrounds/lunar-new-year-vermilion-table-v1.webp',
    back: '/images/tiles/backs/lunar-new-year-vermilion-back-v1.webp',
    tier: 'seasonal',
    unlock: 'seasonal_checkin',
    availableFrom: '2027-01-20',
    availableUntil: '2027-02-20'
  },

  // ── Premium Collection ────────────────────────────────────────────────
  'deep-sea-blue': {
    table: JADE_TABLE,
    back: '/images/tiles/backs/premium/deep-sea-blue.svg',
    tier: 'premium',
    unlock: 'points',
    price: 800,
    availableFrom: null,
    availableUntil: null,
    shopUrl:
      process.env.NEXT_PUBLIC_SHOP_DEEP_SEA ||
      'https://www.amazon.com/s?k=blue+mahjong+set'
  },
  'sakura-pink': {
    table: '/images/seasonal/tables/spring-equinox-table-v1.webp',
    back: '/images/tiles/backs/premium/sakura-pink.svg',
    tier: 'premium',
    unlock: 'points',
    price: 800,
    availableFrom: null,
    availableUntil: null,
    shopUrl:
      process.env.NEXT_PUBLIC_SHOP_SAKURA ||
      'https://www.amazon.com/s?k=pink+mahjong+set'
  },
  'bamboo-green': {
    table: JADE_TABLE,
    back: '/images/tiles/backs/premium/bamboo-green.svg',
    tier: 'premium',
    unlock: 'points',
    price: 800,
    availableFrom: null,
    availableUntil: null,
    shopUrl:
      process.env.NEXT_PUBLIC_SHOP_BAMBOO ||
      'https://www.amazon.com/s?k=green+bamboo+mahjong+set'
  },
  'gold-dynasty': {
    table: '/images/seasonal/tables/autumn-equinox-table-v1.webp',
    back: '/images/tiles/backs/premium/gold-dynasty.svg',
    tier: 'premium',
    unlock: 'points',
    price: 2500,
    availableFrom: null,
    availableUntil: null,
    shopUrl:
      process.env.NEXT_PUBLIC_SHOP_GOLD ||
      'https://www.amazon.com/s?k=gold+luxury+mahjong+set'
  },

  // ── Limited — 7 weekly check-in fragments ─────────────────────────────
  'ink-wash': {
    table: '/images/seasonal/tables/winter-solstice-table-v1.webp',
    back: '/images/tiles/backs/premium/ink-wash.svg',
    tier: 'limited',
    unlock: 'fragments',
    fragmentsRequired: 7,
    fragmentId: 'ink-wash',
    availableFrom: null,
    availableUntil: null,
    shopUrl:
      process.env.NEXT_PUBLIC_SHOP_INK ||
      'https://www.amazon.com/s?k=chinese+ink+mahjong+set'
  }
} as const satisfies Record<string, AppearanceDef>;

export type AppearanceId = keyof typeof APPEARANCES;
export type AppearanceChapter = AppearanceTier;

/** Widen catalog entries so optional price/shop/fragment fields are always readable. */
export function appearanceOf(id: AppearanceId): AppearanceDef {
  return APPEARANCES[id];
}

export const APPEARANCE_TIERS: AppearanceTier[] = [
  'foundation',
  'seasonal',
  'premium',
  'limited'
];

export function appearanceWindowState(id: AppearanceId, today = new Date().toISOString().slice(0, 10)) {
  const item = APPEARANCES[id];
  if (!item.availableFrom || !item.availableUntil) return 'permanent' as const;
  if (today < item.availableFrom) return 'upcoming' as const;
  if (today > item.availableUntil) return 'archive' as const;
  return 'active' as const;
}

export function isSeasonalCurrentlyOffered(id: AppearanceId) {
  const item = APPEARANCES[id];
  if (item.tier !== 'seasonal') return false;
  return appearanceWindowState(id) === 'active';
}

export function freeAppearanceIds(): AppearanceId[] {
  return (Object.keys(APPEARANCES) as AppearanceId[]).filter(
    (id) => APPEARANCES[id].unlock === 'free'
  );
}

export function applyAppearance(id: AppearanceId) {
  const choice = APPEARANCES[id];
  document.documentElement.style.setProperty('--mahjong-table-image', `url('${choice.table}')`);
  document.documentElement.style.setProperty('--mahjong-tile-back-image', `url('${choice.back}')`);
  localStorage.setItem(APPEARANCE_STORAGE_KEY, id);
  window.dispatchEvent(new CustomEvent('mahjong-appearance-change', { detail: id }));
}

export function savedAppearance(): AppearanceId {
  const stored = localStorage.getItem(APPEARANCE_STORAGE_KEY);
  return stored && stored in APPEARANCES ? (stored as AppearanceId) : 'jade';
}

export function readLocalOwnedAppearances(): AppearanceId[] {
  if (typeof window === 'undefined') return freeAppearanceIds();
  try {
    const raw = localStorage.getItem(OWNED_APPEARANCES_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    const owned = new Set<AppearanceId>(freeAppearanceIds());
    for (const id of parsed) {
      if (id in APPEARANCES) owned.add(id as AppearanceId);
    }
    return [...owned];
  } catch {
    return freeAppearanceIds();
  }
}

export function writeLocalOwnedAppearances(ids: AppearanceId[]) {
  const owned = new Set([...freeAppearanceIds(), ...ids]);
  localStorage.setItem(OWNED_APPEARANCES_KEY, JSON.stringify([...owned]));
}

export function markLocalOwned(id: AppearanceId) {
  const next = new Set(readLocalOwnedAppearances());
  next.add(id);
  writeLocalOwnedAppearances([...next]);
}

/** Guest tapped check-in — claim after email login succeeds. */
export function setPendingCheckIn(flag: boolean) {
  if (typeof window === 'undefined') return;
  if (flag) localStorage.setItem(PENDING_CHECKIN_KEY, '1');
  else localStorage.removeItem(PENDING_CHECKIN_KEY);
}

export function hasPendingCheckIn() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PENDING_CHECKIN_KEY) === '1';
}

/** ISO week key YYYY-Www for fragment drops. */
export function utcWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}
