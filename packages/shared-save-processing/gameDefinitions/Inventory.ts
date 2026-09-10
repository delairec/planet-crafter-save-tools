/**
 * Wire DTO mirroring section 4 of the save format. Field names are the game's, abbreviations
 * included; the domain translates them into business language at its boundary.
 */
export interface Inventory {
  id: number;
  woIds: string;
  size: number;
  demandGrps?: string;
  supplyGrps?: string;
  priority?: number;
}
