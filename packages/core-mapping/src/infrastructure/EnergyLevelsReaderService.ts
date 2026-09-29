import {selectEnergyLevelRows} from "data-energy/selectEnergyLevelRows";
import {selectEnergyLevelRowsByRelease} from "data-energy/selectEnergyLevelRowsByRelease";
import {selectOptimizerConfigRows} from "data-energy/selectOptimizerConfigRows";
import {EnergyLevelsReaderPort} from "../application/ports/EnergyLevelsReaderPort";
import {DivergingEnergyLevelsByRelease} from "../domain/energyLevelsByWorldObjectName";
import {EnergyLevelValueObject} from "../domain/valueObjects/EnergyLevelValueObject";
import {OptimizerRangesByWorldObjectName} from "../domain/valueObjects/OptimizerRangeValueObject";

export class EnergyLevelsReaderService implements EnergyLevelsReaderPort {
  readEnergyLevels(): readonly EnergyLevelValueObject[] {
    return selectEnergyLevelRows().map(mapEnergyLevelRow);
  }

  readDivergingEnergyLevelsByRelease(): DivergingEnergyLevelsByRelease {
    return Object.fromEntries(
      Object.entries(selectEnergyLevelRowsByRelease()).map(([release, rows]) => [release, rows.map(mapEnergyLevelRow)])
    );
  }

  readOptimizerRanges(): OptimizerRangesByWorldObjectName {
    return Object.fromEntries(
      selectOptimizerConfigRows().map((row) => [row.worldObjectName, {radius: row.radius, maxMachines: row.maxMachines}])
    );
  }
}

function mapEnergyLevelRow({worldObjectName, role, kilowatts}: EnergyLevelValueObject): EnergyLevelValueObject {
  return {worldObjectName, role, kilowatts};
}
