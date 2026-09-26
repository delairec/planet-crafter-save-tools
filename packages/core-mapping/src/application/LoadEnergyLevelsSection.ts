import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {EnergyLevelsPresenterPort} from "./ports/EnergyLevelsPresenterPort";
import {createEnergyLevelsValueObject} from "../domain/valueObjects/EnergyLevelsValueObject";
import {PlanetEnergyGrid} from "../domain/PlanetEnergyGrid";
import {selectEnergyLevelsOfDeclaredVersion} from "../domain/energyLevelsByWorldObjectName";
import {UNMODIFIED_POWER_CONSUMPTION_MODIFIER} from "../domain/powerConsumptionModifier";

export class LoadEnergyLevelsSection {
  constructor(
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly presenter: EnergyLevelsPresenterPort
  ) {
  }

  async execute(): Promise<void> {
    const {
      allWorldObjects,
      inventories,
      planets,
      declaredVersion,
      powerConsumptionModifier = UNMODIFIED_POWER_CONSUMPTION_MODIFIER
    } = this.saveSectionsReader.getEnergyLevelsRawData();
    const energyLevelsOfRelease = selectEnergyLevelsOfDeclaredVersion(declaredVersion);

    const energyLevels = createEnergyLevelsValueObject({
      gameRelease: energyLevelsOfRelease.release,
      powerConsumptionModifier,
      planets: planets.map((planet) => new PlanetEnergyGrid(planet, allWorldObjects, inventories, energyLevelsOfRelease, powerConsumptionModifier).levels())
    });

    this.presenter.displayEnergyLevels(energyLevels);
  }
}
