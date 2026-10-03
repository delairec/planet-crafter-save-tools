import {describe, expect, it} from 'bun:test';
import {OxygenTankCapacitiesReaderService} from './OxygenTankCapacitiesReaderService';

describe('OxygenTankCapacitiesReaderService', () => {
  it('should read the oxygen capacity of a known oxygen tank', () => {
    // Act
    const capacity = new OxygenTankCapacitiesReaderService().readOxygenTankCapacities().OxygenTank3;

    // Assert
    expect(capacity).toBe(280);
  });

  it('should read no oxygen capacity for a world object that is no oxygen tank', () => {
    // Act
    const capacity = new OxygenTankCapacitiesReaderService().readOxygenTankCapacities().Backpack4;

    // Assert
    expect(capacity).toBeUndefined();
  });
});
