import {describe, expect, it} from 'bun:test';
import {arrangeEquipmentSlots, EquipmentSlot} from './arrangeEquipmentSlots';
import {EquipmentKindValueObject} from '../valueObjects/EquipmentKindValueObject';

const EQUIPMENT_KINDS: EquipmentKindValueObject[] = [
  {worldObjectName: 'OxygenTank1', kind: 'Oxygen tank', icon: 'oxygen-tank'},
  {worldObjectName: 'OxygenTank5', kind: 'Oxygen tank', icon: 'oxygen-tank'},
  {worldObjectName: 'Backpack4', kind: 'Backpack', icon: 'backpack'},
  {worldObjectName: 'EquipmentIncrease1', kind: 'Exoskeleton', icon: 'exoskeleton'}
];

describe('arrangeEquipmentSlots', () => {
  it('should give one slot per equipment kind, in the order of the table, with the icon of the kind and the item worn of that kind', () => {
    // Act
    const slots = arrangeEquipmentSlots({equipment: ['Backpack4', 'OxygenTank5'], equipmentKinds: EQUIPMENT_KINDS});

    // Assert
    expect<EquipmentSlot[]>(slots).toEqual([
      {kind: 'Oxygen tank', icon: 'oxygen-tank', worldObjectName: 'OxygenTank5'},
      {kind: 'Backpack', icon: 'backpack', worldObjectName: 'Backpack4'},
      {kind: 'Exoskeleton', icon: 'exoskeleton'}
    ]);
  });

  describe('When the player wears nothing', () => {
    it('should give every slot empty', () => {
      // Arrange
      const noEquipment: string[] = [];

      // Act
      const slots = arrangeEquipmentSlots({equipment: noEquipment, equipmentKinds: EQUIPMENT_KINDS});

      // Assert
      expect<EquipmentSlot[]>(slots).toEqual([
        {kind: 'Oxygen tank', icon: 'oxygen-tank'},
        {kind: 'Backpack', icon: 'backpack'},
        {kind: 'Exoskeleton', icon: 'exoskeleton'}
      ]);
    });
  });

  describe('When the player wears an item the table names no kind for', () => {
    it('should add a slot of no kind holding that item after the slots of the table', () => {
      // Act
      const slots = arrangeEquipmentSlots({equipment: ['MultiToolLight9', 'Backpack4'], equipmentKinds: EQUIPMENT_KINDS});

      // Assert
      expect<EquipmentSlot[]>(slots).toEqual([
        {kind: 'Oxygen tank', icon: 'oxygen-tank'},
        {kind: 'Backpack', icon: 'backpack', worldObjectName: 'Backpack4'},
        {kind: 'Exoskeleton', icon: 'exoskeleton'},
        {worldObjectName: 'MultiToolLight9'}
      ]);
    });
  });
});
