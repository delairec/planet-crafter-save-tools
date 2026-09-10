/**
 * Wire DTO mirroring section 0 of the save format. Field names are the game's, abbreviations
 * included; the domain translates them into business language at its boundary.
 */
export interface GlobalMetadata {
  terraTokens: number;
  allTimeTerraTokens: number;
  unlockedGroups: string;
  openedInstanceSeed: number;
  openedInstanceTimeLeft: number;
}
