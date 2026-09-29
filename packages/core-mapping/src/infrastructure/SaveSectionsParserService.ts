import {parseSaveSections} from "shared-save-processing/parseSaveSections.js";
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
import {SaveSections} from "../domain/save/SaveSections";
import {TerrainLayerEntry} from "../domain/save/TerrainLayerEntry";
import {
  decodeEntry,
  EntryCodec,
  GLOBAL_METADATA_CODEC,
  INVENTORY_CODEC,
  MAILBOX_MESSAGE_CODEC,
  PLAYER_CODEC,
  SAVE_CONFIGURATION_CODEC,
  STATISTICS_CODEC,
  STORY_EVENT_CODEC,
  TERRAFORMATION_LEVEL_CODEC,
  TERRAIN_LAYER_CODEC,
  WORLD_EVENT_CODEC,
  WORLD_OBJECT_CODEC
} from "./saveEntryCodecs";

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

  function readTerrainLayers(): TerrainLayerEntry[] | undefined {
    const {terrainLayers: terrainLayersIndex} = sectionIndexes;
    return terrainLayersIndex === undefined ? undefined : decodeEntries(sections[terrainLayersIndex] as TerrainLayer[], TERRAIN_LAYER_CODEC);
  }

  return {
    formatRelease,
    globalMetadata: decodeEntries(readSection('globalMetadata'), GLOBAL_METADATA_CODEC),
    terraformationLevels: decodeEntries(readSection('terraformationLevels'), TERRAFORMATION_LEVEL_CODEC),
    players: decodeEntries(readSection('players'), PLAYER_CODEC),
    worldObjects: decodeEntries(readSection('worldObjects')(), WORLD_OBJECT_CODEC),
    inventories: decodeEntries(readSection('inventories'), INVENTORY_CODEC),
    statistics: decodeEntries(readSection('statistics'), STATISTICS_CODEC),
    mailboxes: decodeEntries(readSection('mailboxMessages'), MAILBOX_MESSAGE_CODEC),
    storyEvents: decodeEntries(readSection('storyEvents'), STORY_EVENT_CODEC),
    saveConfigurations: decodeEntries(readSection('saveConfiguration'), SAVE_CONFIGURATION_CODEC),
    terrainLayers: readTerrainLayers(),
    worldEvents: decodeEntries(readSection('worldEvents'), WORLD_EVENT_CODEC)
  };
}

function decodeEntries<Record extends object, Entry>(records: Iterable<Record>, codec: EntryCodec<Record, Entry>): Entry[] {
  return Array.from(records, record => decodeEntry(record, codec));
}
