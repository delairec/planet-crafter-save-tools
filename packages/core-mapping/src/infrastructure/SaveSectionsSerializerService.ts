import {serializeSave} from "shared-save-processing/serializeSave.js";
import {serializeIdList} from "shared-save-processing/idList.js";
import {Inventory, WorldObject} from "shared-save-processing/gameDefinitions";
import {SaveSectionsSerializerPort} from "../application/ports/SaveSectionsSerializerPort";
import {InventoryEntry} from "../domain/save/InventoryEntry";
import {SaveSections} from "../domain/save/SaveSections";
import {WorldObjectEntry} from "../domain/save/WorldObjectEntry";

export class SaveSectionsSerializerService implements SaveSectionsSerializerPort {
  serialize(sections: SaveSections): string {
    return serializeSave({
      metadata: sections.globalMetadata,
      terraformationLevels: sections.terraformationLevels,
      players: sections.players,
      worldObjects: sections.worldObjects.map(toWorldObject),
      inventories: sections.inventories.map(toInventory),
      statistics: sections.statistics,
      mailboxes: sections.mailboxes,
      storyEvents: sections.storyEvents,
      saveConfigurations: sections.saveConfigurations,
      worldEvents: sections.worldEvents,
    });
  }
}

function toInventory(inventory: InventoryEntry): Inventory {
  return {...inventory, woIds: serializeIdList(inventory.woIds)};
}

function toWorldObject(worldObject: WorldObjectEntry): WorldObject {
  return {
    ...worldObject,
    siIds: serializeOptionalIdList(worldObject.siIds),
    woIds: serializeOptionalIdList(worldObject.woIds)
  };
}

function serializeOptionalIdList(ids: readonly number[] | undefined): string | undefined {
  return ids === undefined ? undefined : serializeIdList(ids);
}
