import {assertFiniteNumber, assertNonEmptyString} from "../errors/assertions";
import {
  createTerraformationLevelSummaryValueObject,
  TerraformationLevelSummaryValueObject
} from "../valueObjects/TerraformationLevelSummaryValueObject";

export interface TerraformationLevelEntityInput {
  readonly planetId: string;
  readonly unitOxygenLevel: number;
  readonly unitHeatLevel: number;
  readonly unitPressureLevel: number;
  readonly unitPlantsLevel: number;
  readonly unitInsectsLevel: number;
  readonly unitAnimalsLevel: number;
  readonly unitPurificationLevel: number;
}

export class TerraformationLevelEntity {
  private readonly _planetId: string;
  private readonly _unitOxygenLevel: number;
  private readonly _unitHeatLevel: number;
  private readonly _unitPressureLevel: number;
  private readonly _unitPlantsLevel: number;
  private readonly _unitInsectsLevel: number;
  private readonly _unitAnimalsLevel: number;
  private readonly _unitPurificationLevel: number;

  constructor(input: TerraformationLevelEntityInput) {
    this._planetId = assertNonEmptyString(input.planetId, 'TerraformationLevelEntity.planetId');
    this._unitOxygenLevel = assertFiniteNumber(input.unitOxygenLevel, 'TerraformationLevelEntity.unitOxygenLevel');
    this._unitHeatLevel = assertFiniteNumber(input.unitHeatLevel, 'TerraformationLevelEntity.unitHeatLevel');
    this._unitPressureLevel = assertFiniteNumber(input.unitPressureLevel, 'TerraformationLevelEntity.unitPressureLevel');
    this._unitPlantsLevel = assertFiniteNumber(input.unitPlantsLevel, 'TerraformationLevelEntity.unitPlantsLevel');
    this._unitInsectsLevel = assertFiniteNumber(input.unitInsectsLevel, 'TerraformationLevelEntity.unitInsectsLevel');
    this._unitAnimalsLevel = assertFiniteNumber(input.unitAnimalsLevel, 'TerraformationLevelEntity.unitAnimalsLevel');
    this._unitPurificationLevel = assertFiniteNumber(input.unitPurificationLevel, 'TerraformationLevelEntity.unitPurificationLevel');
  }

  get planetId(): string {
    return this._planetId;
  }

  get unitOxygenLevel(): number {
    return this._unitOxygenLevel;
  }

  get unitHeatLevel(): number {
    return this._unitHeatLevel;
  }

  get unitPressureLevel(): number {
    return this._unitPressureLevel;
  }

  get unitPlantsLevel(): number {
    return this._unitPlantsLevel;
  }

  get unitInsectsLevel(): number {
    return this._unitInsectsLevel;
  }

  get unitAnimalsLevel(): number {
    return this._unitAnimalsLevel;
  }

  get unitPurificationLevel(): number {
    return this._unitPurificationLevel;
  }

  summarize(): TerraformationLevelSummaryValueObject {
    const biomass = this._unitPlantsLevel + this._unitInsectsLevel + this._unitAnimalsLevel;
    const environmental = this._unitOxygenLevel + this._unitHeatLevel + this._unitPressureLevel + this._unitPurificationLevel;

    return createTerraformationLevelSummaryValueObject({
      planetId: this._planetId,
      unitOxygenLevel: this._unitOxygenLevel,
      unitHeatLevel: this._unitHeatLevel,
      unitPressureLevel: this._unitPressureLevel,
      unitPlantsLevel: this._unitPlantsLevel,
      unitInsectsLevel: this._unitInsectsLevel,
      unitAnimalsLevel: this._unitAnimalsLevel,
      unitPurificationLevel: this._unitPurificationLevel,
      terraformationIndex: environmental + biomass,
      biomass
    });
  }
}
