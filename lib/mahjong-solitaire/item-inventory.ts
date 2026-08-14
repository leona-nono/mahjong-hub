/**
 * Guest item inventory — append-only ledger in localStorage.
 * Logged-in users prefer /api/solitaire/item; this remains offline fallback.
 */

import {
  STARTER_PACK,
  emptyInventory,
  type ItemInventory,
  type ItemType,
  ITEM_TYPES
} from './items';

const STORAGE_KEY = 'mh.solitaire.itemLedger.v1';
const STARTER_FLAG = 'mh.solitaire.starterGranted.v1';
const PROGRESS_KEY = 'mh.solitaire.progress.v1';

export interface ItemLedgerEntry {
  itemType: ItemType;
  delta: number;
  reason: string;
  at: number;
}

export interface SolitaireProgress {
  lessonsCleared: number;
  seenDeadEnd: boolean;
}

function readLedger(): ItemLedgerEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ItemLedgerEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLedger(entries: ItemLedgerEntry[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-500)));
}

export function inventoryFromLedger(entries: ItemLedgerEntry[]): ItemInventory {
  const inv = emptyInventory();
  for (const e of entries) {
    if (!ITEM_TYPES.includes(e.itemType)) continue;
    inv[e.itemType] = Math.max(0, (inv[e.itemType] ?? 0) + e.delta);
  }
  return inv;
}

export function ensureStarterPack(): ItemInventory {
  if (typeof window === 'undefined') return starterSnapshot();
  const granted = localStorage.getItem(STARTER_FLAG) === '1';
  if (!granted) {
    const entries = readLedger();
    const at = Date.now();
    for (const type of ITEM_TYPES) {
      const n = STARTER_PACK[type];
      if (n > 0) {
        entries.push({ itemType: type, delta: n, reason: 'starter', at });
      }
    }
    writeLedger(entries);
    localStorage.setItem(STARTER_FLAG, '1');
  }
  return inventoryFromLedger(readLedger());
}

function starterSnapshot(): ItemInventory {
  return { ...STARTER_PACK };
}

export function getLocalInventory(): ItemInventory {
  return inventoryFromLedger(readLedger());
}

export function appendLocalItem(
  itemType: ItemType,
  delta: number,
  reason: string
): ItemInventory | null {
  const current = getLocalInventory();
  const nextBal = (current[itemType] ?? 0) + delta;
  if (nextBal < 0) return null;
  const entries = readLedger();
  entries.push({ itemType, delta, reason, at: Date.now() });
  writeLedger(entries);
  return inventoryFromLedger(entries);
}

export function readProgress(): SolitaireProgress {
  if (typeof window === 'undefined') {
    return { lessonsCleared: 0, seenDeadEnd: false };
  }
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { lessonsCleared: 0, seenDeadEnd: false };
    const p = JSON.parse(raw) as SolitaireProgress;
    return {
      lessonsCleared: Number(p.lessonsCleared) || 0,
      seenDeadEnd: !!p.seenDeadEnd
    };
  } catch {
    return { lessonsCleared: 0, seenDeadEnd: false };
  }
}

export function writeProgress(next: Partial<SolitaireProgress>) {
  if (typeof window === 'undefined') return;
  const cur = readProgress();
  const merged: SolitaireProgress = {
    lessonsCleared: Math.max(
      cur.lessonsCleared,
      next.lessonsCleared ?? cur.lessonsCleared
    ),
    seenDeadEnd: next.seenDeadEnd ?? cur.seenDeadEnd
  };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(merged));
}
