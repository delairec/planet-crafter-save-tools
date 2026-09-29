import {WorldObjectName} from "../worldObjectNames";

export interface OptimizerRangeValueObject {
  readonly radius: number;
  readonly maxMachines: number;
}

export type OptimizerRangesByWorldObjectName = Readonly<Partial<Record<WorldObjectName, OptimizerRangeValueObject>>>;
