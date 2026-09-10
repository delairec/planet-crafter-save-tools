/**
 * Wire DTO mirroring section 5 of the save format. Field names are the game's, abbreviations
 * included; the domain translates them into business language at its boundary.
 */
export interface Statistics {
  craftedObjects: number;
  totalSaveFileLoad: number;
  totalSaveFileTime: number;
}
