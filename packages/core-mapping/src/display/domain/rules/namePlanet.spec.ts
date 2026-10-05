import {describe, expect, it} from 'bun:test';
import {namePlanet} from './namePlanet';
import {PlacedWorldObjectEntity} from '../entities/PlacedWorldObjectEntity';
import {PlanetWorldObjectsValueObject} from '../valueObjects/PlanetWorldObjectsValueObject';

const SEED = new PlacedWorldObjectEntity({id: '1', name: 'Seed7Humble' as const, position: [0, 0, 0], planetId: 1});

describe('namePlanet', () => {
  describe('When a known planet name appears in a world object placed on the planet', () => {
    it('should give the planet that name, its placed world objects unchanged', () => {
      // Arrange
      const unnamedPlanet: PlanetWorldObjectsValueObject = {planetId: 1, placedWorldObjects: [SEED]};
      const noNameOfNumericId = undefined;
      const knownPlanetNames = ['Humble', 'Aqualis'];

      // Act
      const planet = namePlanet(unnamedPlanet, noNameOfNumericId, knownPlanetNames);

      // Assert
      expect(planet).toEqual({planetId: 1, planetName: 'Humble', placedWorldObjects: [SEED]});
    });
  });
});
