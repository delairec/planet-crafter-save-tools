import {describe, expect, it} from 'bun:test';
import {createPlanetWorldObjectsValueObject} from './PlanetWorldObjectsValueObject';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError';

describe('PlanetWorldObjectsValueObject', () => {
  it('should build a planet world objects value object from valid data', () => {
    // Arrange
    const input = {planetId: 1, planetName: 'Toxicity', placedWorldObjects: []};

    // Act
    const planet = createPlanetWorldObjectsValueObject(input);

    // Assert
    expect(planet).toEqual(input);
  });

  it('should reject a non-finite planet id', () => {
    // Arrange
    const input = {planetId: NaN, placedWorldObjects: []};

    // Act
    const buildPlanetWorldObjects = () => createPlanetWorldObjectsValueObject(input);

    // Assert
    expect(buildPlanetWorldObjects).toThrow(InvalidSaveDataError);
  });
});
