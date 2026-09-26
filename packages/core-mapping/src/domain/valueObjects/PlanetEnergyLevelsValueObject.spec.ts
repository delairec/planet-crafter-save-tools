import {describe, expect, it} from 'bun:test';
import {createPlanetEnergyLevelsValueObject} from './PlanetEnergyLevelsValueObject';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError';

describe('PlanetEnergyLevelsValueObject', () => {
  it('should build a planet energy levels value object from valid data', () => {
    // Arrange
    const input = {
      planetId: 1,
      planetName: 'Toxicity',
      production: 100,
      consumption: 40,
      available: 60,
      productionBreakdown: [],
      consumptionBreakdown: [],
      optimizers: []
    };

    // Act
    const planetEnergyLevels = createPlanetEnergyLevelsValueObject(input);

    // Assert
    expect(planetEnergyLevels).toEqual(input);
  });

  it('should reject a non-finite available level', () => {
    // Arrange
    const input = {
      planetId: 1,
      production: 100,
      consumption: 40,
      available: NaN,
      productionBreakdown: [],
      consumptionBreakdown: [],
      optimizers: []
    };

    // Act
    const buildPlanetEnergyLevels = () => createPlanetEnergyLevelsValueObject(input);

    // Assert
    expect(buildPlanetEnergyLevels).toThrow(InvalidSaveDataError);
  });

  it('should reject a planet name that is not text, naming the field', () => {
    // Arrange
    const input = {
      planetId: 1,
      planetName: 110910045,
      production: 100,
      consumption: 40,
      available: 60,
      productionBreakdown: [],
      consumptionBreakdown: [],
      optimizers: []
    };

    // Act
    // @ts-expect-error a planet name that is not text is the invalid input under test
    const buildPlanetEnergyLevels = () => createPlanetEnergyLevelsValueObject(input);

    // Assert
    expect(buildPlanetEnergyLevels).toThrow(new InvalidSaveDataError('PlanetEnergyLevelsValueObject.planetName must be a string, received 110910045'));
  });
});
