import {SaveParseError} from "shared-save-processing/gameDefinitions";
import {ConfigurationPageResponse} from "../responses/ConfigurationPageResponse";

export interface ConfigurationPagePresenterPort {
  displayConfigurationPage(configurationPage: ConfigurationPageResponse): void;

  displaySaveWithUnreadableLines(unreadableLines: SaveParseError[]): void;
}
