
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
    this._planetId = input.planetId;
    this._unitOxygenLevel = input.unitOxygenLevel;
    this._unitHeatLevel = input.unitHeatLevel;
    this._unitPressureLevel = input.unitPressureLevel;
    this._unitPlantsLevel = input.unitPlantsLevel;
    this._unitInsectsLevel = input.unitInsectsLevel;
    this._unitAnimalsLevel = input.unitAnimalsLevel;
    this._unitPurificationLevel = input.unitPurificationLevel;
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

  get biomass(): number {
    return this._unitPlantsLevel + this._unitInsectsLevel + this._unitAnimalsLevel;
  }

  get terraformationIndex(): number {
    const environmental = this._unitOxygenLevel + this._unitHeatLevel + this._unitPressureLevel + this._unitPurificationLevel;

    return environmental + this.biomass;
  }
}
