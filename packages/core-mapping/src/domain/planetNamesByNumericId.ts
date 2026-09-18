import planetNames from './planetNamesByNumericId.json' with {type: 'json'};

export const planetNamesByNumericId: Partial<Record<number, string>> = Object.fromEntries(
  planetNames.map((planet) => [planet.numericId, planet.planetName])
);
