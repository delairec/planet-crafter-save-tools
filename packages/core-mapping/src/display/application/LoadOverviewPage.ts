import {UseCase} from "../../save/application/UseCase";
import {GameReleasesReaderPort} from "../../save/application/ports/GameReleasesReaderPort";
import {GameReleaseValueObject} from "../../save/domain/valueObjects/GameReleaseValueObject";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {SaveSectionsMapperPort} from "./ports/SaveSectionsMapperPort";
import {OverviewPagePresenterPort} from "./ports/OverviewPagePresenterPort";
import {EnergyLevelsReaderPort} from "./ports/EnergyLevelsReaderPort";
import {OptimizerRangesReaderPort} from "./ports/OptimizerRangesReaderPort";
import {PlanetNamesReaderPort} from "./ports/PlanetNamesReaderPort";
import {LoadOverviewPageRequest} from "./requests/LoadOverviewPageRequest";
import {
  OverviewPlanetEnergyResponse,
  OverviewPlanetResponse,
  OverviewProgressionResponse,
  OverviewSaveConfigurationResponse
} from "./responses/OverviewPageResponse";
import {DroneLogisticsResponse} from "./responses/DroneLogisticsResponse";
import {TerraformationLevelSummaryResponse} from "./responses/TerraformationLevelSummaryResponse";
import {resolveGameReleaseOfDeclaredVersion} from "../domain/rules/resolveGameReleaseOfDeclaredVersion";
import {assessDroneLogistics} from "../domain/rules/assessDroneLogistics";
import {PlanetEnergyGrid} from "../domain/PlanetEnergyGrid";
import {selectEnergyLevelsOfDeclaredVersion} from "../domain/energyLevelsByWorldObjectName";
import {resolvePowerConsumptionModifier} from "../domain/rules/resolvePowerConsumptionModifier";
import {isPowerConsumptionModified} from "../domain/rules/isPowerConsumptionModified";
import {namePlanet} from "../domain/rules/namePlanet";
import {precedesCurrentGameRelease} from "../domain/rules/precedesCurrentGameRelease";
import {PlanetEnergyLevelsValueObject} from "../domain/valueObjects/PlanetEnergyLevelsValueObject";
import {TerraformationLevelEntity} from "../domain/entities/TerraformationLevelEntity";

export interface LoadOverviewPageReaders {
  readonly saveSectionsReader: SaveSectionsReaderPort;
  readonly gameReleasesReader: GameReleasesReaderPort;
  readonly energyLevelsReader: EnergyLevelsReaderPort;
  readonly optimizerRangesReader: OptimizerRangesReaderPort;
  readonly planetNamesReader: PlanetNamesReaderPort;
}

export class LoadOverviewPage implements UseCase<LoadOverviewPageRequest> {
  private readonly saveSectionsReader: SaveSectionsReaderPort;
  private readonly gameReleasesReader: GameReleasesReaderPort;
  private readonly energyLevelsReader: EnergyLevelsReaderPort;
  private readonly optimizerRangesReader: OptimizerRangesReaderPort;
  private readonly planetNamesReader: PlanetNamesReaderPort;

  constructor(
    {saveSectionsReader, gameReleasesReader, energyLevelsReader, optimizerRangesReader, planetNamesReader}: LoadOverviewPageReaders,
    private readonly presenter: OverviewPagePresenterPort
  ) {
    this.saveSectionsReader = saveSectionsReader;
    this.gameReleasesReader = gameReleasesReader;
    this.energyLevelsReader = energyLevelsReader;
    this.optimizerRangesReader = optimizerRangesReader;
    this.planetNamesReader = planetNamesReader;
  }

  async execute({content, fileName, fileSize}: LoadOverviewPageRequest): Promise<void> {
    const {saveSections, unreadableLines} = this.saveSectionsReader.read(content);

    if (unreadableLines.length > 0) {
      this.presenter.displaySaveWithUnreadableLines({unreadableLines});
      return;
    }

    const powerConsumptionModifier = resolvePowerConsumptionModifier(saveSections.getSaveConfiguration());
    const gameReleases = this.gameReleasesReader.readGameReleases();
    const energyLevels = selectEnergyLevelsOfDeclaredVersion(saveSections.getDeclaredVersion(), this.energyLevelsReader.readEnergyLevelTables(), gameReleases);
    const terraformationLevels = saveSections.getTerraformationLevels();
    const knownPlanetNames = [...new Set(terraformationLevels.map((level) => level.planetId))];
    const allWorldObjects = saveSections.getWorldObjects();
    const inventories = saveSections.getInventories();
    const optimizerRanges = this.optimizerRangesReader.readOptimizerRanges();
    const planetsEnergyLevels = saveSections.getPlacedWorldObjectsByPlanet()
      .map((planet) => namePlanet(planet, this.planetNamesReader.findPlanetNameOfNumericId(planet.planetId), knownPlanetNames))
      .map((planet) => new PlanetEnergyGrid({planet, allWorldObjects, inventories, energyLevels, optimizerRanges, powerConsumptionModifier}).levels());

    this.presenter.displayOverviewPage({
      saveFile: {name: fileName, size: fileSize},
      saveConfiguration: describeSaveConfiguration(saveSections, gameReleases),
      progression: describeProgression(saveSections),
      planets: describePlanets(terraformationLevels, planetsEnergyLevels),
      energySettings: {
        gameRelease: energyLevels.release,
        gameReleaseIsEarlierThanCurrent: precedesCurrentGameRelease(energyLevels.release, gameReleases),
        powerConsumptionModifier,
        powerConsumptionIsModified: isPowerConsumptionModified(powerConsumptionModifier)
      }
    });
  }
}

function describeSaveConfiguration(saveSections: SaveSectionsMapperPort, gameReleases: readonly GameReleaseValueObject[]): OverviewSaveConfigurationResponse | undefined {
  const saveConfiguration = saveSections.getSaveConfiguration();
  if (!saveConfiguration) {
    return undefined;
  }
  return {
    displayName: saveConfiguration.title,
    mode: saveConfiguration.mode,
    gameRelease: resolveGameReleaseOfDeclaredVersion(saveSections.getDeclaredVersion(), gameReleases)
  };
}

function describePlanets(
  terraformationLevels: readonly TerraformationLevelEntity[],
  planetsEnergyLevels: readonly PlanetEnergyLevelsValueObject[]
): OverviewPlanetResponse[] {
  const terraformedPlanets = terraformationLevels.map((level): OverviewPlanetResponse => {
    const planetEnergyLevels = planetsEnergyLevels.find((planet) => planet.planetName === level.planetId);
    return {
      planetName: level.planetId,
      terraformation: describeTerraformationLevel(level),
      ...(planetEnergyLevels && {energy: describePlanetEnergy(planetEnergyLevels)})
    };
  });
  const energyOnlyPlanets = planetsEnergyLevels
    .filter((planet) => !terraformationLevels.some((level) => level.planetId === planet.planetName))
    .map((planet): OverviewPlanetResponse => ({planetName: planet.planetName, energy: describePlanetEnergy(planet)}));

  return [...terraformedPlanets, ...energyOnlyPlanets];
}

function describeTerraformationLevel(level: TerraformationLevelEntity): TerraformationLevelSummaryResponse {
  return {
    planetId: level.planetId,
    unitOxygenLevel: level.unitOxygenLevel,
    unitHeatLevel: level.unitHeatLevel,
    unitPressureLevel: level.unitPressureLevel,
    unitPlantsLevel: level.unitPlantsLevel,
    unitInsectsLevel: level.unitInsectsLevel,
    unitAnimalsLevel: level.unitAnimalsLevel,
    unitPurificationLevel: level.unitPurificationLevel,
    terraformationIndex: level.terraformationIndex,
    biomass: level.biomass
  };
}

function describePlanetEnergy(planet: PlanetEnergyLevelsValueObject): OverviewPlanetEnergyResponse {
  return {
    numericPlanetId: planet.planetId,
    production: planet.production,
    consumption: planet.consumption,
    available: planet.available
  };
}

function describeProgression(saveSections: SaveSectionsMapperPort): OverviewProgressionResponse {
  const globalProgression = saveSections.getGlobalProgression();
  return {
    allTimeTerraTokens: globalProgression.allTimeTerraTokens,
    totalCraftedObjects: saveSections.getStatistics()?.totalCraftedObjects,
    droneLogistics: describeDroneLogistics(globalProgression.logisticsPaused)
  };
}

function describeDroneLogistics(logisticsPaused: boolean | undefined): DroneLogisticsResponse | undefined {
  if (logisticsPaused === undefined) {
    return undefined;
  }
  return {paused: logisticsPaused, effect: assessDroneLogistics(logisticsPaused)};
}
