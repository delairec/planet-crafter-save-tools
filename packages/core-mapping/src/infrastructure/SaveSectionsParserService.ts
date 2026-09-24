import {parseSaveSections} from "shared-save-processing/parseSaveSections.js";
import {parseIdList} from "shared-save-processing/idList.js";
import {resolveSectionIndexes} from "shared-save-processing/sectionIndexes.js";
import {UnknownFormatReleaseError} from "shared-save-processing/gameReleases.js";
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
  TerrainLayer,
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
  terrainLayers: TerrainLayer[];
  worldEvents: WorldEvent[];
}

export class SaveSectionsParserService implements SaveSectionsParserPort {
  parse(content: string): ParsedSaveSections {
    const {formatRelease, sections, errors} = parseSaveSections(content);

    if (formatRelease === undefined) {
      throw new UnknownFormatReleaseError(formatRelease);
    }

    return {sections: toSaveSections(sections, formatRelease, resolveSectionIndexes(formatRelease)), errors};
  }
}

function toSaveSections(sections: ParsedSections, formatRelease: string, sectionIndexes: SaveSectionIndexes): SaveSections {
  function readSection<Name extends Exclude<keyof ParsedSectionContents, 'terrainLayers'>>(name: Name): ParsedSectionContents[Name] {
    return sections[sectionIndexes[name]] as ParsedSectionContents[Name];
  }

  function readTerrainLayers(): TerrainLayer[] | undefined {
    const {terrainLayers: terrainLayersIndex} = sectionIndexes;
    return terrainLayersIndex === undefined ? undefined : sections[terrainLayersIndex] as TerrainLayer[];
  }

  return {
    formatRelease,
    globalMetadata: readSection('globalMetadata'),
    terraformationLevels: readSection('terraformationLevels'),
    players: readSection('players'),
    worldObjects: [...readSection('worldObjects')()].map(toWorldObjectEntry),
    inventories: readSection('inventories').map(toInventoryEntry),
    statistics: readSection('statistics'),
    mailboxes: readSection('mailboxMessages'),
    storyEvents: readSection('storyEvents'),
    saveConfigurations: readSection('saveConfiguration'),
    terrainLayers: readTerrainLayers(),
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
