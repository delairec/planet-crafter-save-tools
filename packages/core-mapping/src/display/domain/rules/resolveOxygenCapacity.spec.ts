import {describe, expect, it} from 'bun:test';
import {resolveOxygenCapacity} from './resolveOxygenCapacity';
import {OxygenTankCapacitiesByWorldObjectName} from '../valueObjects/OxygenTankCapacityValueObject';

const OXYGEN_TANK_CAPACITIES: OxygenTankCapacitiesByWorldObjectName = {OxygenTank3: 280, OxygenTank5: 450};

describe('resolveOxygenCapacity', () => {
  it('should give the capacity of the oxygen tank the player wears', () => {
    // Act
    const capacity = resolveOxygenCapacity({equipment: ['Backpack4', 'OxygenTank5'], oxygenTankCapacities: OXYGEN_TANK_CAPACITIES});

    // Assert
    expect(capacity).toBe(450);
  });

  describe('When the player wears no oxygen tank', () => {
    it('should give the capacity of a player without a tank', () => {
      // Arrange
      const noEquipment: string[] = [];

      // Act
      const capacity = resolveOxygenCapacity({equipment: noEquipment, oxygenTankCapacities: OXYGEN_TANK_CAPACITIES});

      // Assert
      expect(capacity).toBe(100);
    });
  });

  describe('When the player wears an oxygen tank of unknown capacity', () => {
    it('should give the capacity of a player without a tank', () => {
      // Act
      const capacity = resolveOxygenCapacity({equipment: ['OxygenTank9'], oxygenTankCapacities: OXYGEN_TANK_CAPACITIES});

      // Assert
      expect(capacity).toBe(100);
    });
  });
});
