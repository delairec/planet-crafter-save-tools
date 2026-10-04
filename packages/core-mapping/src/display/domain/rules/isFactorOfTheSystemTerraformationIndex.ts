import {TerraformationLevelEntity} from "../entities/TerraformationLevelEntity";

export function isFactorOfTheSystemTerraformationIndex(terraformationLevel: TerraformationLevelEntity): boolean {
  return terraformationLevel.terraformationIndex !== 0;
}
