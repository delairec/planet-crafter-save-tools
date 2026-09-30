import {
  GLOBAL_METADATA_SECTION_INDEX,
  INVENTORIES_SECTION_INDEX,
  PLAYERS_SECTION_INDEX,
  WORLD_OBJECTS_SECTION_INDEX
} from "shared-save-processing/sectionIndexes.js";
import {SaveSectionLocation} from "../domain/save/SaveSectionLocation";

export const GLOBAL_METADATA_SECTION: SaveSectionLocation = {name: 'globalMetadata', index: GLOBAL_METADATA_SECTION_INDEX};
export const PLAYERS_SECTION: SaveSectionLocation = {name: 'players', index: PLAYERS_SECTION_INDEX};
export const WORLD_OBJECTS_SECTION: SaveSectionLocation = {name: 'worldObjects', index: WORLD_OBJECTS_SECTION_INDEX};
export const INVENTORIES_SECTION: SaveSectionLocation = {name: 'inventories', index: INVENTORIES_SECTION_INDEX};
