export interface TerraformationStageRow {
  readonly terraformStage: string;
  readonly planetNames: readonly string[];
  readonly startTerraformationIndex: number;
  readonly stageName: string;
}
