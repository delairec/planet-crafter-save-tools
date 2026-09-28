import {describe, expect, it} from 'bun:test';
import {createOptimizerValueObject} from './OptimizerValueObject';

describe('OptimizerValueObject', () => {
  it('should build an optimizer value object from valid data', () => {
    // Arrange
    const input = {name: 'Optimizer1' as const, fuseCount: 2, boostedMachines: [], contribution: 150, productionRatio: 0.3};

    // Act
    const optimizer = createOptimizerValueObject(input);

    // Assert
    expect(optimizer).toEqual(input);
  });

});
