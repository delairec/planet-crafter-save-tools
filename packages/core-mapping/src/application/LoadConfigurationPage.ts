import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {ConfigurationPagePresenterPort} from "./ports/ConfigurationPagePresenterPort";
import {AssessedSaveConfigurationResponse} from "./responses/ConfigurationPageResponse";
import {SaveConfigurationValueObject} from "../domain/valueObjects/SaveConfigurationValueObject";
import {assessDifficultyModifiers} from "../domain/rules/assessDifficultyModifiers";

export class LoadConfigurationPage {
  constructor(
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly presenter: ConfigurationPagePresenterPort
  ) {}

  async execute(): Promise<void> {
    this.presenter.displayConfigurationPage({
      globalProgression: this.saveSectionsReader.getGlobalProgression(),
      statistics: this.saveSectionsReader.getStatistics(),
      assessedSaveConfiguration: assessSaveConfiguration(this.saveSectionsReader.getSaveConfiguration())
    });
  }
}

function assessSaveConfiguration(saveConfiguration: SaveConfigurationValueObject | undefined): AssessedSaveConfigurationResponse | undefined {
  if (!saveConfiguration) {
    return undefined;
  }
  return {saveConfiguration, modifierEffects: assessDifficultyModifiers(saveConfiguration.modifiers)};
}
