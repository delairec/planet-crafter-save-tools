import {EnergyLevelTables} from "../domain/energyLevelsByWorldObjectName";
import {OptimizerRangesByWorldObjectName} from "../domain/valueObjects/OptimizerRangeValueObject";

export const ENERGY_LEVEL_TABLES: EnergyLevelTables = {
  energyLevels: [
    {worldObjectName: 'EnergyGenerator1', role: 'production', kilowatts: 1.2},
    {worldObjectName: 'WindTurbine1', role: 'production', kilowatts: 290},
    {worldObjectName: 'EnergyGenerator2', role: 'production', kilowatts: 6.5},
    {worldObjectName: 'EnergyGenerator3', role: 'production', kilowatts: 19.5},
    {worldObjectName: 'EnergyGenerator5', role: 'production', kilowatts: 331.5},
    {worldObjectName: 'EnergyGenerator6', role: 'production', kilowatts: 1485},
    {worldObjectName: 'Drill0', role: 'consumption', kilowatts: 0.5},
    {worldObjectName: 'Drill4', role: 'consumption', kilowatts: 375.5},
    {worldObjectName: 'Heater1', role: 'consumption', kilowatts: 1},
    {worldObjectName: 'OreBreaker1', role: 'consumption', kilowatts: 0.6},
    {worldObjectName: 'Optimizer1', role: 'consumption', kilowatts: 50},
    {worldObjectName: 'Optimizer2', role: 'consumption', kilowatts: 150},
    {worldObjectName: 'TreePlanter3', role: 'consumption', kilowatts: 85}
  ],
  divergingEnergyLevelsByRelease: {
    '2.004': [
      {worldObjectName: 'OreBreaker1', role: 'consumption', kilowatts: 2.6}
    ]
  }
};

export const OPTIMIZER_RANGES: OptimizerRangesByWorldObjectName = {
  Optimizer1: {radius: 120, maxMachines: 5},
  Optimizer2: {radius: 250, maxMachines: 8}
};
