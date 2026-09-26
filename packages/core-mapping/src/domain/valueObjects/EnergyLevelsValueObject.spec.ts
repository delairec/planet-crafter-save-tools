import {describe, expect, it} from 'bun:test';
import {createEnergyLevelsValueObject, EnergyLevelsValueObject} from './EnergyLevelsValueObject';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError';

describe('EnergyLevelsValueObject', () => {
  it('should build an energy levels value object from valid data', () => {
    // Arrange
    const input = {gameRelease: '2.102', powerConsumptionModifier: 1.5, planets: []};

    // Act
    const energyLevels = createEnergyLevelsValueObject(input);

    // Assert
    expect(energyLevels).toEqual(input);
  });

  it('should reject a non-array planets field', () => {
    // Arrange
    const input: EnergyLevelsValueObject = {
      gameRelease: '2.102',
      powerConsumptionModifier: 1,
      // @ts-expect-error a `planets` field holding no array at all is the invalid save data under test
      planets: undefined
    };

    // Act
    const buildEnergyLevels = () => createEnergyLevelsValueObject(input);

    // Assert
    expect(buildEnergyLevels).toThrow(InvalidSaveDataError);
  });

  it('should reject a non-finite power consumption modifier', () => {
    // Arrange
    const input: EnergyLevelsValueObject = {gameRelease: '2.102', powerConsumptionModifier: NaN, planets: []};

    // Act
    const buildEnergyLevels = () => createEnergyLevelsValueObject(input);

    // Assert
    expect(buildEnergyLevels).toThrow(InvalidSaveDataError);
  });
});
