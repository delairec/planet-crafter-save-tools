import {parseSaveSections} from "shared-save-processing/parseSaveSections.js";
import {resolveSectionIndexes} from "shared-save-processing/sectionIndexes.js";
import {UnknownFormatReleaseError} from "shared-save-processing/gameReleases.js";
import {ParsedSections, SaveSectionIndexes} from "shared-save-processing/gameDefinitions";
import {SaveSectionsParserPort} from "../application/ports/SaveSectionsParserPort";
import {ParsedSaveSections} from "../application/responses/ParsedSaveSections";
import {SaveSections} from "../domain/save/SaveSections";
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
import {locateUnreadableLine} from "./locateUnreadableLine";

type SectionRecords<Record> = Iterable<Record> | (() => Iterable<Record>);

export class SaveSectionsParserService implements SaveSectionsParserPort {
  parse(content: string): ParsedSaveSections {
    const {formatRelease, sections, errors} = parseSaveSections(content);

    if (formatRelease === undefined) {
      throw new UnknownFormatReleaseError(formatRelease);
    }

    return {
      sections: toSaveSections(sections, formatRelease, resolveSectionIndexes(formatRelease)),
      errors: errors.map(error => locateUnreadableLine(error, formatRelease))
    };
  }
}

function toSaveSections(sections: ParsedSections, formatRelease: string, sectionIndexes: SaveSectionIndexes): SaveSections {
  function readSection<Record extends object, Entry>(codec: EntryCodec<Record, Entry>): Entry[] {
    const records = sections[sectionIndexes[codec.section] as number] as SectionRecords<Record>;
    return Array.from(typeof records === 'function' ? records() : records, record => decodeEntry(record, codec));
  }

  return {
    formatRelease,
    globalMetadata: readSection(GLOBAL_METADATA_CODEC),
    terraformationLevels: readSection(TERRAFORMATION_LEVEL_CODEC),
    players: readSection(PLAYER_CODEC),
    worldObjects: readSection(WORLD_OBJECT_CODEC),
    inventories: readSection(INVENTORY_CODEC),
    statistics: readSection(STATISTICS_CODEC),
    mailboxes: readSection(MAILBOX_MESSAGE_CODEC),
    storyEvents: readSection(STORY_EVENT_CODEC),
    saveConfigurations: readSection(SAVE_CONFIGURATION_CODEC),
    terrainLayers: sectionIndexes.terrainLayers === undefined ? undefined : readSection(TERRAIN_LAYER_CODEC),
    worldEvents: readSection(WORLD_EVENT_CODEC)
  };
}
