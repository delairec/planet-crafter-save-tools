import {describe, expect, it} from 'bun:test';
import {arrangeEquipmentSlots, EquipmentSlot} from './arrangeEquipmentSlots';
import {EquipmentKindValueObject} from '../valueObjects/EquipmentKindValueObject';

const EQUIPMENT_KINDS: EquipmentKindValueObject[] = [
  {worldObjectName: 'OxygenTank1', kind: 'Oxygen tank'},
  {worldObjectName: 'OxygenTank5', kind: 'Oxygen tank'},
  {worldObjectName: 'Backpack4', kind: 'Backpack'},
  {worldObjectName: 'EquipmentIncrease1', kind: 'Exoskeleton'}
];

describe('arrangeEquipmentSlots', () => {
  it('should give one slot per equipment kind, in the order of the table, holding the item worn of that kind', () => {
    // Act
    const slots = arrangeEquipmentSlots({equipment: ['Backpack4', 'OxygenTank5'], equipmentKinds: EQUIPMENT_KINDS});

    // Assert
    expect<EquipmentSlot[]>(slots).toEqual([
      {kind: 'Oxygen tank', worldObjectName: 'OxygenTank5'},
      {kind: 'Backpack', worldObjectName: 'Backpack4'},
      {kind: 'Exoskeleton'}
    ]);
  });

  describe('When the player wears nothing', () => {
    it('should give every slot empty', () => {
      // Arrange
      const noEquipment: string[] = [];

      // Act
      const slots = arrangeEquipmentSlots({equipment: noEquipment, equipmentKinds: EQUIPMENT_KINDS});

      // Assert
      expect<EquipmentSlot[]>(slots).toEqual([{kind: 'Oxygen tank'}, {kind: 'Backpack'}, {kind: 'Exoskeleton'}]);
    });
  });

  describe('When the player wears an item the table names no kind for', () => {
    it('should add a slot of no kind holding that item after the slots of the table', () => {
      // Act
      const slots = arrangeEquipmentSlots({equipment: ['MultiToolLight9', 'Backpack4'], equipmentKinds: EQUIPMENT_KINDS});

      // Assert
      expect<EquipmentSlot[]>(slots).toEqual([
        {kind: 'Oxygen tank'},
        {kind: 'Backpack', worldObjectName: 'Backpack4'},
        {kind: 'Exoskeleton'},
        {worldObjectName: 'MultiToolLight9'}
      ]);
    });
  });
});
