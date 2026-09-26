import {PlanetEnergyLevelsValueObject} from "./PlanetEnergyLevelsValueObject";
import {assertArray, assertNonEmptyString} from "../errors/assertions";

export interface EnergyLevelsValueObject {
  readonly gameRelease: string;
  readonly planets: readonly PlanetEnergyLevelsValueObject[];
}

export function createEnergyLevelsValueObject(input: EnergyLevelsValueObject): EnergyLevelsValueObject {
  return {
    gameRelease: assertNonEmptyString(input.gameRelease, 'EnergyLevelsValueObject.gameRelease'),
    planets: assertArray<PlanetEnergyLevelsValueObject>(input.planets, 'EnergyLevelsValueObject.planets')
  };
}
