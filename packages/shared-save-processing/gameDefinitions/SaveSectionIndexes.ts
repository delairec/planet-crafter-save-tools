export interface SaveSectionIndexes {
  globalMetadata: number;
  terraformationLevels: number;
  players: number;
  worldObjects: number;
  inventories: number;
  statistics: number;
  mailboxMessages: number;
  storyEvents: number;
  saveConfiguration: number;
  terrainLayers?: number;
  worldEvents: number;
}

export type SaveSectionName = keyof SaveSectionIndexes;
