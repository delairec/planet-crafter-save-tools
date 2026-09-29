import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {EnergyLevelsReaderPort} from "./ports/EnergyLevelsReaderPort";
import {OptimizerRangesReaderPort} from "./ports/OptimizerRangesReaderPort";
import {PlanetNamesReaderPort} from "./ports/PlanetNamesReaderPort";
import {WorldObjectLabelsReaderPort} from "./ports/WorldObjectLabelsReaderPort";
import {LoadSaveSectionsRequest} from "./requests/LoadSaveSectionsRequest";
import {EnergyLevelsPresenterPort} from "./ports/EnergyLevelsPresenterPort";
import {PlanetEnergyGrid} from "../domain/PlanetEnergyGrid";
import {selectEnergyLevelsOfDeclaredVersion} from "../domain/energyLevelsByWorldObjectName";
import {UNMODIFIED_POWER_CONSUMPTION_MODIFIER} from "../domain/powerConsumptionModifier";
import {resolvePlanetName} from "../domain/rules/resolvePlanetName";
import {createPlanetWorldObjectsValueObject, PlanetWorldObjectsValueObject} from "../domain/valueObjects/PlanetWorldObjectsValueObject";

export interface LoadEnergyLevelsSectionReaders {
  readonly saveSectionsReader: SaveSectionsReaderPort;
  readonly energyLevelsReader: EnergyLevelsReaderPort;
  readonly optimizerRangesReader: OptimizerRangesReaderPort;
  readonly planetNamesReader: PlanetNamesReaderPort;
  readonly worldObjectLabelsReader: WorldObjectLabelsReaderPort;
}

export class LoadEnergyLevelsSection {
  private readonly saveSectionsReader: SaveSectionsReaderPort;
  private readonly energyLevelsReader: EnergyLevelsReaderPort;
  private readonly optimizerRangesReader: OptimizerRangesReaderPort;
  private readonly planetNamesReader: PlanetNamesReaderPort;
  private readonly worldObjectLabelsReader: WorldObjectLabelsReaderPort;

  constructor(
    {saveSectionsReader, energyLevelsReader, optimizerRangesReader, planetNamesReader, worldObjectLabelsReader}: LoadEnergyLevelsSectionReaders,
    private readonly presenter: EnergyLevelsPresenterPort
  ) {
    this.saveSectionsReader = saveSectionsReader;
    this.energyLevelsReader = energyLevelsReader;
    this.optimizerRangesReader = optimizerRangesReader;
    this.planetNamesReader = planetNamesReader;
    this.worldObjectLabelsReader = worldObjectLabelsReader;
  }

  async execute({content}: LoadSaveSectionsRequest): Promise<void> {
    const {saveSections, unreadableLines} = this.saveSectionsReader.read(content);

    if (unreadableLines.length > 0) {
      this.presenter.displaySaveWithUnreadableLines(unreadableLines);
      return;
    }

    const allWorldObjects = saveSections.getWorldObjects();
    const inventories = saveSections.getInventories();
    const powerConsumptionModifier = saveSections.getSaveConfiguration()?.modifiers.powerConsumption ?? UNMODIFIED_POWER_CONSUMPTION_MODIFIER;
    const energyLevels = selectEnergyLevelsOfDeclaredVersion(saveSections.getDeclaredVersion(), {
      energyLevels: this.energyLevelsReader.readEnergyLevels(),
      divergingEnergyLevelsByRelease: this.energyLevelsReader.readDivergingEnergyLevelsByRelease()
    });
    const optimizerRanges = this.optimizerRangesReader.readOptimizerRanges();
    const knownPlanetNames = [...new Set(saveSections.getTerraformationLevels().map((level) => level.planetId))];

    this.presenter.displayEnergyLevels({
      gameRelease: energyLevels.release,
      powerConsumptionModifier,
      planets: saveSections.getPlacedWorldObjectsByPlanet()
        .map((planet) => this.nameThePlanet(planet, knownPlanetNames))
        .map((planet) => new PlanetEnergyGrid({planet, allWorldObjects, inventories, energyLevels, optimizerRanges, powerConsumptionModifier}).levels()),
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
