import {WorldObjectName} from './worldObjectNames';
import energyLevels from './energyLevels.json' with {type: 'json'};

type EnergyLevelsByWorldObjectName = Partial<Record<WorldObjectName, number>>;

function selectEnergyLevelsByRole(role: 'production' | 'consumption'): EnergyLevelsByWorldObjectName {
  return Object.fromEntries(
    energyLevels.filter((energyLevel) => energyLevel.role === role).map((energyLevel) => [energyLevel.worldObjectName, energyLevel.kilowatts])
  );
}

export const energyProductionLevelsByWorldObjectName = selectEnergyLevelsByRole('production');

export const energyConsumptionLevelsByWorldObjectName = selectEnergyLevelsByRole('consumption');
