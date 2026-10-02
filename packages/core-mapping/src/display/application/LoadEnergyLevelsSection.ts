import {UseCase} from "../../save/application/UseCase";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {EnergyLevelsReaderPort} from "./ports/EnergyLevelsReaderPort";
import {GameReleasesReaderPort} from "../../save/application/ports/GameReleasesReaderPort";
import {OptimizerRangesReaderPort} from "./ports/OptimizerRangesReaderPort";
import {PlanetNamesReaderPort} from "./ports/PlanetNamesReaderPort";
import {WorldObjectLabelsReaderPort} from "./ports/WorldObjectLabelsReaderPort";
import {LoadSaveSectionsRequest} from "./requests/LoadSaveSectionsRequest";
import {EnergyLevelsPresenterPort} from "./ports/EnergyLevelsPresenterPort";
import {PlanetEnergyGrid} from "../domain/PlanetEnergyGrid";
import {selectEnergyLevelsOfDeclaredVersion} from "../domain/energyLevelsByWorldObjectName";
import {GAME_DEFAULT_MODIFIER} from "../domain/gameDefaultModifier";
import {isPowerConsumptionModified} from "../domain/rules/isPowerConsumptionModified";
import {resolvePlanetName} from "../domain/rules/resolvePlanetName";
import {precedesCurrentGameRelease} from "../domain/rules/precedesCurrentGameRelease";
import {createPlanetWorldObjectsValueObject, PlanetWorldObjectsValueObject} from "../domain/valueObjects/PlanetWorldObjectsValueObject";
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

export interface LoadEnergyLevelsSectionReaders {
  readonly saveSectionsReader: SaveSectionsReaderPort;
  readonly energyLevelsReader: EnergyLevelsReaderPort;
  readonly gameReleasesReader: GameReleasesReaderPort;
  readonly optimizerRangesReader: OptimizerRangesReaderPort;
  readonly planetNamesReader: PlanetNamesReaderPort;
  readonly worldObjectLabelsReader: WorldObjectLabelsReaderPort;
}

export class LoadEnergyLevelsSection implements UseCase<LoadSaveSectionsRequest> {
  private readonly saveSectionsReader: SaveSectionsReaderPort;
  private readonly energyLevelsReader: EnergyLevelsReaderPort;
  private readonly gameReleasesReader: GameReleasesReaderPort;
  private readonly optimizerRangesReader: OptimizerRangesReaderPort;
  private readonly planetNamesReader: PlanetNamesReaderPort;
  private readonly worldObjectLabelsReader: WorldObjectLabelsReaderPort;

  constructor(
    {saveSectionsReader, energyLevelsReader, gameReleasesReader, optimizerRangesReader, planetNamesReader, worldObjectLabelsReader}: LoadEnergyLevelsSectionReaders,
    private readonly presenter: EnergyLevelsPresenterPort
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
    const powerConsumptionModifier = saveSections.getSaveConfiguration()?.modifiers.powerConsumption ?? GAME_DEFAULT_MODIFIER;
    const gameReleases = this.gameReleasesReader.readGameReleases();
    const energyLevels = selectEnergyLevelsOfDeclaredVersion(saveSections.getDeclaredVersion(), {
      energyLevels: this.energyLevelsReader.readEnergyLevels(),
      divergingEnergyLevelsByRelease: this.energyLevelsReader.readDivergingEnergyLevelsByRelease()
    }, gameReleases);
    const optimizerRanges = this.optimizerRangesReader.readOptimizerRanges();
    const knownPlanetNames = [...new Set(saveSections.getTerraformationLevels().map((level) => level.planetId))];

    this.presenter.displayEnergyLevels({
      gameRelease: energyLevels.release,
      gameReleaseIsEarlierThanCurrent: precedesCurrentGameRelease(energyLevels.release, gameReleases),
      powerConsumptionModifier,
      powerConsumptionIsModified: isPowerConsumptionModified(powerConsumptionModifier),
      planets: saveSections.getPlacedWorldObjectsByPlanet()
        .map((planet) => this.nameThePlanet(planet, knownPlanetNames))
        .map((planet) => new PlanetEnergyGrid({planet, allWorldObjects, inventories, energyLevels, optimizerRanges, powerConsumptionModifier}).levels())
        .map(describePlanetEnergyLevels),
      worldObjectLabels: this.worldObjectLabelsReader.readWorldObjectLabels()
    });
  }

  private nameThePlanet(planet: PlanetWorldObjectsValueObject, knownPlanetNames: string[]): PlanetWorldObjectsValueObject {
    return createPlanetWorldObjectsValueObject({
      ...planet,
      planetName: resolvePlanetName(
        this.planetNamesReader.findPlanetNameOfNumericId(planet.planetId),
        planet.placedWorldObjects.map((placedWorldObject) => placedWorldObject.name),
        knownPlanetNames
      )
    });
  }
}

function describePlanetEnergyLevels(planet: PlanetEnergyLevelsValueObject): PlanetEnergyLevelsResponse {
  return {
    planetId: planet.planetId,
    planetName: planet.planetName,
    production: planet.production,
    consumption: planet.consumption,
    available: planet.available,
    productionBreakdown: planet.productionBreakdown.map(describeEnergyBreakdownEntry),
    consumptionBreakdown: planet.consumptionBreakdown.map(describeEnergyBreakdownEntry),
    optimizers: planet.optimizers.map(describeOptimizer)
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

function describeOptimizer(optimizer: OptimizerValueObject): OptimizerResponse {
  return {
    name: optimizer.name,
    fuseCount: optimizer.fuseCount,
    boostedMachines: optimizer.boostedMachines.map(describeOptimizerBoostedMachine),
    contribution: optimizer.contribution,
    productionRatio: optimizer.productionRatio
  };
}

function describeOptimizerBoostedMachine(machine: OptimizerBoostedMachineValueObject): OptimizerBoostedMachineResponse {
  return {name: machine.name, quantity: machine.quantity};
}
