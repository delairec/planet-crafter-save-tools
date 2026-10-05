import {PlayerEntry} from '../../../save/domain/save/PlayerEntry';
import {EntriesByOrigin} from './EntriesByOrigin';
import {InventoryEntry} from '../../../save/domain/save/InventoryEntry';
import {WorldObjectEntry} from '../../../save/domain/save/WorldObjectEntry';

export interface IdRemappings {
  readonly inventoryIds: ReadonlyMap<number, number>;
  readonly worldObjectIds: ReadonlyMap<number, number>;
}

export function rewritePlayerReferences(players: EntriesByOrigin<PlayerEntry>, remappings: IdRemappings): EntriesByOrigin<PlayerEntry> {
  return {
    fromSaveA: players.fromSaveA,
    fromSaveB: players.fromSaveB.map(player => ({
      ...player,
      inventoryId: remapId(player.inventoryId, remappings.inventoryIds),
      equipmentId: remapId(player.equipmentId, remappings.inventoryIds)
    }))
  };
}

export function rewriteWorldObjectReferences(worldObjects: EntriesByOrigin<WorldObjectEntry>, remappings: IdRemappings): EntriesByOrigin<WorldObjectEntry> {
  return {
    fromSaveA: worldObjects.fromSaveA,
    fromSaveB: worldObjects.fromSaveB.map(worldObject => ({
      ...worldObject,
      linkedInventoryId: remapOptionalId(worldObject.linkedInventoryId, remappings.inventoryIds),
      subInventoryIds: remapOptionalIdList(worldObject.subInventoryIds, remappings.inventoryIds),
      linkedWorldObjectId: remapOptionalId(worldObject.linkedWorldObjectId, remappings.worldObjectIds)
    }))
  };
}

export function rewriteInventoryReferences(inventories: EntriesByOrigin<InventoryEntry>, remappings: IdRemappings): EntriesByOrigin<InventoryEntry> {
  return {
    fromSaveA: inventories.fromSaveA,
    fromSaveB: inventories.fromSaveB.map(inventory => ({
      ...inventory,
      worldObjectIds: remapIdList(inventory.worldObjectIds, remappings.worldObjectIds)
    }))
  };
}

function remapId(id: number, remapping: ReadonlyMap<number, number>): number {
  return remapping.get(id) ?? id;
}

function remapOptionalId(id: number | undefined, remapping: ReadonlyMap<number, number>): number | undefined {
  return id === undefined ? undefined : remapId(id, remapping);
}

function remapOptionalIdList(idList: readonly number[] | undefined, remapping: ReadonlyMap<number, number>): readonly number[] | undefined {
  return idList === undefined ? undefined : remapIdList(idList, remapping);
}

function remapIdList(idList: readonly number[], remapping: ReadonlyMap<number, number>): readonly number[] {
  return idList.map(id => remapId(id, remapping));
}
