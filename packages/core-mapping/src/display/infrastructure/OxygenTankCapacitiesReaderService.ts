import {selectOxygenTankCapacityRows} from "data-world-objects/selectOxygenTankCapacityRows";
import {OxygenTankCapacitiesReaderPort} from "../application/ports/OxygenTankCapacitiesReaderPort";
import {OxygenTankCapacitiesByWorldObjectName} from "../domain/valueObjects/OxygenTankCapacityValueObject";

export class OxygenTankCapacitiesReaderService implements OxygenTankCapacitiesReaderPort {
  readOxygenTankCapacities(): OxygenTankCapacitiesByWorldObjectName {
    return Object.fromEntries(selectOxygenTankCapacityRows().map((row) => [row.worldObjectName, row.oxygenCapacity]));
  }
}
