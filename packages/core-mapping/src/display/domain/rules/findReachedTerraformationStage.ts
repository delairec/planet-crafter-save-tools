import {TerraformationLevelEntity} from "../entities/TerraformationLevelEntity";
import {TerraformationStageValueObject} from "../valueObjects/TerraformationStageValueObject";

export function findReachedTerraformationStage(level: TerraformationLevelEntity, stages: readonly TerraformationStageValueObject[]): TerraformationStageValueObject | undefined {
  let reachedStage: TerraformationStageValueObject | undefined;
  for (const stage of stages) {
    if (isReachedLaterStageOfPlanet(stage, level, reachedStage)) {
      reachedStage = stage;
    }
  }
  return reachedStage;
}

function isReachedLaterStageOfPlanet(stage: TerraformationStageValueObject, level: TerraformationLevelEntity, reachedStage: TerraformationStageValueObject | undefined): boolean {
  if (!stage.planetNames.includes(level.planetId) || stage.startTerraformationIndex > level.terraformationIndex) {
    return false;
  }
  return reachedStage === undefined || stage.startTerraformationIndex > reachedStage.startTerraformationIndex;
}
