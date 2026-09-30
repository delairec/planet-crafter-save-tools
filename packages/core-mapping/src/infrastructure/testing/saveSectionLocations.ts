import {
  GLOBAL_METADATA_SECTION_INDEX,
  INVENTORIES_SECTION_INDEX,
  LEGACY_SPLIT_PARTS_COUNT,
  LEGACY_TERRAIN_LAYERS_SECTION_INDEX,
  LEGACY_WORLD_EVENTS_SECTION_INDEX,
  MAILBOX_MESSAGES_SECTION_INDEX,
  PLAYERS_SECTION_INDEX,
  RESERVED_TRAILING_SECTION_INDEX,
  WORLD_EVENTS_SECTION_INDEX,
  WORLD_OBJECTS_SECTION_INDEX
} from "shared-save-processing/sectionIndexes.js";
import {RESERVED_SAVE_PART, type SaveSectionLocation} from "../../domain/save/SaveSectionLocation";

export const GLOBAL_METADATA_SECTION: SaveSectionLocation = {name: 'globalMetadata', index: GLOBAL_METADATA_SECTION_INDEX};
export const PLAYERS_SECTION: SaveSectionLocation = {name: 'players', index: PLAYERS_SECTION_INDEX};
export const WORLD_OBJECTS_SECTION: SaveSectionLocation = {name: 'worldObjects', index: WORLD_OBJECTS_SECTION_INDEX};
export const INVENTORIES_SECTION: SaveSectionLocation = {name: 'inventories', index: INVENTORIES_SECTION_INDEX};
export const MAILBOX_MESSAGES_SECTION: SaveSectionLocation = {name: 'mailboxMessages', index: MAILBOX_MESSAGES_SECTION_INDEX};
export const WORLD_EVENTS_SECTION: SaveSectionLocation = {name: 'worldEvents', index: WORLD_EVENTS_SECTION_INDEX};
export const LEGACY_TERRAIN_LAYERS_SECTION: SaveSectionLocation = {name: 'terrainLayers', index: LEGACY_TERRAIN_LAYERS_SECTION_INDEX};
export const LEGACY_WORLD_EVENTS_SECTION: SaveSectionLocation = {name: 'worldEvents', index: LEGACY_WORLD_EVENTS_SECTION_INDEX};
export const RESERVED_TRAILING_PART: SaveSectionLocation = {name: RESERVED_SAVE_PART, index: RESERVED_TRAILING_SECTION_INDEX};
export const LEGACY_RESERVED_TRAILING_PART: SaveSectionLocation = {name: RESERVED_SAVE_PART, index: LEGACY_SPLIT_PARTS_COUNT - 1};
