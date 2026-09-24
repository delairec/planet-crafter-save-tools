import {parseSaveSections} from "shared-save-processing/parseSaveSections.js";
import {parseIdList} from "shared-save-processing/idList.js";
import {resolveSectionIndexes} from "shared-save-processing/sectionIndexes.js";
import {
  GlobalMetadata,
  Inventory,
  MailboxMessage,
  ParsedSections,
  Player,
  SaveConfiguration,
  SaveSectionIndexes,
  Statistics,
  StoryEvent,
  TerraformationLevel,
  WorldEvent,
  WorldObject
} from "shared-save-processing/gameDefinitions";
import {ParsedSaveSections, SaveSectionsParserPort} from "../application/ports/SaveSectionsParserPort";
import {InventoryEntry} from "../domain/save/InventoryEntry";
import {SaveSections} from "../domain/save/SaveSections";
import {WorldObjectEntry} from "../domain/save/WorldObjectEntry";

interface ParsedSectionContents {
  globalMetadata: GlobalMetadata[];
  terraformationLevels: TerraformationLevel[];
  players: Player[];
  worldObjects: () => Generator<WorldObject>;
  inventories: Inventory[];
  statistics: Statistics[];
  mailboxMessages: MailboxMessage[];
  storyEvents: StoryEvent[];
  saveConfiguration: SaveConfiguration[];
  worldEvents: WorldEvent[];
}

export class SaveSectionsParserService implements SaveSectionsParserPort {
  parse(content: string): ParsedSaveSections {
    const {formatRelease, sections, errors} = parseSaveSections(content);

    return {sections: toSaveSections(sections, resolveSectionIndexes(formatRelease)), errors};
  }
}

function toSaveSections(sections: ParsedSections, sectionIndexes: SaveSectionIndexes): SaveSections {
  function readSection<Name extends keyof ParsedSectionContents>(name: Name): ParsedSectionContents[Name] {
    return sections[sectionIndexes[name]] as ParsedSectionContents[Name];
  }

  return {
    globalMetadata: readSection('globalMetadata'),
    terraformationLevels: readSection('terraformationLevels'),
    players: readSection('players'),
    worldObjects: [...readSection('worldObjects')()].map(toWorldObjectEntry),
    inventories: readSection('inventories').map(toInventoryEntry),
    statistics: readSection('statistics'),
    mailboxes: readSection('mailboxMessages'),
    storyEvents: readSection('storyEvents'),
    saveConfigurations: readSection('saveConfiguration'),
    worldEvents: readSection('worldEvents')
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
