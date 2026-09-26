import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {EnergyLevelsPresenterPort} from "./ports/EnergyLevelsPresenterPort";
import {createEnergyLevelsValueObject} from "../domain/valueObjects/EnergyLevelsValueObject";
import {PlanetEnergyGrid} from "../domain/PlanetEnergyGrid";
import {selectEnergyLevelsOfDeclaredVersion} from "../domain/energyLevelsByWorldObjectName";

export class LoadEnergyLevelsSection {
  constructor(
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly presenter: EnergyLevelsPresenterPort
  ) {
  }

  async execute(): Promise<void> {
    const {allWorldObjects, inventories, planets, declaredVersion} = this.saveSectionsReader.getEnergyLevelsRawData();
    const energyLevelsOfRelease = selectEnergyLevelsOfDeclaredVersion(declaredVersion);

    const energyLevels = createEnergyLevelsValueObject({
      gameRelease: energyLevelsOfRelease.release,
      planets: planets.map((planet) => new PlanetEnergyGrid(planet, allWorldObjects, inventories, energyLevelsOfRelease).levels())
    });

    this.presenter.displayEnergyLevels(energyLevels);
  }
}
