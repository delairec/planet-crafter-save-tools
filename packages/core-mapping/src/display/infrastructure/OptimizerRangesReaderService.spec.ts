import {describe, expect, it} from 'bun:test';
import {OptimizerRangesReaderService} from './OptimizerRangesReaderService';
import {OptimizerRangeValueObject} from '../domain/valueObjects/OptimizerRangeValueObject';

describe('OptimizerRangesReaderService', () => {
  it('should read the radius and the machine capacity of a known optimizer', () => {
    // Act
    const range = new OptimizerRangesReaderService().readOptimizerRanges().Optimizer1;

    // Assert
    expect<OptimizerRangeValueObject | undefined>(range).toEqual({radius: 120, maxMachines: 5, fuseSlots: 1});
  });

  it('should read no range for a machine that is no optimizer', () => {
    // Act
    const range = new OptimizerRangesReaderService().readOptimizerRanges().Drill0;

    // Assert
    expect(range).toBeUndefined();
  });
});
