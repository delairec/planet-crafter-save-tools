import {EnergyLevelValueObject} from "../../domain/valueObjects/EnergyLevelValueObject";
import {OptimizerRangesByWorldObjectName} from "../../domain/valueObjects/OptimizerRangeValueObject";
import {DivergingEnergyLevelsByRelease} from "../../domain/energyLevelsByWorldObjectName";

export interface EnergyLevelsReaderPort {
  readEnergyLevels(): readonly EnergyLevelValueObject[];

  readDivergingEnergyLevelsByRelease(): DivergingEnergyLevelsByRelease;

  readOptimizerRanges(): OptimizerRangesByWorldObjectName;
}
