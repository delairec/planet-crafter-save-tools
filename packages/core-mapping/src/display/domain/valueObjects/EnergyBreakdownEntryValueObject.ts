import {WorldObjectName} from "../worldObjectNames";

export interface EnergyBreakdownEntryValueObject {
  readonly name: WorldObjectName;
  readonly quantity: number;
  readonly unitLevel: number;
  readonly totalLevel: number;
  readonly productionRatio?: number;
}

export function createEnergyBreakdownEntryValueObject(input: EnergyBreakdownEntryValueObject): EnergyBreakdownEntryValueObject {
  return {
    name: input.name,
    quantity: input.quantity,
    unitLevel: input.unitLevel,
    totalLevel: input.totalLevel,
    productionRatio: input.productionRatio
  };
}
