import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {EnergyLevelsPresenterPort} from "./ports/EnergyLevelsPresenterPort";
import {createEnergyLevelsValueObject} from "../domain/valueObjects/EnergyLevelsValueObject";
import {PlanetEnergyGrid} from "../domain/PlanetEnergyGrid";

export class LoadEnergyLevelsSection {
  constructor(
    private readonly saveParser: SaveSectionsReaderPort,
    private readonly presenter: EnergyLevelsPresenterPort
  ) {
  }

  async execute(): Promise<void> {
    const {allWorldObjects, inventories, planets} = this.saveParser.getEnergyLevelsRawData();

    const energyLevels = createEnergyLevelsValueObject({
      planets: planets.map((planet) => new PlanetEnergyGrid(planet, allWorldObjects, inventories).levels())
    });

    this.presenter.displayEnergyLevels(energyLevels);
  }
}
