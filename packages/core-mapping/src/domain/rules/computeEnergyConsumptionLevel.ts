import {PlacedWorldObjectEntity} from "../entities/PlacedWorldObjectEntity";

/** Computes total consumption for a single planet's positioned world objects. */
export function computeEnergyConsumptionLevel(positionedWorldObjectsOnPlanet: readonly PlacedWorldObjectEntity[]): number {
  return positionedWorldObjectsOnPlanet.reduce((total, worldObject) => total + (worldObject.energyConsumptionLevel ?? 0), 0);
}
