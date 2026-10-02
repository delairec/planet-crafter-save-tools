import {OxygenTankCapacitiesByWorldObjectName} from "../../domain/valueObjects/OxygenTankCapacityValueObject";

export interface OxygenTankCapacitiesReaderPort {
  readOxygenTankCapacities(): OxygenTankCapacitiesByWorldObjectName;
}
