import {EnergyLevelTables} from "../../domain/energyLevelsByWorldObjectName";

export interface EnergyLevelsReaderPort {
  readEnergyLevelTables(): EnergyLevelTables;
}
