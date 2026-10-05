import {selectEquipmentKindRows} from "data-world-objects/selectEquipmentKindRows";
import {EquipmentKindsReaderPort} from "../application/ports/EquipmentKindsReaderPort";
import {EquipmentKindValueObject} from "../domain/valueObjects/EquipmentKindValueObject";

export class EquipmentKindsReaderService implements EquipmentKindsReaderPort {
  readEquipmentKinds(): readonly EquipmentKindValueObject[] {
    return selectEquipmentKindRows().map((row) => ({worldObjectName: row.worldObjectName, kind: row.kind, icon: row.icon}));
  }
}
