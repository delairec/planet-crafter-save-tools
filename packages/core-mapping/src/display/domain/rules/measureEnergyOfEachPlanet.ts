import {PlanetWorldObjectsValueObject} from "../valueObjects/PlanetWorldObjectsValueObject";
import {PlanetEnergyLevelsValueObject} from "../valueObjects/PlanetEnergyLevelsValueObject";
import {TerraformationLevelEntity} from "../entities/TerraformationLevelEntity";
import {PlanetEnergyGrid, PlanetEnergyGridInput} from "../PlanetEnergyGrid";
import {namePlanet} from "./namePlanet";

export interface EachPlanetEnergyInput extends Omit<PlanetEnergyGridInput, 'planet'> {
  readonly planets: readonly PlanetWorldObjectsValueObject[];
  readonly terraformationLevels: readonly TerraformationLevelEntity[];
  readonly findPlanetNameOfNumericId: (numericId: number) => string | undefined;
}

export function measureEnergyOfEachPlanet({planets, terraformationLevels, findPlanetNameOfNumericId, ...grid}: EachPlanetEnergyInput): PlanetEnergyLevelsValueObject[] {
  const knownPlanetNames = [...new Set(terraformationLevels.map((level) => level.planetId))];
  return planets
    .map((planet) => namePlanet(planet, findPlanetNameOfNumericId(planet.planetId), knownPlanetNames))
    .map((planet) => new PlanetEnergyGrid({planet, ...grid}).levels());
}
