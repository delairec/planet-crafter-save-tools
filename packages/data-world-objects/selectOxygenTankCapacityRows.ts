import type {OxygenTankCapacityRow} from './OxygenTankCapacityRow';
import oxygenTankCapacities from './oxygenTankCapacities.json' with {type: 'json'};

export function selectOxygenTankCapacityRows(): readonly OxygenTankCapacityRow[] {
  return oxygenTankCapacities;
}
