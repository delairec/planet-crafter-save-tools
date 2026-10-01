import {EnergyLevelValueObject} from "../../domain/valueObjects/EnergyLevelValueObject";
import {DivergingEnergyLevelsByRelease} from "../../domain/energyLevelsByWorldObjectName";

export interface EnergyLevelsReaderPort {
  readEnergyLevels(): readonly EnergyLevelValueObject[];

  readDivergingEnergyLevelsByRelease(): DivergingEnergyLevelsByRelease;
}
