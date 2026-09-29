import {UnreadableLine} from "./SaveSectionLocation";
import {TerraformationLevelSummaryResponse} from '../responses/TerraformationLevelSummaryResponse';

export interface TerraformationLevelsPresenterPort {
  displayTerraformationLevels(levels: TerraformationLevelSummaryResponse[]): void;

  displaySaveWithUnreadableLines(unreadableLines: UnreadableLine[]): void;
}
