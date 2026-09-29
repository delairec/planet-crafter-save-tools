import type {EnergyLevelRow} from './EnergyLevelRow';
import energyLevelsOf2004 from './energyLevelsByRelease/2.004.json' with {type: 'json'};

export function selectEnergyLevelRowsByRelease(): Readonly<Record<string, readonly EnergyLevelRow[]>> {
  return {
    '2.004': energyLevelsOf2004
  };
}
