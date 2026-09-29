import {PlayerEntry} from '../../save/PlayerEntry';
import {EntriesByOrigin} from './EntriesByOrigin';
import {InventoryEntry} from '../../save/InventoryEntry';
import {WorldObjectEntry} from '../../save/WorldObjectEntry';

export interface IdRemappings {
  readonly inventoryIds: ReadonlyMap<number, number>;
  readonly worldObjectIds: ReadonlyMap<number, number>;
}

/**
 * Points every save B back-reference at the identifiers save B entries were given.
 *
 * Save A entries are never rewritten: their identifiers are authoritative, so a reference they
 * carry still designates the same entry after the merge. That is what makes the rewriting
 * save-origin-aware without having to guess where an entry came from.
 *
 * @see @RULE.DuplicateIdentifiersAreRemappedOnTheSaveBSide
 */
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

/** @see @RULE.DuplicateIdentifiersAreRemappedOnTheSaveBSide */
export function rewriteWorldObjectReferences(worldObjects: EntriesByOrigin<WorldObjectEntry>, remappings: IdRemappings): EntriesByOrigin<WorldObjectEntry> {
  return {
    fromSaveA: worldObjects.fromSaveA,
    fromSaveB: worldObjects.fromSaveB.map(worldObject => ({
      ...worldObject,
      linkedInventoryId: remapOptionalId(worldObject.linkedInventoryId, remappings.inventoryIds),
      subInventoryIds: remapOptionalIdList(worldObject.subInventoryIds, remappings.inventoryIds),
      linkedWorldObjectId: remapOptionalId(worldObject.linkedWorldObjectId, remappings.worldObjectIds),
      heldWorldObjectIds: remapOptionalIdList(worldObject.heldWorldObjectIds, remappings.worldObjectIds)
    }))
  };
}

/**
 * Rewrites the contents of every save B inventory, so an inventory keeps holding the world objects
 * it held whatever identifiers they were given.
 *
 * A save A inventory only ever lists save A world objects, whose identifiers are authoritative and
 * never change, so it is left alone.
 *
 * @see @RULE.DuplicateIdentifiersAreRemappedOnTheSaveBSide
 */
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

/** A field absent from the save stays absent: `undefined` is dropped when the entry is serialized. */
function remapOptionalId(id: number | undefined, remapping: ReadonlyMap<number, number>): number | undefined {
  return id === undefined ? undefined : remapId(id, remapping);
}

/** A field absent from the save stays absent: `undefined` is dropped when the entry is serialized. */
function remapOptionalIdList(idList: readonly number[] | undefined, remapping: ReadonlyMap<number, number>): readonly number[] | undefined {
  return idList === undefined ? undefined : remapIdList(idList, remapping);
}

function remapIdList(idList: readonly number[], remapping: ReadonlyMap<number, number>): readonly number[] {
  return idList.map(id => remapId(id, remapping));
}
