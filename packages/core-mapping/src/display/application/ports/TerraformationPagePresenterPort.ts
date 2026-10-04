import type {UnreadableLinesResponse} from "../responses/UnreadableLinesResponse";
import {TerraformationPageResponse} from "../responses/TerraformationPageResponse";

export interface TerraformationPagePresenterPort {
  displayTerraformationPage(terraformationPage: TerraformationPageResponse): void;

  displaySaveWithUnreadableLines(response: UnreadableLinesResponse): void;
}
