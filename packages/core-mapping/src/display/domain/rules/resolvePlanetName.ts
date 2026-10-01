export function resolvePlanetName(
  planetNameOfNumericId: string | undefined,
  worldObjectNamesOnPlanet: string[],
  knownPlanetNames: string[]
): string | undefined {
  if (planetNameOfNumericId !== undefined) {
    return planetNameOfNumericId;
  }

  const matchingPlanetNames = new Set(
    worldObjectNamesOnPlanet
      .flatMap((worldObjectName) => knownPlanetNames.filter((planetName) => worldObjectName.includes(planetName)))
  );

  return matchingPlanetNames.size === 1 ? [...matchingPlanetNames][0] : undefined;
}
