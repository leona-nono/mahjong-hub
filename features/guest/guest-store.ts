/**
 * Versioned guest localStorage — single key for points / items / daily / progress.
 * Legacy keys are imported once on first read, then cleared.
 */

import {
  inventoryFromLedger,
  type ItemLedgerEntry,
  type SolitaireProgress
} from '@/lib/mahjong-solitaire/item-inventory';
import {
  emptyGuestDaily,
  nextGuestDailyClear,
  type GuestDaily
} from '@/lib/mahjong-solitaire/daily-local';
import {
  STARTER_PACK,
  type ItemInventory,
  type ItemType,
  ITEM_TYPES
} from '@/lib/mahjong-solitaire/items';
import { utcDateString } from '@/lib/points-rules';

export const GUEST_STORE_KEY = 'mh.guest-store.v1';

/** Legacy keys (pre-P4). Kept exported for migration + tests. */
export const LEGACY_GUEST_POINTS_KEY = 'mh.guest-points.v1';
export const LEGACY_ITEM_LEDGER_KEY = 'mh.solitaire.itemLedger.v1';
export const LEGACY_STARTER_FLAG_KEY = 'mh.solitaire.starterGranted.v1';
export const LEGACY_PROGRESS_KEY = 'mh.solitaire.progress.v1';
export const LEGACY_DAILY_KEY = 'mh.solitaire.daily.v1';

export type GuestPointsLedger = {
  total: number;
  entries: Array<{ amount: number; reason: string; at: number }>;
};

export type { GuestDaily, ItemLedgerEntry, SolitaireProgress };

export type GuestStoreV1 = {
  version: 1;
  points: GuestPointsLedger;
  items: {
    ledger: ItemLedgerEntry[];
    starterGranted: boolean;
  };
  daily: GuestDaily;
  progress: SolitaireProgress;
};

function emptyPoints(): GuestPointsLedger {
  return { total: 0, entries: [] };
}

function emptyProgress(): SolitaireProgress {
  return { lessonsCleared: 0, seenDeadEnd: false };
}

export function emptyGuestStore(): GuestStoreV1 {
  return {
    version: 1,
    points: emptyPoints(),
    items: { ledger: [], starterGranted: false },
    daily: emptyGuestDaily(),
    progress: emptyProgress()
  };
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function normalizePoints(raw: unknown): GuestPointsLedger {
  if (!raw || typeof raw !== 'object') return emptyPoints();
  const p = raw as GuestPointsLedger;
  const total = Math.max(0, Math.floor(Number(p.total) || 0));
  const entries = Array.isArray(p.entries) ? p.entries.slice(0, 50) : [];
  return { total, entries };
}

function normalizeLedger(raw: unknown): ItemLedgerEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (e): e is ItemLedgerEntry =>
        !!e &&
        typeof e === 'object' &&
        typeof (e as ItemLedgerEntry).itemType === 'string' &&
        typeof (e as ItemLedgerEntry).delta === 'number'
    )
    .slice(-500);
}

function normalizeDaily(raw: unknown): GuestDaily {
  if (!raw || typeof raw !== 'object') return emptyGuestDaily();
  const p = raw as GuestDaily;
  return {
    lastClearDate: typeof p.lastClearDate === 'string' ? p.lastClearDate : null,
    streak: Number(p.streak) || 0,
    freezeWeekKey: typeof p.freezeWeekKey === 'string' ? p.freezeWeekKey : null
  };
}

function normalizeProgress(raw: unknown): SolitaireProgress {
  if (!raw || typeof raw !== 'object') return emptyProgress();
  const p = raw as SolitaireProgress;
  return {
    lessonsCleared: Number(p.lessonsCleared) || 0,
    seenDeadEnd: !!p.seenDeadEnd
  };
}

function normalizeStore(raw: unknown): GuestStoreV1 | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Partial<GuestStoreV1>;
  if (s.version !== 1) return null;
  return {
    version: 1,
    points: normalizePoints(s.points),
    items: {
      ledger: normalizeLedger(s.items?.ledger),
      starterGranted: !!s.items?.starterGranted
    },
    daily: normalizeDaily(s.daily),
    progress: normalizeProgress(s.progress)
  };
}

function readLegacyInto(store: GuestStoreV1): boolean {
  if (!canUseStorage()) return false;
  let imported = false;

  try {
    const pointsRaw = localStorage.getItem(LEGACY_GUEST_POINTS_KEY);
    if (pointsRaw) {
      store.points = normalizePoints(JSON.parse(pointsRaw));
      imported = true;
    }
  } catch {
    /* ignore */
  }

  try {
    const ledgerRaw = localStorage.getItem(LEGACY_ITEM_LEDGER_KEY);
    if (ledgerRaw) {
      store.items.ledger = normalizeLedger(JSON.parse(ledgerRaw));
      imported = true;
    }
  } catch {
    /* ignore */
  }

  try {
    if (localStorage.getItem(LEGACY_STARTER_FLAG_KEY) === '1') {
      store.items.starterGranted = true;
      imported = true;
    }
  } catch {
    /* ignore */
  }

  try {
    const progressRaw = localStorage.getItem(LEGACY_PROGRESS_KEY);
    if (progressRaw) {
      store.progress = normalizeProgress(JSON.parse(progressRaw));
      imported = true;
    }
  } catch {
    /* ignore */
  }

  try {
    const dailyRaw = localStorage.getItem(LEGACY_DAILY_KEY);
    if (dailyRaw) {
      store.daily = normalizeDaily(JSON.parse(dailyRaw));
      imported = true;
    }
  } catch {
    /* ignore */
  }

  return imported;
}

function clearLegacyKeys() {
  if (!canUseStorage()) return;
  localStorage.removeItem(LEGACY_GUEST_POINTS_KEY);
  localStorage.removeItem(LEGACY_ITEM_LEDGER_KEY);
  localStorage.removeItem(LEGACY_STARTER_FLAG_KEY);
  localStorage.removeItem(LEGACY_PROGRESS_KEY);
  localStorage.removeItem(LEGACY_DAILY_KEY);
}

function writeStore(store: GuestStoreV1) {
  if (!canUseStorage()) return;
  localStorage.setItem(GUEST_STORE_KEY, JSON.stringify(store));
}

/** Read store; migrate legacy keys once if the new key is empty. */
export function readGuestStore(): GuestStoreV1 {
  if (!canUseStorage()) return emptyGuestStore();

  try {
    const raw = localStorage.getItem(GUEST_STORE_KEY);
    if (raw) {
      const parsed = normalizeStore(JSON.parse(raw));
      if (parsed) return parsed;
    }
  } catch {
    /* fall through to migrate / empty */
  }

  const store = emptyGuestStore();
  if (readLegacyInto(store)) {
    writeStore(store);
    clearLegacyKeys();
  }
  return store;
}

export function writeGuestStore(store: GuestStoreV1) {
  writeStore({
    version: 1,
    points: normalizePoints(store.points),
    items: {
      ledger: normalizeLedger(store.items.ledger),
      starterGranted: !!store.items.starterGranted
    },
    daily: normalizeDaily(store.daily),
    progress: normalizeProgress(store.progress)
  });
}

export function updateGuestStore(patch: (prev: GuestStoreV1) => GuestStoreV1): GuestStoreV1 {
  const next = patch(readGuestStore());
  writeGuestStore(next);
  return next;
}

// --- points slice ---

export function getGuestPoints(): GuestPointsLedger {
  return readGuestStore().points;
}

export function setGuestPoints(points: GuestPointsLedger): void {
  updateGuestStore((s) => ({ ...s, points: normalizePoints(points) }));
  if (canUseStorage()) {
    window.dispatchEvent(new CustomEvent('mh-guest-points', { detail: points.total }));
  }
}

export function clearGuestPointsSlice(): void {
  setGuestPoints(emptyPoints());
  if (canUseStorage()) {
    localStorage.removeItem(LEGACY_GUEST_POINTS_KEY);
  }
}

// --- items slice ---

export { inventoryFromLedger };

export function getItemsSlice(): GuestStoreV1['items'] {
  return readGuestStore().items;
}

export function setItemsSlice(items: GuestStoreV1['items']): void {
  updateGuestStore((s) => ({
    ...s,
    items: {
      ledger: normalizeLedger(items.ledger),
      starterGranted: !!items.starterGranted
    }
  }));
}

export function ensureStarterPack(): ItemInventory {
  if (!canUseStorage()) return { ...STARTER_PACK };
  const store = readGuestStore();
  if (!store.items.starterGranted) {
    const entries = [...store.items.ledger];
    const at = Date.now();
    for (const type of ITEM_TYPES) {
      const n = STARTER_PACK[type];
      if (n > 0) {
        entries.push({ itemType: type, delta: n, reason: 'starter', at });
      }
    }
    setItemsSlice({ ledger: entries, starterGranted: true });
    return inventoryFromLedger(entries);
  }
  return inventoryFromLedger(store.items.ledger);
}

export function getLocalInventory(): ItemInventory {
  return inventoryFromLedger(getItemsSlice().ledger);
}

export function appendLocalItem(
  itemType: ItemType,
  delta: number,
  reason: string
): ItemInventory | null {
  const current = getLocalInventory();
  const nextBal = (current[itemType] ?? 0) + delta;
  if (nextBal < 0) return null;
  const store = readGuestStore();
  const entries = [
    ...store.items.ledger,
    { itemType, delta, reason, at: Date.now() }
  ];
  setItemsSlice({ ledger: entries, starterGranted: store.items.starterGranted });
  return inventoryFromLedger(entries);
}

// --- progress slice ---

export function getProgressSlice(): SolitaireProgress {
  return readGuestStore().progress;
}

export function setProgressSlice(next: Partial<SolitaireProgress>): void {
  updateGuestStore((s) => {
    const cur = s.progress;
    return {
      ...s,
      progress: {
        lessonsCleared: Math.max(
          cur.lessonsCleared,
          next.lessonsCleared ?? cur.lessonsCleared
        ),
        seenDeadEnd: next.seenDeadEnd ?? cur.seenDeadEnd
      }
    };
  });
}

// --- daily slice ---

export function getDailySlice(): GuestDaily {
  return readGuestStore().daily;
}

export function setDailySlice(daily: GuestDaily): void {
  updateGuestStore((s) => ({ ...s, daily: normalizeDaily(daily) }));
}

export function readGuestDaily(): GuestDaily {
  return getDailySlice();
}

export function recordGuestDailyClear(today = utcDateString()): GuestDaily {
  const cur = getDailySlice();
  const next = nextGuestDailyClear(cur, today);
  if (!next) return cur;
  setDailySlice(next);
  return next;
}

export function readProgress(): SolitaireProgress {
  return getProgressSlice();
}

export function writeProgress(next: Partial<SolitaireProgress>) {
  setProgressSlice(next);
}
