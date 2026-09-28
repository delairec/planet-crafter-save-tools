import {describe, expect, it} from 'bun:test';
import {createGlobalProgressionValueObject, GlobalProgressionValueObject} from './GlobalProgressionValueObject';

describe('GlobalProgressionValueObject', () => {
  it('should build a global progression value object from valid data', () => {
    // Arrange
    const input = {allTimeTerraTokens: 200_345};

    // Act
    const globalProgression = createGlobalProgressionValueObject(input);

    // Assert
    expect(globalProgression).toEqual(input);
  });

  it('should build a global progression value object carrying logisticsPaused', () => {
    // Arrange
    const input = {allTimeTerraTokens: 200_345, logisticsPaused: true};

    // Act
    const globalProgression = createGlobalProgressionValueObject(input);

    // Assert
    expect(globalProgression).toEqual(input);
  });

});
