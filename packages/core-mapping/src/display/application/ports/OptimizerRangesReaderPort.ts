import {OptimizerRangesByWorldObjectName} from "../../domain/valueObjects/OptimizerRangeValueObject";

export interface OptimizerRangesReaderPort {
  readOptimizerRanges(): OptimizerRangesByWorldObjectName;
}
