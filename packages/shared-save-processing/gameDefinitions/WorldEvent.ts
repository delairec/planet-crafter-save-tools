/**
 * Wire DTO mirroring section 9 of the save format. Field names are the game's, abbreviations
 * included; the domain translates them into business language at its boundary.
 */
export interface WorldEvent {
  planet: number;
  seed: number;
  pos: string;
  owner?: number;
  index?: number;
  rot?: string;
  wrecksWOGenerated?: boolean;
  woIdsGenerated?: string;
  woIdsDropped?: string;
  version?: number;
}
