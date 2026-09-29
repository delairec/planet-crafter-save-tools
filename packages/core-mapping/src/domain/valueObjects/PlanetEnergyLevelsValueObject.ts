import {EnergyBreakdownEntryValueObject} from "./EnergyBreakdownEntryValueObject";
import {OptimizerValueObject} from "./OptimizerValueObject";

export interface PlanetEnergyLevelsValueObject {
  readonly planetId: number;
  readonly planetName?: string;
  readonly production: number;
  readonly consumption: number;
  readonly available: number;
  readonly productionBreakdown: readonly EnergyBreakdownEntryValueObject[];
  readonly consumptionBreakdown: readonly EnergyBreakdownEntryValueObject[];
  readonly optimizers: readonly OptimizerValueObject[];
}

export function createPlanetEnergyLevelsValueObject(input: PlanetEnergyLevelsValueObject): PlanetEnergyLevelsValueObject {
  return {
    planetId: input.planetId,
    planetName: input.planetName,
    production: input.production,
    consumption: input.consumption,
    available: input.available,
    productionBreakdown: input.productionBreakdown,
    consumptionBreakdown: input.consumptionBreakdown,
    optimizers: input.optimizers
  };
}
