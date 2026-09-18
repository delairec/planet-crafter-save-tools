import {EntriesByOrigin} from './EntriesByOrigin';
import {InventoryEntry} from '../../save/InventoryEntry';

/**
 * @see @RULE.InventoriesAreKeptUnlessTheirOwnerIsEjected
 */
export function mergeInventories(inventoriesA: InventoryEntry[], inventoriesB: InventoryEntry[], orphanInventoryIds: Set<number>): EntriesByOrigin<InventoryEntry> {
  return {
    fromSaveA: inventoriesA,
    fromSaveB: inventoriesB.filter(inventory => !orphanInventoryIds.has(inventory.id))
  };
}
