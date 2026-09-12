import {EntriesByOrigin} from './EntriesByOrigin';
import {DecodedInventory} from './DecodedInventory';

/**
 * @see GR-INV-1, GR-INV-2, GR-INV-3 in docs/game-rules.md
 */
export function mergeInventories(inventoriesA: DecodedInventory[], inventoriesB: DecodedInventory[], orphanInventoryIds: Set<number>): EntriesByOrigin<DecodedInventory> {
  return {
    fromSaveA: inventoriesA,
    fromSaveB: inventoriesB.filter(inventory => !orphanInventoryIds.has(inventory.id))
  };
}
