import {assertFiniteNumber, assertNonEmptyString} from "../errors/assertions";

export interface TerraformationLevelSummaryValueObject {
  readonly planetId: string;
  readonly unitOxygenLevel: number;
  readonly unitHeatLevel: number;
  readonly unitPressureLevel: number;
  readonly unitPlantsLevel: number;
  readonly unitInsectsLevel: number;
  readonly unitAnimalsLevel: number;
  readonly unitPurificationLevel: number;
  readonly terraformationIndex: number;
  readonly biomass: number;
}

export function createTerraformationLevelSummaryValueObject(input: TerraformationLevelSummaryValueObject): TerraformationLevelSummaryValueObject {
  return {
    planetId: assertNonEmptyString(input.planetId, 'TerraformationLevelSummaryValueObject.planetId'),
    unitOxygenLevel: assertFiniteNumber(input.unitOxygenLevel, 'TerraformationLevelSummaryValueObject.unitOxygenLevel'),
    unitHeatLevel: assertFiniteNumber(input.unitHeatLevel, 'TerraformationLevelSummaryValueObject.unitHeatLevel'),
    unitPressureLevel: assertFiniteNumber(input.unitPressureLevel, 'TerraformationLevelSummaryValueObject.unitPressureLevel'),
    unitPlantsLevel: assertFiniteNumber(input.unitPlantsLevel, 'TerraformationLevelSummaryValueObject.unitPlantsLevel'),
    unitInsectsLevel: assertFiniteNumber(input.unitInsectsLevel, 'TerraformationLevelSummaryValueObject.unitInsectsLevel'),
    unitAnimalsLevel: assertFiniteNumber(input.unitAnimalsLevel, 'TerraformationLevelSummaryValueObject.unitAnimalsLevel'),
    unitPurificationLevel: assertFiniteNumber(input.unitPurificationLevel, 'TerraformationLevelSummaryValueObject.unitPurificationLevel'),
    terraformationIndex: assertFiniteNumber(input.terraformationIndex, 'TerraformationLevelSummaryValueObject.terraformationIndex'),
    biomass: assertFiniteNumber(input.biomass, 'TerraformationLevelSummaryValueObject.biomass')
  };
}
