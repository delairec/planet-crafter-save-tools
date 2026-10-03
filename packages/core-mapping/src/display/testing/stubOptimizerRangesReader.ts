import {OptimizerRangesReaderPort} from "../application/ports/OptimizerRangesReaderPort";
import {OPTIMIZER_RANGES} from "./energyLevelTablesFixture";

export function stubOptimizerRangesReader(): OptimizerRangesReaderPort {
  return {readOptimizerRanges: () => OPTIMIZER_RANGES};
}
