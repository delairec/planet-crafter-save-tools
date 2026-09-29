import {selectEnergyLevelRows} from "data-energy/selectEnergyLevelRows";
import {selectEnergyLevelRowsByRelease} from "data-energy/selectEnergyLevelRowsByRelease";
import {EnergyLevelsReaderPort} from "../application/ports/EnergyLevelsReaderPort";
import {DivergingEnergyLevelsByRelease} from "../domain/energyLevelsByWorldObjectName";
import {EnergyLevelValueObject} from "../domain/valueObjects/EnergyLevelValueObject";

export class EnergyLevelsReaderService implements EnergyLevelsReaderPort {
  readEnergyLevels(): readonly EnergyLevelValueObject[] {
    return selectEnergyLevelRows().map(mapEnergyLevelRow);
  }

  readDivergingEnergyLevelsByRelease(): DivergingEnergyLevelsByRelease {
    return Object.fromEntries(
      Object.entries(selectEnergyLevelRowsByRelease()).map(([release, rows]) => [release, rows.map(mapEnergyLevelRow)])
    );
  }
}

function mapEnergyLevelRow({worldObjectName, role, kilowatts}: EnergyLevelValueObject): EnergyLevelValueObject {
  return {worldObjectName, role, kilowatts};
}
