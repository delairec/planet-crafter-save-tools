import {parseSaveSections} from "shared-save-processing/parseSaveSections.js";
import {resolveSectionIndexes} from "shared-save-processing/sectionIndexes.js";
import {UnknownFormatReleaseError} from "shared-save-processing/gameReleases.js";
import {stringifyEntry} from "shared-save-processing/stringifyEntry.js";
import {ParsedSections, SaveSectionIndexes, UnreadableSaveLine} from "shared-save-processing/gameDefinitions";
import {SaveSectionsParserPort} from "../application/ports/SaveSectionsParserPort";
import {ParsedSaveSectionsResponse} from "../application/responses/ParsedSaveSectionsResponse";
import {SaveSections} from "../domain/save/SaveSections";
import type {UnreadableLine} from "../domain/save/SaveSectionLocation";
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
import {locateSaveSection} from "./locateSaveSection";

type SectionRecords<Record> = Iterable<Record> | (() => Iterable<Record>);

interface SectionsReading {
  readonly sections: ParsedSections;
  readonly formatRelease: string;
  readonly sectionIndexes: SaveSectionIndexes;
  readonly unreadableLines: readonly UnreadableSaveLine[];
  readonly undecodableEntries: UnreadableLine[];
}

export class SaveSectionsParserService implements SaveSectionsParserPort {
  parse(content: string): ParsedSaveSectionsResponse {
    const {formatRelease, sections, errors} = parseSaveSections(content);

    if (formatRelease === undefined) {
      throw new UnknownFormatReleaseError(formatRelease);
    }

    const undecodableEntries: UnreadableLine[] = [];
    const saveSections = toSaveSections({sections, formatRelease, sectionIndexes: resolveSectionIndexes(formatRelease), unreadableLines: errors, undecodableEntries});

    return {
      sections: saveSections,
      errors: [...errors.map(error => locateUnreadableLine(error, formatRelease)), ...undecodableEntries]
    };
  }
}

function toSaveSections(reading: SectionsReading): SaveSections {
  function readSection<Record extends object, Entry>(codec: EntryCodec<Record, Entry>): Entry[] {
    return decodeSection(reading, codec);
  }

  return {
    formatRelease: reading.formatRelease,
    globalMetadata: readSection(GLOBAL_METADATA_CODEC),
    terraformationLevels: readSection(TERRAFORMATION_LEVEL_CODEC),
    players: readSection(PLAYER_CODEC),
    worldObjects: readSection(WORLD_OBJECT_CODEC),
    inventories: readSection(INVENTORY_CODEC),
    statistics: readSection(STATISTICS_CODEC),
    mailboxes: readSection(MAILBOX_MESSAGE_CODEC),
    storyEvents: readSection(STORY_EVENT_CODEC),
    saveConfigurations: readSection(SAVE_CONFIGURATION_CODEC),
    terrainLayers: reading.sectionIndexes.terrainLayers === undefined ? undefined : readSection(TERRAIN_LAYER_CODEC),
    worldEvents: readSection(WORLD_EVENT_CODEC)
  };
}

function decodeSection<Record extends object, Entry>({sections, sectionIndexes, formatRelease, unreadableLines, undecodableEntries}: SectionsReading, codec: EntryCodec<Record, Entry>): Entry[] {
  const sectionIndex = sectionIndexes[codec.section] as number;
  const records = sections[sectionIndex] as SectionRecords<Record>;
  const entries: Entry[] = [];
  let lineIndex = 0;

  for (const record of typeof records === 'function' ? records() : records) {
    lineIndex = skipUnreadableLines(unreadableLines, sectionIndex, lineIndex);
    const entry = decodeReadableEntry(record, codec);

    if (entry === undefined) {
      undecodableEntries.push({code: 'undecodable-entry', section: locateSaveSection(sectionIndex, formatRelease), entryIndex: lineIndex, line: stringifyEntry(record as {[field: string]: unknown})});
    } else {
      entries.push(entry);
    }

    lineIndex++;
  }

  return entries;
}

function skipUnreadableLines(unreadableLines: readonly UnreadableSaveLine[], sectionIndex: number, lineIndex: number): number {
  let readableLineIndex = lineIndex;

  while (unreadableLines.some(line => line.sectionIndex === sectionIndex && line.entryIndex === readableLineIndex)) {
    readableLineIndex++;
  }

  return readableLineIndex;
}

function decodeReadableEntry<Record extends object, Entry>(record: Record, codec: EntryCodec<Record, Entry>): Entry | undefined {
  try {
    return decodeEntry(record, codec);
  } catch {
    return undefined;
  }
}
