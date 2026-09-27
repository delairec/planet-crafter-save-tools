import {describe, expect, it} from 'bun:test';
import {
  assertArray,
  assertBoolean,
  assertFiniteNumber,
  assertNonEmptyString,
  assertOptionalBoolean,
  assertOptionalFiniteNumber,
  assertOptionalString,
  assertString
} from './assertions';
import {InvalidSaveDataError} from './InvalidSaveDataError';

describe('assertFiniteNumber', () => {
  it('should return a finite number unchanged', () => {
    // Arrange
    const age = 42;

    // Act
    const value = assertFiniteNumber(age, 'PlayerEntity.age');

    // Assert
    expect(value).toBe(42);
  });

  describe('When the value is not a finite number', () => {
    it.each([
      {situation: 'a value that is not a number', value: 'ten', expectedMessage: 'PlayerEntity.age must be a finite number, received ten'},
      {situation: 'NaN', value: NaN, expectedMessage: 'PlayerEntity.age must be a finite number, received NaN'},
      {situation: 'Infinity', value: Infinity, expectedMessage: 'PlayerEntity.age must be a finite number, received Infinity'}
    ])('should reject $situation, naming the field', ({value, expectedMessage}) => {
      // Act
      const assertAge = () => assertFiniteNumber(value, 'PlayerEntity.age');

      // Assert
      expect(assertAge).toThrow(new InvalidSaveDataError(expectedMessage));
    });
  });
});

describe('assertOptionalFiniteNumber', () => {
  it('should return undefined when the value is undefined', () => {
    // Arrange
    const noAge = undefined;

    // Act
    const value = assertOptionalFiniteNumber(noAge, 'PlayerEntity.age');

    // Assert
    expect(value).toBeUndefined();
  });

  it('should return a finite number unchanged when defined', () => {
    // Arrange
    const age = 42;

    // Act
    const value = assertOptionalFiniteNumber(age, 'PlayerEntity.age');

    // Assert
    expect(value).toBe(42);
  });

  it('should reject a defined value that is not a finite number, naming the field', () => {
    // Arrange
    const nonFiniteAge = NaN;

    // Act
    const assertAge = () => assertOptionalFiniteNumber(nonFiniteAge, 'PlayerEntity.age');

    // Assert
    expect(assertAge).toThrow(new InvalidSaveDataError('PlayerEntity.age must be a finite number, received NaN'));
  });
});

describe('assertNonEmptyString', () => {
  it('should return a non-empty string unchanged', () => {
    // Act
    const value = assertNonEmptyString('Nikowa', 'PlayerEntity.name');

    // Assert
    expect(value).toBe('Nikowa');
  });

  describe('When the value is not a non-empty string', () => {
    it.each([
      {situation: 'a value that is not a string', value: 42, expectedMessage: 'PlayerEntity.name must be a non-empty string, received 42'},
      {situation: 'an empty string', value: '', expectedMessage: 'PlayerEntity.name must be a non-empty string, received '}
    ])('should reject $situation, naming the field', ({value, expectedMessage}) => {
      // Act
      const assertName = () => assertNonEmptyString(value, 'PlayerEntity.name');

      // Assert
      expect(assertName).toThrow(new InvalidSaveDataError(expectedMessage));
    });
  });
});

describe('assertString', () => {
  it('should return a string unchanged, empty included', () => {
    // Act
    const value = assertString('', 'InventoryEntity.label');

    // Assert
    expect(value).toBe('');
  });

  describe('When the value is not a string', () => {
    it.each([
      {situation: 'a value that is not a string', value: 42, expectedMessage: 'InventoryEntity.label must be a string, received 42'},
      {situation: 'a boolean', value: true, expectedMessage: 'InventoryEntity.label must be a string, received true'}
    ])('should reject $situation, naming the field', ({value, expectedMessage}) => {
      // Act
      const assertLabel = () => assertString(value, 'InventoryEntity.label');

      // Assert
      expect(assertLabel).toThrow(new InvalidSaveDataError(expectedMessage));
    });
  });
});

describe('assertBoolean', () => {
  it('should return a boolean unchanged', () => {
    // Arrange
    const isHost = true;

    // Act
    const value = assertBoolean(isHost, 'PlayerEntity.isHost');

    // Assert
    expect(value).toBe(true);
  });

  describe('When the value is not a boolean', () => {
    it.each([
      {situation: 'a string', value: 'true', expectedMessage: 'PlayerEntity.isHost must be a boolean, received true'},
      {situation: 'a value that is not a boolean', value: 1, expectedMessage: 'PlayerEntity.isHost must be a boolean, received 1'}
    ])('should reject $situation, naming the field', ({value, expectedMessage}) => {
      // Act
      const assertIsHost = () => assertBoolean(value, 'PlayerEntity.isHost');

      // Assert
      expect(assertIsHost).toThrow(new InvalidSaveDataError(expectedMessage));
    });
  });
});

describe('assertOptionalString', () => {
  it('should return undefined when the value is undefined', () => {
    // Arrange
    const noPlanetId = undefined;

    // Act
    const value = assertOptionalString(noPlanetId, 'PlayerEntity.planetId');

    // Assert
    expect(value).toBeUndefined();
  });

  it('should return a string unchanged when defined', () => {
    // Act
    const value = assertOptionalString('Toxicity', 'PlayerEntity.planetId');

    // Assert
    expect(value).toBe('Toxicity');
  });

  it('should reject a defined value that is not a string, naming the field', () => {
    // Arrange
    const nonStringPlanetId = 42;

    // Act
    const assertPlanetId = () => assertOptionalString(nonStringPlanetId, 'PlayerEntity.planetId');

    // Assert
    expect(assertPlanetId).toThrow(new InvalidSaveDataError('PlayerEntity.planetId must be a string, received 42'));
  });
});

describe('assertOptionalBoolean', () => {
  it('should return undefined when the value is undefined', () => {
    // Arrange
    const noIsHost = undefined;

    // Act
    const value = assertOptionalBoolean(noIsHost, 'PlayerEntity.isHost');

    // Assert
    expect(value).toBeUndefined();
  });

  it('should return a boolean unchanged when defined', () => {
    // Arrange
    const isHost = false;

    // Act
    const value = assertOptionalBoolean(isHost, 'PlayerEntity.isHost');

    // Assert
    expect(value).toBe(false);
  });

  it('should reject a defined value that is not a boolean, naming the field', () => {
    // Arrange
    const nonBooleanIsHost = 'false';

    // Act
    const assertIsHost = () => assertOptionalBoolean(nonBooleanIsHost, 'PlayerEntity.isHost');

    // Assert
    expect(assertIsHost).toThrow(new InvalidSaveDataError('PlayerEntity.isHost must be a boolean, received false'));
  });
});

describe('assertArray', () => {
  it('should return an array unchanged', () => {
    // Arrange
    const worldObjectIds = ['1', '2'];

    // Act
    const value = assertArray<string>(worldObjectIds, 'InventoryEntity.worldObjectIds');

    // Assert
    expect(value).toBe(worldObjectIds);
  });

  it('should reject a value that is not an array, naming the field', () => {
    // Arrange
    const nonArrayWorldObjectIds = 'not-an-array';

    // Act
    const assertWorldObjectIds = () => assertArray(nonArrayWorldObjectIds, 'InventoryEntity.worldObjectIds');

    // Assert
    expect(assertWorldObjectIds).toThrow(new InvalidSaveDataError('InventoryEntity.worldObjectIds must be an array, received not-an-array'));
  });
});
