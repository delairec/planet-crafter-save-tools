import type {EnergyLevelRow} from './EnergyLevelRow';
import energyLevels from './energyLevels.json' with {type: 'json'};

export function selectEnergyLevelRows(): readonly EnergyLevelRow[] {
  return energyLevels;
}
