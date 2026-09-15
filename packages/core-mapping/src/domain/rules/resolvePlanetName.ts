import {planetNamesByNumericId} from "../planetNamesByNumericId";

export function resolvePlanetName(
  planetId: number,
  worldObjectNamesOnPlanet: string[],
  knownPlanetNames: string[]
): string | undefined {
  const knownPlanetName = planetNamesByNumericId[planetId];
  if (knownPlanetName !== undefined) {
    return knownPlanetName;
  }

  const matchingPlanetNames = new Set(
    worldObjectNamesOnPlanet
      .flatMap((worldObjectName) => knownPlanetNames.filter((planetName) => worldObjectName.includes(planetName)))
  );

  return matchingPlanetNames.size === 1 ? [...matchingPlanetNames][0] : undefined;
}
