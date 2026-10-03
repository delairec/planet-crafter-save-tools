import {EquipmentKindValueObject} from "../valueObjects/EquipmentKindValueObject";

export interface EquipmentSlotsQuery {
  readonly equipment: readonly string[];
  readonly equipmentKinds: readonly EquipmentKindValueObject[];
}

export interface EquipmentSlot {
  readonly kind?: string;
  readonly worldObjectName?: string;
}

export function arrangeEquipmentSlots({equipment, equipmentKinds}: EquipmentSlotsQuery): EquipmentSlot[] {
  const kindByWorldObjectName = new Map(equipmentKinds.map(({worldObjectName, kind}) => [worldObjectName, kind]));
  const kinds = [...new Set(equipmentKinds.map(({kind}) => kind))];
  const slots: EquipmentSlot[] = kinds.map((kind) => {
    const worldObjectName = equipment.find((name) => kindByWorldObjectName.get(name) === kind);
    return worldObjectName === undefined ? {kind} : {kind, worldObjectName};
  });
  const unnamed = equipment.filter((name) => !kindByWorldObjectName.has(name)).map((worldObjectName) => ({worldObjectName}));
  return [...slots, ...unnamed];
}
