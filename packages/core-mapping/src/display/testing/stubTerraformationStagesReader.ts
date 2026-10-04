import {TerraformationStagesReaderPort} from "../application/ports/TerraformationStagesReaderPort";
import {TerraformationStageValueObject} from "../domain/valueObjects/TerraformationStageValueObject";

const PRIME_TERRAFORMATION_STAGES: readonly TerraformationStageValueObject[] = [
  {planetNames: ['Prime'], startTerraformationIndex: 0, stageName: 'Barren'},
  {planetNames: ['Prime'], startTerraformationIndex: 175_000, stageName: 'Blue Sky'}
];

export function stubTerraformationStagesReader(): TerraformationStagesReaderPort {
  return {readTerraformationStages: () => PRIME_TERRAFORMATION_STAGES};
}
