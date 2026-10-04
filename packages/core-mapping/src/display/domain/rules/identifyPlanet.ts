import {PlanetEnergyLevelsValueObject} from "../valueObjects/PlanetEnergyLevelsValueObject";

export function identifyPlanet(planet: Pick<PlanetEnergyLevelsValueObject, 'planetId' | 'planetName'>): string {
  return planet.planetName ?? String(planet.planetId);
}
