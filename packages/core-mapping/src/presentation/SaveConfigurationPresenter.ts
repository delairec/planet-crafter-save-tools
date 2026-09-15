import {SaveConfigurationPresenterPort} from "../application/ports/SaveConfigurationPresenterPort";
import {SaveConfigurationViewModel} from "./viewModels/SaveConfigurationViewModel";
import {SaveConfigurationValueObject} from "../domain/valueObjects/SaveConfigurationValueObject";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {FormatNumberStrategies} from "./formatters/formatNumber/FormatNumberStrategies";
import {
  saveConfigurationSectionGaugeDrainLabel,
  saveConfigurationSectionMeteoOccurrenceLabel,
  saveConfigurationSectionMultiplayerFactorLabel,
  saveConfigurationSectionPowerConsumptionLabel,
  saveConfigurationSectionTerraformationPaceLabel
} from "./messages/saveConfigurationSectionMessages.js";

function createEmptySaveConfigurationViewModel(): SaveConfigurationViewModel {
  return {
    mode: '',
    title: '',
    modifiers: {
      columns: [
        {
          header: saveConfigurationSectionTerraformationPaceLabel,
          values: []
        },
        {
          header: saveConfigurationSectionGaugeDrainLabel,
          values: []
        },
        {
          header: saveConfigurationSectionMeteoOccurrenceLabel,
          values: []
        },
        {
          header: saveConfigurationSectionMultiplayerFactorLabel,
          values: []
        },
        {
          header: saveConfigurationSectionPowerConsumptionLabel,
          values: []
        }
      ]
    }
  };
}

export class SaveConfigurationPresenter implements SaveConfigurationPresenterPort {
  private _viewModel: SaveConfigurationViewModel = createEmptySaveConfigurationViewModel();

  get viewModel(): SaveConfigurationViewModel {
    return this._viewModel;
  }

  displaySaveConfiguration(saveConfiguration: SaveConfigurationValueObject): void {
    this._viewModel = {
      mode: saveConfiguration.mode,
      title: saveConfiguration.title,
      modifiers: {
        columns: [
          {
            header: saveConfigurationSectionTerraformationPaceLabel,
            values: [formatNumber(saveConfiguration.modifiers.terraformationPace, FormatNumberStrategies.PERCENTAGE)]
          },
          {
            header: saveConfigurationSectionGaugeDrainLabel,
            values: [formatNumber(saveConfiguration.modifiers.gaugeDrain, FormatNumberStrategies.PERCENTAGE)]
          },
          {
            header: saveConfigurationSectionMeteoOccurrenceLabel,
            values: [formatNumber(saveConfiguration.modifiers.meteoOccurrence, FormatNumberStrategies.PERCENTAGE)]
          },
          {
            header: saveConfigurationSectionMultiplayerFactorLabel,
            values: [formatNumber(saveConfiguration.modifiers.multiplayerFactor, FormatNumberStrategies.PERCENTAGE)]
          },
          {
            header: saveConfigurationSectionPowerConsumptionLabel,
            values: [formatNumber(saveConfiguration.modifiers.powerConsumption, FormatNumberStrategies.PERCENTAGE)]
          }
        ]
      }
    };
  }

  displayMissingSaveConfigurationSection(): void {
    this._viewModel = createEmptySaveConfigurationViewModel();
  }
}
