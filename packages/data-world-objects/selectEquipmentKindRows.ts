import type {EquipmentKindRow} from './EquipmentKindRow';
import equipmentKinds from './equipmentKinds.json' with {type: 'json'};

export function selectEquipmentKindRows(): readonly EquipmentKindRow[] {
  return equipmentKinds;
}
