/**
 * Wire DTO mirroring section 1 of the save format. Field names are the game's, abbreviations
 * included; the domain translates them into business language at its boundary.
 */
export interface TerraformationLevel {
  planetId: string;
  unitOxygenLevel: number;
  unitHeatLevel: number;
  unitPressureLevel: number;
  unitPlantsLevel: number;
  unitInsectsLevel: number;
  unitAnimalsLevel: number;
  unitPurificationLevel: number;
}
