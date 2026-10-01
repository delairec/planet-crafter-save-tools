import {selectOptimizerConfigRows} from "data-world-objects/selectOptimizerConfigRows";
import {OptimizerRangesReaderPort} from "../application/ports/OptimizerRangesReaderPort";
import {OptimizerRangesByWorldObjectName} from "../domain/valueObjects/OptimizerRangeValueObject";

export class OptimizerRangesReaderService implements OptimizerRangesReaderPort {
  readOptimizerRanges(): OptimizerRangesByWorldObjectName {
    return Object.fromEntries(
      selectOptimizerConfigRows().map((row) => [row.worldObjectName, {radius: row.radius, maxMachines: row.maxMachines}])
    );
  }
}
