import type {PlanetNameRow} from './PlanetNameRow';
import planetNames from './planetNamesByNumericId.json' with {type: 'json'};

const planetNameRows: readonly PlanetNameRow[] = planetNames;

export function selectPlanetNameOfNumericId(numericId: number): string | undefined {
  return planetNameRows.find((row) => row.numericId === numericId)?.planetName;
}
