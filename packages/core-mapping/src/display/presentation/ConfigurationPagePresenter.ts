import {formatUnreadableLine} from "../../save/presentation/mappers/formatUnreadableLine";
import {ConfigurationPagePresenterPort} from "../application/ports/ConfigurationPagePresenterPort";
import {
  AssessedSaveConfigurationResponse,
  ConfigurationPageResponse,
  DifficultyModifierEffectResponse,
  GlobalProgressionResponse,
  StatisticsResponse,
  UnlocksResponse
} from "../application/responses/ConfigurationPageResponse";
import {DroneLogisticsResponse} from "../application/responses/DroneLogisticsResponse";
import {createDroneLogisticsBadge} from "./mappers/createDroneLogisticsBadge";
import {formatNumber} from "./mappers/formatters/formatNumber/formatNumber";
import {NON_BREAKING_SPACE} from "./mappers/formatters/formatNumber/nonBreakingSpace";
import {
  ConfigurationPageViewModel,
  DroneLogisticsViewModel,
  ModifiersZoneViewModel,
  ProgressionZoneViewModel,
  TonedValueViewModel,
  ToneViewModel,
  UnlockFlagViewModel,
  UnlocksZoneViewModel
} from "./viewModels/ConfigurationPageViewModel";
import {
  configurationPageAllTimeTerraTokensLabel,
  configurationPageAutocrafterLabel,
  configurationPageDroneLogisticsLabel,
  configurationPageDronesLabel,
  configurationPageEverythingUnlockedLabel,
  configurationPageFreeCraftLabel,
  configurationPageGameDefaultToneLabel,
  configurationPageGaugeDrainLabel,
  configurationPageHelpingToneLabel,
  configurationPageMeteoOccurrenceLabel,
  configurationPageMultiplayerFactorLabel,
  configurationPageOreExtractorsLabel,
  configurationPagePenalisingToneLabel,
  configurationPagePowerConsumptionLabel,
  configurationPageRandomizedMineablesLabel,
  configurationPageSpaceTradingLabel,
  configurationPageTeleportersLabel,
  configurationPageTerraformationPaceLabel,
  configurationPageTerraTokenUnit,
  configurationPageTotalCraftedObjectsLabel,
  configurationPageUnlockOffLabel,
  configurationPageUnlockOnLabel
} from "./messages/configurationPageMessages.js";
import type {UnreadableLinesResponse} from "../application/responses/UnreadableLinesResponse";

const NO_CRAFTED_OBJECT_COUNTED = 0;

const PERCENT_PER_RATIO = 100;

const toneByModifierEffect: Record<DifficultyModifierEffectResponse, ToneViewModel> = {
  gameDefault: 'neutral',
  penalisesThePlayer: 'danger',
  helpsThePlayer: 'positive'
};

const toneLabelByTone: Record<ToneViewModel, string> = {
  neutral: configurationPageGameDefaultToneLabel,
  danger: configurationPagePenalisingToneLabel,
  positive: configurationPageHelpingToneLabel
};

export class ConfigurationPagePresenter implements ConfigurationPagePresenterPort {
  private _viewModel: ConfigurationPageViewModel = {progression: {fields: []}};

  get viewModel(): ConfigurationPageViewModel {
    return this._viewModel;
  }

  displayConfigurationPage(configurationPage: ConfigurationPageResponse): void {
    this._viewModel = {
      progression: createProgressionZone(configurationPage.globalProgression, configurationPage.statistics),
      ...createSaveConfigurationZones(configurationPage.assessedSaveConfiguration)
    };
  }

  displaySaveWithUnreadableLines({unreadableLines}: UnreadableLinesResponse): void {
    this._viewModel = {progression: {fields: []}, unreadableLines: unreadableLines.map(formatUnreadableLine)};
  }
}

function createTonedValue(value: string, tone: ToneViewModel): TonedValueViewModel {
  return {value, tone, toneLabel: toneLabelByTone[tone]};
}

function createProgressionZone(globalProgression: GlobalProgressionResponse, statistics: StatisticsResponse | undefined): ProgressionZoneViewModel {
  const fields = [
    {
      label: configurationPageAllTimeTerraTokensLabel,
      value: `${formatNumber(globalProgression.allTimeTerraTokens)} ${configurationPageTerraTokenUnit}`
    },
    {
      label: configurationPageTotalCraftedObjectsLabel,
      value: `${statistics?.totalCraftedObjects ?? NO_CRAFTED_OBJECT_COUNTED}`
    }
  ];
  if (!globalProgression.droneLogistics) {
    return {fields};
  }
  return {fields, droneLogistics: createDroneLogistics(globalProgression.droneLogistics)};
}

function createDroneLogistics(droneLogistics: DroneLogisticsResponse): DroneLogisticsViewModel {
  return {label: configurationPageDroneLogisticsLabel, badge: createDroneLogisticsBadge(droneLogistics)};
}

function createSaveConfigurationZones(assessedSaveConfiguration: AssessedSaveConfigurationResponse | undefined): Pick<ConfigurationPageViewModel, 'modifiers' | 'unlocks'> {
  if (!assessedSaveConfiguration) {
    return {};
  }
  return {
    modifiers: createModifiersZone(assessedSaveConfiguration),
    unlocks: createUnlocksZone(assessedSaveConfiguration.unlocks)
  };
}

function formatPercentageModifier(modifier: number): string {
  return `${formatNumber(modifier * PERCENT_PER_RATIO)}${NON_BREAKING_SPACE}%`;
}

function formatCoefficientModifier(modifier: number): string {
  return `×${NON_BREAKING_SPACE}${formatNumber(modifier)}`;
}

function createModifiersZone({modifiers, modifierEffects}: AssessedSaveConfigurationResponse): ModifiersZoneViewModel {
  return {
    modifiers: [
      {
        label: configurationPageTerraformationPaceLabel,
        badge: createTonedValue(formatPercentageModifier(modifiers.terraformationPace), toneByModifierEffect[modifierEffects.terraformationPace])
      },
      {
        label: configurationPageGaugeDrainLabel,
        badge: createTonedValue(formatCoefficientModifier(modifiers.gaugeDrain), toneByModifierEffect[modifierEffects.gaugeDrain])
      },
      {
        label: configurationPageMeteoOccurrenceLabel,
        badge: createTonedValue(formatPercentageModifier(modifiers.meteoOccurrence), toneByModifierEffect[modifierEffects.meteoOccurrence])
      },
      {
        label: configurationPageMultiplayerFactorLabel,
        badge: createTonedValue(formatCoefficientModifier(modifiers.multiplayerFactor), toneByModifierEffect[modifierEffects.multiplayerFactor])
      },
      {
        label: configurationPagePowerConsumptionLabel,
        badge: createTonedValue(formatPercentageModifier(modifiers.powerConsumption), toneByModifierEffect[modifierEffects.powerConsumption])
      }
    ]
  };
}

function createUnlockFlag(label: string, unlocked: boolean): UnlockFlagViewModel {
  if (unlocked) {
    return {label, state: 'on', stateLabel: configurationPageUnlockOnLabel};
  }
  return {label, state: 'off', stateLabel: configurationPageUnlockOffLabel};
}

function createUnlocksZone(unlocks: UnlocksResponse): UnlocksZoneViewModel {
  return {
    flags: [
      createUnlockFlag(configurationPageFreeCraftLabel, unlocks.freeCraft),
      createUnlockFlag(configurationPageEverythingUnlockedLabel, unlocks.everythingUnlocked),
      createUnlockFlag(configurationPageSpaceTradingLabel, unlocks.spaceTrading),
      createUnlockFlag(configurationPageOreExtractorsLabel, unlocks.oreExtractors),
      createUnlockFlag(configurationPageTeleportersLabel, unlocks.teleporters),
      createUnlockFlag(configurationPageDronesLabel, unlocks.drones),
      createUnlockFlag(configurationPageAutocrafterLabel, unlocks.autocrafter),
      createUnlockFlag(configurationPageRandomizedMineablesLabel, unlocks.randomizedMineables)
    ]
  };
}
