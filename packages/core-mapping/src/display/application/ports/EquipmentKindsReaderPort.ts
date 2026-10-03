import {EquipmentKindValueObject} from "../../domain/valueObjects/EquipmentKindValueObject";

export interface EquipmentKindsReaderPort {
  readEquipmentKinds(): readonly EquipmentKindValueObject[];
}
