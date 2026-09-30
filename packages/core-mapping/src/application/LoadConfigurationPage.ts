import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {LoadSaveSectionsRequest} from "./requests/LoadSaveSectionsRequest";
import {ConfigurationPagePresenterPort} from "./ports/ConfigurationPagePresenterPort";
import {AssessedSaveConfigurationResponse} from "./responses/ConfigurationPageResponse";
import {SaveConfigurationValueObject} from "../domain/valueObjects/SaveConfigurationValueObject";
import {assessDifficultyModifiers} from "../domain/rules/assessDifficultyModifiers";

export class LoadConfigurationPage {
  constructor(
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly presenter: ConfigurationPagePresenterPort
  ) {}

  async execute({content}: LoadSaveSectionsRequest): Promise<void> {
    const {saveSections, unreadableLines} = this.saveSectionsReader.read(content);

    if (unreadableLines.length > 0) {
      this.presenter.displaySaveWithUnreadableLines({unreadableLines});
      return;
    }

    this.presenter.displayConfigurationPage({
      globalProgression: saveSections.getGlobalProgression(),
      statistics: saveSections.getStatistics(),
      assessedSaveConfiguration: assessSaveConfiguration(saveSections.getSaveConfiguration())
    });
  }
}

function assessSaveConfiguration(saveConfiguration: SaveConfigurationValueObject | undefined): AssessedSaveConfigurationResponse | undefined {
  if (!saveConfiguration) {
    return undefined;
  }
  return {saveConfiguration, modifierEffects: assessDifficultyModifiers(saveConfiguration.modifiers)};
}
