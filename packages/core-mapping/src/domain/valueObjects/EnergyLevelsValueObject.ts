import {PlanetEnergyLevelsValueObject} from "./PlanetEnergyLevelsValueObject";
import {assertArray, assertFiniteNumber, assertNonEmptyString} from "../errors/assertions";

export interface EnergyLevelsValueObject {
  readonly gameRelease: string;
  readonly powerConsumptionModifier: number;
  readonly planets: readonly PlanetEnergyLevelsValueObject[];
}

export function createEnergyLevelsValueObject(input: EnergyLevelsValueObject): EnergyLevelsValueObject {
  return {
    gameRelease: assertNonEmptyString(input.gameRelease, 'EnergyLevelsValueObject.gameRelease'),
    powerConsumptionModifier: assertFiniteNumber(input.powerConsumptionModifier, 'EnergyLevelsValueObject.powerConsumptionModifier'),
    planets: assertArray<PlanetEnergyLevelsValueObject>(input.planets, 'EnergyLevelsValueObject.planets')
  };
}
