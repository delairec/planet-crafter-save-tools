import {SaveParseError} from "shared-save-processing/gameDefinitions";
import {TerraformationLevelSummaryResponse} from '../responses/TerraformationLevelSummaryResponse';

export interface TerraformationLevelsPresenterPort {
  displayTerraformationLevels(levels: TerraformationLevelSummaryResponse[]): void;

  displaySaveWithUnreadableLines(unreadableLines: SaveParseError[]): void;
}
