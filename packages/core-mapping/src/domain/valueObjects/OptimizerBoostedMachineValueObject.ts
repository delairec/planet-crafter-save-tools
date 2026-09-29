import {WorldObjectName} from "../worldObjectNames";

export interface OptimizerBoostedMachineValueObject {
  readonly name: WorldObjectName;
  readonly quantity: number;
}

export function createOptimizerBoostedMachineValueObject(input: OptimizerBoostedMachineValueObject): OptimizerBoostedMachineValueObject {
  return {
    name: input.name,
    quantity: input.quantity
  };
}
