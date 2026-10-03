import {selectEnergyLevelRows} from "data-energy/selectEnergyLevelRows";
import {selectEnergyLevelRowsByRelease} from "data-energy/selectEnergyLevelRowsByRelease";
import {EnergyLevelsReaderPort} from "../application/ports/EnergyLevelsReaderPort";
import {EnergyLevelTables} from "../domain/energyLevelsByWorldObjectName";
import {EnergyLevelValueObject} from "../domain/valueObjects/EnergyLevelValueObject";

export class EnergyLevelsReaderService implements EnergyLevelsReaderPort {
  readEnergyLevelTables(): EnergyLevelTables {
    return {
      energyLevels: selectEnergyLevelRows().map(mapEnergyLevelRow),
      divergingEnergyLevelsByRelease: Object.fromEntries(
        Object.entries(selectEnergyLevelRowsByRelease()).map(([release, rows]) => [release, rows.map(mapEnergyLevelRow)])
      )
    };
  }
}

function mapEnergyLevelRow({worldObjectName, role, kilowatts}: EnergyLevelValueObject): EnergyLevelValueObject {
  return {worldObjectName, role, kilowatts};
}
