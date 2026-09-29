import {serializeSave} from "shared-save-processing/serializeSave.js";
import {SaveSectionsSerializerPort} from "../application/ports/SaveSectionsSerializerPort";
import {SaveSections} from "../domain/save/SaveSections";
import {
  EntryCodec,
  encodeEntry,
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

export class SaveSectionsSerializerService implements SaveSectionsSerializerPort {
  serialize(sections: SaveSections): string {
    return serializeSave({
      formatRelease: sections.formatRelease,
      terrainLayers: sections.terrainLayers === undefined ? undefined : encodeEntries(sections.terrainLayers, TERRAIN_LAYER_CODEC),
      metadata: encodeEntries(sections.globalMetadata, GLOBAL_METADATA_CODEC),
      terraformationLevels: encodeEntries(sections.terraformationLevels, TERRAFORMATION_LEVEL_CODEC),
      players: encodeEntries(sections.players, PLAYER_CODEC),
      worldObjects: encodeEntries(sections.worldObjects, WORLD_OBJECT_CODEC),
      inventories: encodeEntries(sections.inventories, INVENTORY_CODEC),
      statistics: encodeEntries(sections.statistics, STATISTICS_CODEC),
      mailboxes: encodeEntries(sections.mailboxes, MAILBOX_MESSAGE_CODEC),
      storyEvents: encodeEntries(sections.storyEvents, STORY_EVENT_CODEC),
      saveConfigurations: encodeEntries(sections.saveConfigurations, SAVE_CONFIGURATION_CODEC),
      worldEvents: encodeEntries(sections.worldEvents, WORLD_EVENT_CODEC),
    });
  }
}

function encodeEntries<Record, Entry extends object>(entries: readonly Entry[], codec: EntryCodec<Record, Entry>): Record[] {
  return entries.map(entry => encodeEntry(entry, codec));
}
