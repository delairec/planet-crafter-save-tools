import {describe, expect, it} from 'bun:test';
import {OptimizerResponse} from '../../application/responses/EnergyLevelsResponse';
import {OptimizerBoostSum, sumOptimizerBoost} from './sumOptimizerBoost';

describe('sumOptimizerBoost', () => {
  it('should add up the contributions of the optimizers and their shares of production', () => {
    // Arrange
    const optimizers: OptimizerResponse[] = [
      {name: 'Optimizer2', fuseCount: 1, fuseSlots: 4, boostedMachines: [{name: 'Generator01', quantity: 1}], contribution: 10, productionRatio: 0.25},
      {name: 'Optimizer2', fuseCount: 2, fuseSlots: 4, boostedMachines: [{name: 'Generator02', quantity: 1}], contribution: 30, productionRatio: 0.5}
    ];

    // Act
    const boost = sumOptimizerBoost(optimizers);

    // Assert
    expect<OptimizerBoostSum>(boost).toEqual({contribution: 40, productionRatio: 0.75});
  });

  describe('When the planet has no optimizer', () => {
    it('should name a boost of nothing, without a share', () => {
      // Arrange
      const noOptimizers: OptimizerResponse[] = [];

      // Act
      const boost = sumOptimizerBoost(noOptimizers);

      // Assert
      expect<OptimizerBoostSum>(boost).toEqual({contribution: 0, productionRatio: undefined});
    });
  });
});
