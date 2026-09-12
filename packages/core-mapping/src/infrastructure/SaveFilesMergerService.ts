import {mergeSaveSections} from "../domain/rules/merge/mergeSaveSections";
import {MergedSaveSections} from "../domain/rules/merge/MergedSaveSections";
import {DecodedInventory} from "../domain/rules/merge/DecodedInventory";
import {DecodedSections} from "../domain/rules/merge/DecodedSections";
import {DecodedWorldObject} from "../domain/rules/merge/DecodedWorldObject";
import {resolveIdConflicts} from "../domain/rules/merge/resolveIdConflicts";
import {buildMergedFileName} from "./buildMergedFileName";
import {decodeIdList, encodeIdList} from "./idListCodec";
import {SaveFilesMergerPort} from "../application/ports/SaveFilesMergerPort";
import {createMergedSaveValueObject, MergedSaveValueObject} from "../domain/valueObjects/MergedSaveValueObject";
import {parseSaveSections} from "shared-save-processing/parseSaveSections.js";
import {serializeSave} from "shared-save-processing/serializeSave.js";
import {Inventory, ParsedSections, SaveParseError, WorldObject} from "shared-save-processing/gameDefinitions";
import {UnreadableSaveContentError} from "./errors/UnreadableSaveContentError";

export class SaveFilesMergerService implements SaveFilesMergerPort {
  merge(fileNameA: string, contentA: string, fileNameB: string, contentB: string, saveDisplayName?: string): MergedSaveValueObject {
    const fileName = buildMergedFileName(fileNameA, fileNameB);
    const resolvedSaveDisplayName = saveDisplayName ?? fileName.replace(/\.json$/, '');

    const parsedSaveA = parseSaveSections(contentA);
    const parsedSaveB = parseSaveSections(contentB);

    const mergedSections = mergeSaveSections(decodeSections(parsedSaveA.sections), decodeSections(parsedSaveB.sections), resolvedSaveDisplayName);
    const content = serialize(resolveIdConflicts(mergedSections));

    failOnUnreadableSave(fileNameA, parsedSaveA.errors);
    failOnUnreadableSave(fileNameB, parsedSaveB.errors);

    return createMergedSaveValueObject({fileName, content});
  }
}

function failOnUnreadableSave(fileName: string, errors: SaveParseError[]): void {
  if (errors.length > 0) {
    throw new UnreadableSaveContentError(fileName, errors);
  }
}

function decodeSections(sections: ParsedSections): DecodedSections {
  const [metadata, terraformationLevels, players, worldObjectsFactory, inventories, statistics, mailboxes, storyEvents, saveConfigurations, worldEvents, reserved] = sections;

  return [
    metadata,
    terraformationLevels,
    players,
    function* decodedWorldObjects(): Generator<DecodedWorldObject> {
      for (const worldObject of worldObjectsFactory()) {
        yield decodeWorldObject(worldObject);
      }
    },
    inventories.map(decodeInventory),
    statistics,
    mailboxes,
    storyEvents,
    saveConfigurations,
    worldEvents,
    reserved
  ];
}

function decodeInventory(inventory: Inventory): DecodedInventory {
  return {...inventory, woIds: decodeIdList(inventory.woIds)};
}

function decodeWorldObject(worldObject: WorldObject): DecodedWorldObject {
  return {
    ...worldObject,
    siIds: decodeOptionalIdList(worldObject.siIds),
    woIds: decodeOptionalIdList(worldObject.woIds)
  };
}

function encodeInventory(inventory: DecodedInventory): Inventory {
  return {...inventory, woIds: encodeIdList(inventory.woIds)};
}

function encodeWorldObject(worldObject: DecodedWorldObject): WorldObject {
  return {
    ...worldObject,
    siIds: encodeOptionalIdList(worldObject.siIds),
    woIds: encodeOptionalIdList(worldObject.woIds)
  };
}

/** A field absent from the save stays absent: `undefined` is dropped when the entry is serialized. */
function decodeOptionalIdList(idList: string | undefined): number[] | undefined {
  return idList === undefined ? undefined : decodeIdList(idList);
}

/** A field absent from the save stays absent: `undefined` is dropped when the entry is serialized. */
function encodeOptionalIdList(ids: readonly number[] | undefined): string | undefined {
  return ids === undefined ? undefined : encodeIdList(ids);
}

function serialize(mergedSections: MergedSaveSections): string {
  return serializeSave({
    metadata: [mergedSections.globalMetadata],
    terraformationLevels: [...mergedSections.terraformationLevels],
    players: [...mergedSections.players.fromSaveA, ...mergedSections.players.fromSaveB],
    worldObjects: [...mergedSections.worldObjects.fromSaveA, ...mergedSections.worldObjects.fromSaveB].map(encodeWorldObject),
    inventories: [...mergedSections.inventories.fromSaveA, ...mergedSections.inventories.fromSaveB].map(encodeInventory),
    statistics: mergedSections.statistics ? [mergedSections.statistics] : [],
    mailboxes: [...mergedSections.mailboxes],
    storyEvents: [...mergedSections.storyEvents],
    saveConfigurations: mergedSections.saveConfiguration ? [mergedSections.saveConfiguration] : [],
    worldEvents: [...mergedSections.worldEvents],
  });
}
