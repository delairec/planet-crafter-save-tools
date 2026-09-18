import {Player} from 'shared-save-processing/gameDefinitions';
import {InventoryEntry} from '../../save/InventoryEntry';

export interface EjectedPlayerInventoryIds {
  orphanInventoryIds: Set<number>;
  orphanWorldObjectIds: Set<number>;
}

/**
 * @see @RULE.PlayersAreDeduplicatedByName, @RULE.WorldObjectsAreDeduplicatedByPlanetAndPosition, @RULE.InventoriesAreKeptUnlessTheirOwnerIsEjected
 */
export function collectEjectedPlayerInventoryIds(playersA: Player[], playersB: Player[], inventoriesB: InventoryEntry[]): EjectedPlayerInventoryIds {
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
      for (const worldObjectId of inventory.woIds) {
        orphanWorldObjectIds.add(worldObjectId);
      }
    }
  }

  return {orphanInventoryIds, orphanWorldObjectIds};
}
