export type SaveSectionName =
  | 'globalMetadata'
  | 'terraformationLevels'
  | 'players'
  | 'worldObjects'
  | 'inventories'
  | 'statistics'
  | 'mailboxMessages'
  | 'storyEvents'
  | 'saveConfiguration'
  | 'terrainLayers'
  | 'worldEvents';

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

export interface SaveEntryField {
  readonly section: SaveSectionLocation;
  readonly entryIndex: number;
  readonly fieldPath: string;
}
