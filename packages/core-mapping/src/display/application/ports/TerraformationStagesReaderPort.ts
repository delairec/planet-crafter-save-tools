import {TerraformationStageValueObject} from "../../domain/valueObjects/TerraformationStageValueObject";

export interface TerraformationStagesReaderPort {
  readTerraformationStages(): readonly TerraformationStageValueObject[];
}
