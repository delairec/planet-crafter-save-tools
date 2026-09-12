import {EntriesByOrigin} from './EntriesByOrigin';
import {InventoryEntry} from './InventoryEntry';

/**
 * @see GR-INV-1, GR-INV-2, GR-INV-3 in docs/game-rules.md
 */
export function mergeInventories(inventoriesA: InventoryEntry[], inventoriesB: InventoryEntry[], orphanInventoryIds: Set<number>): EntriesByOrigin<InventoryEntry> {
  return {
    fromSaveA: inventoriesA,
    fromSaveB: inventoriesB.filter(inventory => !orphanInventoryIds.has(inventory.id))
  };
}
