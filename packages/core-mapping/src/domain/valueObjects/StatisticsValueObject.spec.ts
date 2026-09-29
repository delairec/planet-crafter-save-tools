import {describe, expect, it} from 'bun:test';
import {createStatisticsValueObject} from './StatisticsValueObject';

describe('StatisticsValueObject', () => {
  it('should build a statistics value object from valid data', () => {
    // Arrange
    const input = {totalCraftedObjects: 10};

    // Act
    const statistics = createStatisticsValueObject(input);

    // Assert
    expect(statistics).toEqual(input);
  });

});
