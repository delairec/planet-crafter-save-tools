import {describe, expect, it} from 'bun:test';
import {createGlobalProgressionValueObject, GlobalProgressionValueObject} from './GlobalProgressionValueObject';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError';

describe('GlobalProgressionValueObject', () => {
  it('should build a global progression value object from valid data', () => {
    // Arrange
    const input = {allTimeTerraTokens: 200_345};

    // Act
    const globalProgression = createGlobalProgressionValueObject(input);

    // Assert
    expect(globalProgression).toEqual(input);
  });

  it('should reject a non-finite terra tokens count', () => {
    // Arrange
    const input = {allTimeTerraTokens: NaN};

    // Act
    const buildGlobalProgression = () => createGlobalProgressionValueObject(input);

    // Assert
    expect(buildGlobalProgression).toThrow(InvalidSaveDataError);
  });

  it('should build a global progression value object carrying logisticsPaused', () => {
    // Arrange
    const input = {allTimeTerraTokens: 200_345, logisticsPaused: true};

    // Act
    const globalProgression = createGlobalProgressionValueObject(input);

    // Assert
    expect(globalProgression).toEqual(input);
  });

  it('should reject a non-boolean logisticsPaused', () => {
    // Arrange
    const input: GlobalProgressionValueObject = {
      allTimeTerraTokens: 200_345,
      // @ts-expect-error a `logisticsPaused` field holding a string is the invalid save data under test
      logisticsPaused: 'true'
    };

    // Act
    const buildGlobalProgression = () => createGlobalProgressionValueObject(input);

    // Assert
    expect(buildGlobalProgression).toThrow(InvalidSaveDataError);
  });
});
