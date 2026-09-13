import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {EnergyLevelsPresenterPort} from "./ports/EnergyLevelsPresenterPort";
import {createEnergyLevelsValueObject} from "../domain/valueObjects/EnergyLevelsValueObject";
import {createPlanetEnergyLevelsValueObject} from "../domain/valueObjects/PlanetEnergyLevelsValueObject";
import {computePlanetEnergyLevels} from "../domain/rules/computePlanetEnergyLevels";

export class LoadEnergyLevelsSection {
  constructor(
    private readonly saveParser: SaveSectionsReaderPort,
    private readonly presenter: EnergyLevelsPresenterPort
  ) {
  }

  async execute(): Promise<void> {
    const {allWorldObjects, inventories, planets} = this.saveParser.getEnergyLevelsRawData();

    const energyLevels = createEnergyLevelsValueObject({
      planets: planets.map((planet) => {
        const levels = computePlanetEnergyLevels(allWorldObjects, planet.placedWorldObjects, inventories);

        return createPlanetEnergyLevelsValueObject({
          planetId: planet.planetId,
          planetName: planet.planetName,
          production: levels.production,
          consumption: levels.consumption,
          available: levels.available,
          productionBreakdown: levels.productionBreakdown,
          consumptionBreakdown: levels.consumptionBreakdown,
          optimizers: levels.optimizers
        });
      })
    });

    this.presenter.displayEnergyLevels(energyLevels);
  }
}
