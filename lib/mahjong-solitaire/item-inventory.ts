/**
 * Pure item-ledger helpers (engine-safe). Guest persistence: features/guest.
 */

import {
  emptyInventory,
  type ItemInventory,
  type ItemType,
  ITEM_TYPES
} from './items';

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

export function inventoryFromLedger(entries: ItemLedgerEntry[]): ItemInventory {
  const inv = emptyInventory();
  for (const e of entries) {
    if (!ITEM_TYPES.includes(e.itemType)) continue;
    inv[e.itemType] = Math.max(0, (inv[e.itemType] ?? 0) + e.delta);
  }
  return inv;
}
