import {describe, expect, it} from 'bun:test';
import {createPlanetWorldObjectsValueObject} from './PlanetWorldObjectsValueObject';

describe('PlanetWorldObjectsValueObject', () => {
  it('should build a planet world objects value object from valid data', () => {
    // Arrange
    const input = {planetId: 1, planetName: 'Toxicity', placedWorldObjects: []};

    // Act
    const planet = createPlanetWorldObjectsValueObject(input);

    // Assert
    expect(planet).toEqual(input);
  });

});
