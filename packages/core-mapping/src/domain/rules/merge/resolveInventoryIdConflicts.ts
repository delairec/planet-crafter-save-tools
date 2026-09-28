import {EntriesByOrigin} from './EntriesByOrigin';
import {IdSequence} from './createIdSequence';
import {ResolvedEntries} from './ResolvedEntries';
import {InventoryEntry} from '../../save/InventoryEntry';

export function resolveInventoryIdConflicts(inventories: EntriesByOrigin<InventoryEntry>, idSequence: IdSequence): ResolvedEntries<InventoryEntry> {
  const usedIds = new Set(inventories.fromSaveA.map(inventory => inventory.id));
  const saveBIdRemapping = new Map<number, number>();

  const fromSaveB = inventories.fromSaveB.map(inventory => {
    if (!usedIds.has(inventory.id)) {
      usedIds.add(inventory.id);
      return inventory;
    }

    const newId = idSequence.next();
    saveBIdRemapping.set(inventory.id, newId);
    return {...inventory, id: newId};
  });

  return {entries: {fromSaveA: inventories.fromSaveA, fromSaveB}, saveBIdRemapping};
}
