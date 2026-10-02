import {UseCase} from "../../save/application/UseCase";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {LoadSaveSectionsRequest} from "./requests/LoadSaveSectionsRequest";
import {ConfigurationPagePresenterPort} from "./ports/ConfigurationPagePresenterPort";
import {
  AssessedSaveConfigurationResponse,
  DifficultyModifierEffectsResponse,
  DifficultyModifiersResponse,
  GlobalProgressionResponse,
  StatisticsResponse,
  UnlocksResponse
} from "./responses/ConfigurationPageResponse";
import {DroneLogisticsResponse} from "./responses/DroneLogisticsResponse";
import {SaveConfigurationValueObject} from "../domain/valueObjects/SaveConfigurationValueObject";
import {GlobalProgressionValueObject} from "../domain/valueObjects/GlobalProgressionValueObject";
import {StatisticsValueObject} from "../domain/valueObjects/StatisticsValueObject";
import {assessDifficultyModifiers, DifficultyModifierEffects, DifficultyModifiers} from "../domain/rules/assessDifficultyModifiers";
import {assessDroneLogistics} from "../domain/rules/assessDroneLogistics";

export class LoadConfigurationPage implements UseCase<LoadSaveSectionsRequest> {
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
      globalProgression: describeGlobalProgression(saveSections.getGlobalProgression()),
      statistics: describeStatistics(saveSections.getStatistics()),
      assessedSaveConfiguration: assessSaveConfiguration(saveSections.getSaveConfiguration())
    });
  }
}

function describeGlobalProgression(globalProgression: GlobalProgressionValueObject): GlobalProgressionResponse {
  return {allTimeTerraTokens: globalProgression.allTimeTerraTokens, droneLogistics: describeDroneLogistics(globalProgression.logisticsPaused)};
}

function describeDroneLogistics(logisticsPaused: boolean | undefined): DroneLogisticsResponse | undefined {
  if (logisticsPaused === undefined) {
    return undefined;
  }
  return {paused: logisticsPaused, effect: assessDroneLogistics(logisticsPaused)};
}

function describeStatistics(statistics: StatisticsValueObject | undefined): StatisticsResponse | undefined {
  if (!statistics) {
    return undefined;
  }
  return {totalCraftedObjects: statistics.totalCraftedObjects};
}

function assessSaveConfiguration(saveConfiguration: SaveConfigurationValueObject | undefined): AssessedSaveConfigurationResponse | undefined {
  if (!saveConfiguration) {
    return undefined;
  }
  return {
    modifiers: describeDifficultyModifiers(saveConfiguration.modifiers),
    modifierEffects: describeDifficultyModifierEffects(assessDifficultyModifiers(saveConfiguration.modifiers)),
    unlocks: describeUnlocks(saveConfiguration.unlocks)
  };
}

function describeDifficultyModifiers(modifiers: DifficultyModifiers): DifficultyModifiersResponse {
  return {
    terraformationPace: modifiers.terraformationPace,
    powerConsumption: modifiers.powerConsumption,
    gaugeDrain: modifiers.gaugeDrain,
    meteoOccurrence: modifiers.meteoOccurrence,
    multiplayerFactor: modifiers.multiplayerFactor
  };
}

function describeDifficultyModifierEffects(effects: DifficultyModifierEffects): DifficultyModifierEffectsResponse {
  return {
    terraformationPace: effects.terraformationPace,
    powerConsumption: effects.powerConsumption,
    gaugeDrain: effects.gaugeDrain,
    meteoOccurrence: effects.meteoOccurrence,
    multiplayerFactor: effects.multiplayerFactor
  };
}

function describeUnlocks(unlocks: SaveConfigurationValueObject['unlocks']): UnlocksResponse {
  return {
    freeCraft: unlocks.freeCraft,
    everythingUnlocked: unlocks.everythingUnlocked,
    spaceTrading: unlocks.spaceTrading,
    oreExtractors: unlocks.oreExtractors,
    teleporters: unlocks.teleporters,
    drones: unlocks.drones,
    autocrafter: unlocks.autocrafter,
    randomizedMineables: unlocks.randomizedMineables
  };
}
