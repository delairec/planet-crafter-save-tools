export const GLOBAL_METADATA_SECTION_INDEX = 0;
export const TERRAFORMATION_LEVELS_SECTION_INDEX = 1;
export const PLAYERS_SECTION_INDEX = 2;
export const WORLD_OBJECTS_SECTION_INDEX = 3;
export const INVENTORIES_SECTION_INDEX = 4;
export const STATISTICS_SECTION_INDEX = 5;
export const MAILBOX_MESSAGES_SECTION_INDEX = 6;
export const STORY_EVENTS_SECTION_INDEX = 7;
export const SAVE_CONFIGURATION_SECTION_INDEX = 8;
export const WORLD_EVENTS_SECTION_INDEX = 9;

export const SAVE_SECTIONS_COUNT = 10; // real sections of the current format, indexes 0 to 9
export const RESERVED_TRAILING_SECTION_INDEX = SAVE_SECTIONS_COUNT; // empty part produced by the terminating '@'
export const SAVE_SPLIT_PARTS_COUNT = SAVE_SECTIONS_COUNT + 1; // real sections + trailing reserved part

// The Terrain Layers section a game update removed: legacy saves still carry it, which shifts
// World Events by one. Only the user-input boundary reads these three.
export const LEGACY_TERRAIN_LAYERS_SECTION_INDEX = 9;
export const LEGACY_WORLD_EVENTS_SECTION_INDEX = 10;
const LEGACY_SAVE_SECTIONS_COUNT = 11; // real sections when Terrain Layers still existed
export const LEGACY_SPLIT_PARTS_COUNT = LEGACY_SAVE_SECTIONS_COUNT + 1; // + trailing reserved part
