import type {SaveSectionName} from "shared-save-processing/gameDefinitions";

export type {SaveSectionName};

export const RESERVED_SAVE_PART = 'reserved';

export type LocatedSaveSectionName = SaveSectionName | typeof RESERVED_SAVE_PART;

export interface SaveSectionLocation {
  readonly name: LocatedSaveSectionName;
  readonly index: number;
}

export interface UnreadableLine {
  readonly section: SaveSectionLocation;
  readonly entryIndex: number;
  readonly line: string;
}
