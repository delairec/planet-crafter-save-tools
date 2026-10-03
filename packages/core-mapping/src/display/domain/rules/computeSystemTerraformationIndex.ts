import {TerraformationLevelEntity} from "../entities/TerraformationLevelEntity";

export interface SystemTerraformationIndex {
  readonly index: number;
  readonly planetCount: number;
}

export function computeSystemTerraformationIndex(terraformationLevels: readonly TerraformationLevelEntity[]): SystemTerraformationIndex | undefined {
  const indexes = terraformationLevels.map((level) => level.terraformationIndex).filter((index) => index !== 0);
  if (indexes.length === 0) {
    return undefined;
  }
  return {index: indexes.reduce((product, index) => product * index, 1), planetCount: indexes.length};
}
