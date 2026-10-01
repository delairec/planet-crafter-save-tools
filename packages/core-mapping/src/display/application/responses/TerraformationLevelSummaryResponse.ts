export interface TerraformationLevelSummaryResponse {
  readonly planetId: string;
  readonly unitOxygenLevel: number;
  readonly unitHeatLevel: number;
  readonly unitPressureLevel: number;
  readonly unitPlantsLevel: number;
  readonly unitInsectsLevel: number;
  readonly unitAnimalsLevel: number;
  readonly unitPurificationLevel: number;
  readonly terraformationIndex: number;
  readonly biomass: number;
}
