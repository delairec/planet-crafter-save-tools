import {InventoryEntry} from '../../../save/domain/save/InventoryEntry';
import {WorldObjectEntry} from '../../../save/domain/save/WorldObjectEntry';

export interface IdSequence {
  next(): number;
}

interface IdentifiedEntry {
  readonly id: number;
}

const FIRST_ID = 1;

export function createIdSequence(inventories: readonly InventoryEntry[], worldObjects: readonly WorldObjectEntry[]): IdSequence {
  let nextId = Math.max(findHighestId(inventories), findHighestId(worldObjects)) + 1;

  return {next: () => nextId++};
}

function findHighestId(entries: readonly IdentifiedEntry[]): number {
  let highestId = FIRST_ID - 1;
  for (const entry of entries) {
    if (entry.id > highestId) {
      highestId = entry.id;
    }
  }

  return highestId;
}
