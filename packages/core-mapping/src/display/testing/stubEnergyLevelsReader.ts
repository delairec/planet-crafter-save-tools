import {EnergyLevelsReaderPort} from "../application/ports/EnergyLevelsReaderPort";
import {EnergyLevelTables} from "../domain/energyLevelsByWorldObjectName";

const ENERGY_LEVEL_TABLES: EnergyLevelTables = {
  energyLevels: [
    {worldObjectName: 'EnergyGenerator1', role: 'production', kilowatts: 1.2},
    {worldObjectName: 'EnergyGenerator6', role: 'production', kilowatts: 1_485},
    {worldObjectName: 'Drill4', role: 'consumption', kilowatts: 375.5}
  ],
  divergingEnergyLevelsByRelease: {}
};

export function stubEnergyLevelsReader(): EnergyLevelsReaderPort {
  return {readEnergyLevelTables: () => ENERGY_LEVEL_TABLES};
}
