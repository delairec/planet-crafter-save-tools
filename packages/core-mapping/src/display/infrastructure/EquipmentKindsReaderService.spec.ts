import {describe, expect, it} from 'bun:test';
import {EquipmentKindsReaderService} from './EquipmentKindsReaderService';

function findEquipmentKind(worldObjectName: string): string | undefined {
  return new EquipmentKindsReaderService().readEquipmentKinds().find((equipmentKind) => equipmentKind.worldObjectName === worldObjectName)?.kind;
}

describe('EquipmentKindsReaderService', () => {
  it('should read the equipment kind of a known wearable world object', () => {
    // Act
    const kind = findEquipmentKind('Backpack4');

    // Assert
    expect(kind).toBe('Backpack');
  });

  it('should read no equipment kind for a world object that is not worn', () => {
    // Act
    const kind = findEquipmentKind('Iron');

    // Assert
    expect(kind).toBeUndefined();
  });
});
