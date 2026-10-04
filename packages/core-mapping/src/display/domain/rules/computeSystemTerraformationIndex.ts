import {TerraformationLevelEntity} from "../entities/TerraformationLevelEntity";

export interface SystemTerraformationIndex {
  readonly index: number;
  readonly planetCount: number;
}

const SMALLEST_SYSTEM_INDEX_TO_MULTIPLY = Number.EPSILON;

function foldPlanetIndex(systemIndex: number, planetIndex: number): number {
  if (systemIndex < SMALLEST_SYSTEM_INDEX_TO_MULTIPLY) {
    return planetIndex;
  }
  return systemIndex * Math.max(planetIndex, 1);
}

export function computeSystemTerraformationIndex(terraformationLevels: readonly TerraformationLevelEntity[]): SystemTerraformationIndex | undefined {
  const indexes = terraformationLevels.map((level) => level.terraformationIndex);
  const planetCount = indexes.filter((index) => index !== 0).length;
  if (planetCount === 0) {
    return undefined;
  }
  return {index: indexes.reduce(foldPlanetIndex, 0), planetCount};
}
