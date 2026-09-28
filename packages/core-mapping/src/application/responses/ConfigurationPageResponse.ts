import {GlobalProgressionValueObject} from "../../domain/valueObjects/GlobalProgressionValueObject";
import {StatisticsValueObject} from "../../domain/valueObjects/StatisticsValueObject";
import {SaveConfigurationValueObject} from "../../domain/valueObjects/SaveConfigurationValueObject";
import {DifficultyModifierEffects} from "../../domain/rules/assessDifficultyModifiers";

export interface AssessedSaveConfigurationResponse {
  readonly saveConfiguration: SaveConfigurationValueObject;
  readonly modifierEffects: DifficultyModifierEffects;
}

export interface ConfigurationPageResponse {
  readonly globalProgression: GlobalProgressionValueObject;
  readonly statistics?: StatisticsValueObject;
  readonly assessedSaveConfiguration?: AssessedSaveConfigurationResponse;
}
