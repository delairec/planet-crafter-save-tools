import {EntriesByOrigin} from './EntriesByOrigin';
import {InventoryEntry} from '../../save/InventoryEntry';

export function mergeInventories(inventoriesA: readonly InventoryEntry[], inventoriesB: readonly InventoryEntry[], orphanInventoryIds: Set<number>): EntriesByOrigin<InventoryEntry> {
  return {
    fromSaveA: inventoriesA,
    fromSaveB: inventoriesB.filter(inventory => !orphanInventoryIds.has(inventory.id))
  };
}
