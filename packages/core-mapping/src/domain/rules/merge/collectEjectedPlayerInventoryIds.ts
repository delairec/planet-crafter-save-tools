import {InventoryEntry} from '../../save/InventoryEntry';
import {PlayerEntry} from '../../save/PlayerEntry';

export interface EjectedPlayerInventoryIds {
  orphanInventoryIds: Set<number>;
  orphanWorldObjectIds: Set<number>;
}

export function collectEjectedPlayerInventoryIds(
  playersA: readonly PlayerEntry[],
  playersB: readonly PlayerEntry[],
  inventoriesB: readonly InventoryEntry[]
): EjectedPlayerInventoryIds {
  const ejectedPlayersFromB = playersB.filter(playerB =>
    playersA.some(playerA => playerA.name === playerB.name)
  );

  const orphanInventoryIds = new Set<number>();
  for (const player of ejectedPlayersFromB) {
    orphanInventoryIds.add(player.inventoryId);
    orphanInventoryIds.add(player.equipmentId);
  }

  const orphanWorldObjectIds = new Set<number>();
  for (const inventory of inventoriesB) {
    if (orphanInventoryIds.has(inventory.id)) {
      for (const worldObjectId of inventory.worldObjectIds) {
        orphanWorldObjectIds.add(worldObjectId);
      }
    }
  }

  return {orphanInventoryIds, orphanWorldObjectIds};
}
