import {serializeSave} from "shared-save-processing/serializeSave.js";
import {serializeIdList} from "shared-save-processing/idList.js";
import {Inventory, WorldObject} from "shared-save-processing/gameDefinitions";
import {
  MergedFileName,
  MergedSaveFile,
  MergedSaveSerializerPort,
  MergedSaveToSerialize,
  SourceFileNames
} from "../application/ports/MergedSaveSerializerPort";
import {InventoryEntry} from "../domain/rules/merge/InventoryEntry";
import {WorldObjectEntry} from "../domain/rules/merge/WorldObjectEntry";
import {buildMergedFileName, buildMergedFileStem} from "./buildMergedFileName";

export class MergedSaveSerializerService implements MergedSaveSerializerPort {
  buildFileName({fileNameA, fileNameB}: SourceFileNames): MergedFileName {
    return {fileName: buildMergedFileName(fileNameA, fileNameB), stem: buildMergedFileStem(fileNameA, fileNameB)};
  }

  serialize({fileName, sections}: MergedSaveToSerialize): MergedSaveFile {
    const content = serializeSave({
      metadata: [sections.globalMetadata],
      terraformationLevels: [...sections.terraformationLevels],
      players: [...sections.players.fromSaveA, ...sections.players.fromSaveB],
      worldObjects: [...sections.worldObjects.fromSaveA, ...sections.worldObjects.fromSaveB].map(toWorldObject),
      inventories: [...sections.inventories.fromSaveA, ...sections.inventories.fromSaveB].map(toInventory),
      statistics: sections.statistics ? [sections.statistics] : [],
      mailboxes: [...sections.mailboxes],
      storyEvents: [...sections.storyEvents],
      saveConfigurations: sections.saveConfiguration ? [sections.saveConfiguration] : [],
      worldEvents: [...sections.worldEvents],
    });

    return {fileName, content};
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
