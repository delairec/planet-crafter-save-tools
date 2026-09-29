import {PlanetEnergyLevelsValueObject} from "../../domain/valueObjects/PlanetEnergyLevelsValueObject";

export interface EnergyLevelsResponse {
  readonly gameRelease: string;
  readonly powerConsumptionModifier: number;
  readonly planets: readonly PlanetEnergyLevelsValueObject[];
}
