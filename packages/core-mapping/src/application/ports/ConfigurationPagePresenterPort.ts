import {ConfigurationPageResponse} from "../responses/ConfigurationPageResponse";

export interface ConfigurationPagePresenterPort {
  displayConfigurationPage(configurationPage: ConfigurationPageResponse): void;
}
