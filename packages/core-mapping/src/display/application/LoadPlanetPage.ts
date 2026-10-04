import {UseCase} from "../../save/application/UseCase";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {EnergyLevelsReaderPort} from "./ports/EnergyLevelsReaderPort";
import {GameReleasesReaderPort} from "../../save/application/ports/GameReleasesReaderPort";
import {OptimizerRangesReaderPort} from "./ports/OptimizerRangesReaderPort";
import {PlanetNamesReaderPort} from "./ports/PlanetNamesReaderPort";
import {WorldObjectLabelsReaderPort} from "./ports/WorldObjectLabelsReaderPort";
import {PlanetPagePresenterPort} from "./ports/PlanetPagePresenterPort";
import {LoadPlanetPageRequest} from "./requests/LoadPlanetPageRequest";
import {PlanetTerraformationResponse} from "./responses/TerraformationPageResponse";
import {PlanetPageResponse} from "./responses/PlanetPageResponse";
import {TerraformationLevelSummaryResponse} from "./responses/TerraformationLevelSummaryResponse";
import {
  EnergyBreakdownEntryResponse,
  OptimizerBoostedMachineResponse,
  OptimizerResponse,
  PlanetEnergyLevelsResponse
} from "./responses/EnergyLevelsResponse";
import {PlanetEnergyGrid} from "../domain/PlanetEnergyGrid";
import {selectEnergyLevelsOfDeclaredVersion} from "../domain/energyLevelsByWorldObjectName";
import {resolvePowerConsumptionModifier} from "../domain/rules/resolvePowerConsumptionModifier";
import {isPowerConsumptionModified} from "../domain/rules/isPowerConsumptionModified";
import {namePlanet} from "../domain/rules/namePlanet";
import {identifyPlanet} from "../domain/rules/identifyPlanet";
import {precedesCurrentGameRelease} from "../domain/rules/precedesCurrentGameRelease";
import {assessPowerBalance} from "../domain/rules/assessPowerBalance";
import {computeSystemTerraformationIndex, SystemTerraformationIndex} from "../domain/rules/computeSystemTerraformationIndex";
import {isFactorOfTheSystemTerraformationIndex} from "../domain/rules/isFactorOfTheSystemTerraformationIndex";
import {TerraformationLevelEntity} from "../domain/entities/TerraformationLevelEntity";
import {OptimizerRangesByWorldObjectName} from "../domain/valueObjects/OptimizerRangeValueObject";
import {PlanetEnergyLevelsValueObject} from "../domain/valueObjects/PlanetEnergyLevelsValueObject";
import {EnergyBreakdownEntryValueObject} from "../domain/valueObjects/EnergyBreakdownEntryValueObject";
import {OptimizerValueObject} from "../domain/valueObjects/OptimizerValueObject";
import {OptimizerBoostedMachineValueObject} from "../domain/valueObjects/OptimizerBoostedMachineValueObject";

const NO_FUSE_SLOT = 0;

export interface LoadPlanetPageReaders {
  readonly saveSectionsReader: SaveSectionsReaderPort;
  readonly energyLevelsReader: EnergyLevelsReaderPort;
  readonly gameReleasesReader: GameReleasesReaderPort;
  readonly optimizerRangesReader: OptimizerRangesReaderPort;
  readonly planetNamesReader: PlanetNamesReaderPort;
  readonly worldObjectLabelsReader: WorldObjectLabelsReaderPort;
}

export class LoadPlanetPage implements UseCase<LoadPlanetPageRequest> {
  private readonly saveSectionsReader: SaveSectionsReaderPort;
  private readonly energyLevelsReader: EnergyLevelsReaderPort;
  private readonly gameReleasesReader: GameReleasesReaderPort;
  private readonly optimizerRangesReader: OptimizerRangesReaderPort;
  private readonly planetNamesReader: PlanetNamesReaderPort;
  private readonly worldObjectLabelsReader: WorldObjectLabelsReaderPort;

  constructor(
    {saveSectionsReader, energyLevelsReader, gameReleasesReader, optimizerRangesReader, planetNamesReader, worldObjectLabelsReader}: LoadPlanetPageReaders,
    private readonly presenter: PlanetPagePresenterPort
  ) {
    this.saveSectionsReader = saveSectionsReader;
    this.energyLevelsReader = energyLevelsReader;
    this.gameReleasesReader = gameReleasesReader;
    this.optimizerRangesReader = optimizerRangesReader;
    this.planetNamesReader = planetNamesReader;
    this.worldObjectLabelsReader = worldObjectLabelsReader;
  }

  async execute({content, planetIdentifier}: LoadPlanetPageRequest): Promise<void> {
    const {saveSections, unreadableLines} = this.saveSectionsReader.read(content);

    if (unreadableLines.length > 0) {
      this.presenter.displaySaveWithUnreadableLines({unreadableLines});
      return;
    }

    const allWorldObjects = saveSections.getWorldObjects();
    const inventories = saveSections.getInventories();
    const powerConsumptionModifier = resolvePowerConsumptionModifier(saveSections.getSaveConfiguration());
    const gameReleases = this.gameReleasesReader.readGameReleases();
    const energyLevels = selectEnergyLevelsOfDeclaredVersion(saveSections.getDeclaredVersion(), this.energyLevelsReader.readEnergyLevelTables(), gameReleases);
    const optimizerRanges = this.optimizerRangesReader.readOptimizerRanges();
    const terraformationLevels = saveSections.getTerraformationLevels();
    const knownPlanetNames = [...new Set(terraformationLevels.map((level) => level.planetId))];
    const energyPlanets = saveSections.getPlacedWorldObjectsByPlanet()
      .map((planet) => namePlanet(planet, this.planetNamesReader.findPlanetNameOfNumericId(planet.planetId), knownPlanetNames))
      .map((planet) => new PlanetEnergyGrid({planet, allWorldObjects, inventories, energyLevels, optimizerRanges, powerConsumptionModifier}).levels());
    const systemTerraformationIndex = computeSystemTerraformationIndex(terraformationLevels);

    const terraformationLevel = terraformationLevels.find((level) => level.planetId === planetIdentifier);
    const energyPlanet = energyPlanets.find((planet) => identifyPlanet(planet) === planetIdentifier);

    if (!terraformationLevel && !energyPlanet) {
      this.presenter.displayUnknownPlanet();
      return;
    }

    this.presenter.displayPlanetPage({
      gameRelease: energyLevels.release,
      gameReleaseIsEarlierThanCurrent: precedesCurrentGameRelease(energyLevels.release, gameReleases),
      powerConsumptionModifier,
      powerConsumptionIsModified: isPowerConsumptionModified(powerConsumptionModifier),
      ...describePlanetName(terraformationLevel, energyPlanet),
      ...describeEnergyPlanet(energyPlanet, optimizerRanges),
      ...describeTerraformedPlanet(terraformationLevel, systemTerraformationIndex),
      worldObjectLabels: this.worldObjectLabelsReader.readWorldObjectLabels()
    });
  }
}

function describePlanetName(terraformationLevel: TerraformationLevelEntity | undefined, energyPlanet: PlanetEnergyLevelsValueObject | undefined): Pick<PlanetPageResponse, 'planetName'> {
  const planetName = terraformationLevel?.planetId ?? energyPlanet?.planetName;
  if (planetName === undefined) {
    return {};
  }
  return {planetName};
}

function describeEnergyPlanet(energyPlanet: PlanetEnergyLevelsValueObject | undefined, optimizerRanges: OptimizerRangesByWorldObjectName): Pick<PlanetPageResponse, 'energyLevels'> {
  if (!energyPlanet) {
    return {};
  }
  return {energyLevels: describePlanetEnergyLevels(energyPlanet, optimizerRanges)};
}

function describeTerraformedPlanet(terraformationLevel: TerraformationLevelEntity | undefined, systemTerraformationIndex: SystemTerraformationIndex | undefined): Pick<PlanetPageResponse, 'terraformation'> {
  if (!terraformationLevel) {
    return {};
  }
  return {terraformation: describePlanetTerraformation(terraformationLevel, systemTerraformationIndex)};
}

function describePlanetEnergyLevels(planet: PlanetEnergyLevelsValueObject, optimizerRanges: OptimizerRangesByWorldObjectName): PlanetEnergyLevelsResponse {
  return {
    planetId: planet.planetId,
    planetName: planet.planetName,
    production: planet.production,
    consumption: planet.consumption,
    available: planet.available,
    balance: assessPowerBalance(planet),
    productionBreakdown: planet.productionBreakdown.map(describeEnergyBreakdownEntry),
    consumptionBreakdown: planet.consumptionBreakdown.map(describeEnergyBreakdownEntry),
    optimizers: planet.optimizers.map((optimizer) => describeOptimizer(optimizer, optimizerRanges))
  };
}

function describeEnergyBreakdownEntry(entry: EnergyBreakdownEntryValueObject): EnergyBreakdownEntryResponse {
  return {
    name: entry.name,
    quantity: entry.quantity,
    unitLevel: entry.unitLevel,
    totalLevel: entry.totalLevel,
    productionRatio: entry.productionRatio
  };
}

function describeOptimizer(optimizer: OptimizerValueObject, optimizerRanges: OptimizerRangesByWorldObjectName): OptimizerResponse {
  return {
    name: optimizer.name,
    fuseCount: optimizer.fuseCount,
    fuseSlots: optimizerRanges[optimizer.name]?.fuseSlots ?? NO_FUSE_SLOT,
    boostedMachines: optimizer.boostedMachines.map(describeOptimizerBoostedMachine),
    contribution: optimizer.contribution,
    productionRatio: optimizer.productionRatio
  };
}

function describeOptimizerBoostedMachine(machine: OptimizerBoostedMachineValueObject): OptimizerBoostedMachineResponse {
  return {name: machine.name, quantity: machine.quantity};
}

function describePlanetTerraformation(level: TerraformationLevelEntity, systemTerraformationIndex: SystemTerraformationIndex | undefined): PlanetTerraformationResponse {
  const levels = describeTerraformationLevel(level);
  if (!systemTerraformationIndex || !isFactorOfTheSystemTerraformationIndex(level)) {
    return {levels};
  }
  return {levels, systemTerraformationIndex: {index: systemTerraformationIndex.index, planetCount: systemTerraformationIndex.planetCount}};
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
