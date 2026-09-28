import {OptimizerBoostedMachineValueObject} from "./OptimizerBoostedMachineValueObject";
import {WorldObjectName} from "../worldObjectNames";

export interface OptimizerValueObject {
  readonly name: WorldObjectName;
  readonly fuseCount: number;
  readonly boostedMachines: readonly OptimizerBoostedMachineValueObject[];
  readonly contribution: number;
  readonly productionRatio?: number;
}

export function createOptimizerValueObject(input: OptimizerValueObject): OptimizerValueObject {
  return {
    name: input.name,
    fuseCount: input.fuseCount,
    boostedMachines: input.boostedMachines,
    contribution: input.contribution,
    productionRatio: input.productionRatio
  };
}
