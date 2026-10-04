import {selectTerraformationStageRows} from "data-planets/selectTerraformationStageRows";
import {TerraformationStagesReaderPort} from "../application/ports/TerraformationStagesReaderPort";
import {TerraformationStageValueObject} from "../domain/valueObjects/TerraformationStageValueObject";

export class TerraformationStagesReaderService implements TerraformationStagesReaderPort {
  readTerraformationStages(): readonly TerraformationStageValueObject[] {
    return selectTerraformationStageRows().map((row) => ({
      planetNames: row.planetNames,
      startTerraformationIndex: row.startTerraformationIndex,
      stageName: row.stageName
    }));
  }
}
