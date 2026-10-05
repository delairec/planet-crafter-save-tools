import {describe, expect, it} from 'bun:test';
import {EquipmentKindValueObject} from '../domain/valueObjects/EquipmentKindValueObject';
import {EquipmentKindsReaderService} from './EquipmentKindsReaderService';

function findEquipmentKind(worldObjectName: string): EquipmentKindValueObject | undefined {
  return new EquipmentKindsReaderService().readEquipmentKinds().find((equipmentKind) => equipmentKind.worldObjectName === worldObjectName);
}

describe('EquipmentKindsReaderService', () => {
  it('should read the equipment kind of a known wearable world object and the icon of that kind', () => {
    // Act
    const equipmentKind = findEquipmentKind('Backpack4');

    // Assert
    expect<EquipmentKindValueObject | undefined>(equipmentKind).toEqual({worldObjectName: 'Backpack4', kind: 'Backpack', icon: 'backpack'});
  });

  it('should read no equipment kind for a world object that is not worn', () => {
    // Act
    const equipmentKind = findEquipmentKind('Iron');

    // Assert
    expect(equipmentKind).toBeUndefined();
  });
});
