import {TerraformationLevelSummaryResponse} from '../responses/TerraformationLevelSummaryResponse';

export interface TerraformationLevelsPresenterPort {
  displayTerraformationLevels(levels: TerraformationLevelSummaryResponse[]): void;
}
