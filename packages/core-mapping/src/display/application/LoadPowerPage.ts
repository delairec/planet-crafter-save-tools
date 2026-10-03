import {UseCase} from "../../save/application/UseCase";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {EnergyLevelsReaderPort} from "./ports/EnergyLevelsReaderPort";
import {GameReleasesReaderPort} from "../../save/application/ports/GameReleasesReaderPort";
import {OptimizerRangesReaderPort} from "./ports/OptimizerRangesReaderPort";
import {PlanetNamesReaderPort} from "./ports/PlanetNamesReaderPort";
import {WorldObjectLabelsReaderPort} from "./ports/WorldObjectLabelsReaderPort";
import {LoadSaveSectionsRequest} from "./requests/LoadSaveSectionsRequest";
import {PowerPagePresenterPort} from "./ports/PowerPagePresenterPort";
import {PlanetEnergyGrid} from "../domain/PlanetEnergyGrid";
import {selectEnergyLevelsOfDeclaredVersion} from "../domain/energyLevelsByWorldObjectName";
import {resolvePowerConsumptionModifier} from "../domain/rules/resolvePowerConsumptionModifier";
import {isPowerConsumptionModified} from "../domain/rules/isPowerConsumptionModified";
import {namePlanet} from "../domain/rules/namePlanet";
import {precedesCurrentGameRelease} from "../domain/rules/precedesCurrentGameRelease";
import {assessPowerBalance} from "../domain/rules/assessPowerBalance";
import {OptimizerRangesByWorldObjectName} from "../domain/valueObjects/OptimizerRangeValueObject";
import {PlanetEnergyLevelsValueObject} from "../domain/valueObjects/PlanetEnergyLevelsValueObject";
import {EnergyBreakdownEntryValueObject} from "../domain/valueObjects/EnergyBreakdownEntryValueObject";
import {OptimizerValueObject} from "../domain/valueObjects/OptimizerValueObject";
import {OptimizerBoostedMachineValueObject} from "../domain/valueObjects/OptimizerBoostedMachineValueObject";
import {
  EnergyBreakdownEntryResponse,
  OptimizerBoostedMachineResponse,
  OptimizerResponse,
  PlanetEnergyLevelsResponse
} from "./responses/EnergyLevelsResponse";

const NO_FUSE_SLOT = 0;

export interface LoadPowerPageReaders {
  readonly saveSectionsReader: SaveSectionsReaderPort;
  readonly energyLevelsReader: EnergyLevelsReaderPort;
  readonly gameReleasesReader: GameReleasesReaderPort;
  readonly optimizerRangesReader: OptimizerRangesReaderPort;
  readonly planetNamesReader: PlanetNamesReaderPort;
  readonly worldObjectLabelsReader: WorldObjectLabelsReaderPort;
}

export class LoadPowerPage implements UseCase<LoadSaveSectionsRequest> {
  private readonly saveSectionsReader: SaveSectionsReaderPort;
  private readonly energyLevelsReader: EnergyLevelsReaderPort;
  private readonly gameReleasesReader: GameReleasesReaderPort;
  private readonly optimizerRangesReader: OptimizerRangesReaderPort;
  private readonly planetNamesReader: PlanetNamesReaderPort;
  private readonly worldObjectLabelsReader: WorldObjectLabelsReaderPort;

  constructor(
    {saveSectionsReader, energyLevelsReader, gameReleasesReader, optimizerRangesReader, planetNamesReader, worldObjectLabelsReader}: LoadPowerPageReaders,
    private readonly presenter: PowerPagePresenterPort
  ) {
    this.saveSectionsReader = saveSectionsReader;
    this.energyLevelsReader = energyLevelsReader;
    this.gameReleasesReader = gameReleasesReader;
    this.optimizerRangesReader = optimizerRangesReader;
    this.planetNamesReader = planetNamesReader;
    this.worldObjectLabelsReader = worldObjectLabelsReader;
  }

  async execute({content}: LoadSaveSectionsRequest): Promise<void> {
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
    const knownPlanetNames = [...new Set(saveSections.getTerraformationLevels().map((level) => level.planetId))];

    this.presenter.displayPowerPage({
      gameRelease: energyLevels.release,
      gameReleaseIsEarlierThanCurrent: precedesCurrentGameRelease(energyLevels.release, gameReleases),
      powerConsumptionModifier,
      powerConsumptionIsModified: isPowerConsumptionModified(powerConsumptionModifier),
      planets: saveSections.getPlacedWorldObjectsByPlanet()
        .map((planet) => namePlanet(planet, this.planetNamesReader.findPlanetNameOfNumericId(planet.planetId), knownPlanetNames))
        .map((planet) => new PlanetEnergyGrid({planet, allWorldObjects, inventories, energyLevels, optimizerRanges, powerConsumptionModifier}).levels())
        .map((planet) => describePlanetEnergyLevels(planet, optimizerRanges)),
      worldObjectLabels: this.worldObjectLabelsReader.readWorldObjectLabels()
    });
  }
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
