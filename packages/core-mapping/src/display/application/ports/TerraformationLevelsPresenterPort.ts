import type {UnreadableLinesResponse} from "../responses/UnreadableLinesResponse";
import {TerraformationLevelSummaryResponse} from '../responses/TerraformationLevelSummaryResponse';

export interface TerraformationLevelsPresenterPort {
  displayTerraformationLevels(levels: TerraformationLevelSummaryResponse[]): void;

  displaySaveWithUnreadableLines(response: UnreadableLinesResponse): void;
}
