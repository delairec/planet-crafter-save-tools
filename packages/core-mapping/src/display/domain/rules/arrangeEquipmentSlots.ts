import {EquipmentKindValueObject} from "../valueObjects/EquipmentKindValueObject";

export interface EquipmentSlotsQuery {
  readonly equipment: readonly string[];
  readonly equipmentKinds: readonly EquipmentKindValueObject[];
}

export interface EquipmentSlot {
  readonly kind?: string;
  readonly icon?: string;
  readonly worldObjectName?: string;
}

export function arrangeEquipmentSlots({equipment, equipmentKinds}: EquipmentSlotsQuery): EquipmentSlot[] {
  const kindByWorldObjectName = new Map(equipmentKinds.map(({worldObjectName, kind}) => [worldObjectName, kind]));
  const iconByKind = new Map<string, string>();
  for (const {kind, icon} of equipmentKinds) {
    if (!iconByKind.has(kind)) {
      iconByKind.set(kind, icon);
    }
  }
  const slots: EquipmentSlot[] = [...iconByKind].map(([kind, icon]) => {
    const worldObjectName = equipment.find((name) => kindByWorldObjectName.get(name) === kind);
    return worldObjectName === undefined ? {kind, icon} : {kind, icon, worldObjectName};
  });
  const unnamed = equipment.filter((name) => !kindByWorldObjectName.has(name)).map((worldObjectName) => ({worldObjectName}));
  return [...slots, ...unnamed];
}
