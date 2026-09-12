import {parseSaveSections} from "shared-save-processing/parseSaveSections.js";
import {parseIdList} from "shared-save-processing/idList.js";
import {Inventory, ParsedSections, WorldObject} from "shared-save-processing/gameDefinitions";
import {MergeSource, MergeSourceReaderPort} from "../application/ports/MergeSourceReaderPort";
import {InventoryEntry} from "../domain/rules/merge/InventoryEntry";
import {SaveSections} from "../domain/rules/merge/SaveSections";
import {WorldObjectEntry} from "../domain/rules/merge/WorldObjectEntry";

export class MergeSourceReaderService implements MergeSourceReaderPort {
  read(content: string): MergeSource {
    const {sections, errors} = parseSaveSections(content);

    return {sections: toSaveSections(sections), errors};
  }
}

function toSaveSections(sections: ParsedSections): SaveSections {
  const [globalMetadata, terraformationLevels, players, worldObjectsFactory, inventories, statistics, mailboxes, storyEvents, saveConfigurations, worldEvents] = sections;

  return {
    globalMetadata,
    terraformationLevels,
    players,
    worldObjects: [...worldObjectsFactory()].map(toWorldObjectEntry),
    inventories: inventories.map(toInventoryEntry),
    statistics,
    mailboxes,
    storyEvents,
    saveConfigurations,
    worldEvents
  };
}

function toInventoryEntry(inventory: Inventory): InventoryEntry {
  return {...inventory, woIds: parseIdList(inventory.woIds)};
}

function toWorldObjectEntry(worldObject: WorldObject): WorldObjectEntry {
  return {
    ...worldObject,
    siIds: parseOptionalIdList(worldObject.siIds),
    woIds: parseOptionalIdList(worldObject.woIds)
  };
}

function parseOptionalIdList(idList: string | undefined): number[] | undefined {
  return idList === undefined ? undefined : parseIdList(idList);
}
