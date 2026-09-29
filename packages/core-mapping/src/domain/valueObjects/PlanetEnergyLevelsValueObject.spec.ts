import {describe, expect, it} from 'bun:test';
import {createPlanetEnergyLevelsValueObject} from './PlanetEnergyLevelsValueObject';

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

});
