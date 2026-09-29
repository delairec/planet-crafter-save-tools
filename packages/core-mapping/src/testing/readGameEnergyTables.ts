import {EnergyLevelsReaderService} from "../infrastructure/EnergyLevelsReaderService";
import {EnergyLevelTables} from "../domain/energyLevelsByWorldObjectName";
import {OptimizerRangesByWorldObjectName} from "../domain/valueObjects/OptimizerRangeValueObject";

export interface GameEnergyTables extends EnergyLevelTables {
  readonly optimizerRanges: OptimizerRangesByWorldObjectName;
}

/** The energy tables of the game, read through the adapter the composition root wires, for the specs asserting the values the game shows. */
export function readGameEnergyTables(): GameEnergyTables {
  const energyLevelsReader = new EnergyLevelsReaderService();

  return {
    energyLevels: energyLevelsReader.readEnergyLevels(),
    divergingEnergyLevelsByRelease: energyLevelsReader.readDivergingEnergyLevelsByRelease(),
    optimizerRanges: energyLevelsReader.readOptimizerRanges()
  };
}
