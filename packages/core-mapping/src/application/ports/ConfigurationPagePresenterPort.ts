import type {UnreadableLinesResponse} from "../responses/UnreadableLinesResponse";
import {ConfigurationPageResponse} from "../responses/ConfigurationPageResponse";

export interface ConfigurationPagePresenterPort {
  displayConfigurationPage(configurationPage: ConfigurationPageResponse): void;

  displaySaveWithUnreadableLines(response: UnreadableLinesResponse): void;
}
