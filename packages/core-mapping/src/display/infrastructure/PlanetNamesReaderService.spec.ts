import {describe, expect, it} from 'bun:test';
import {PlanetNamesReaderService} from './PlanetNamesReaderService';

describe('PlanetNamesReaderService', () => {
  describe('When the numeric id is one of the planet names table', () => {
    it('should find the name of that planet', () => {
      // Arrange
      const primeNumericId = -1140328421;

      // Act
      const planetName = new PlanetNamesReaderService().findPlanetNameOfNumericId(primeNumericId);

      // Assert
      expect(planetName).toBe('Prime');
    });
  });

  describe('When the numeric id is none of the planet names table', () => {
    it('should find no name', () => {
      // Arrange
      const unknownNumericId = 1;

      // Act
      const planetName = new PlanetNamesReaderService().findPlanetNameOfNumericId(unknownNumericId);

      // Assert
      expect(planetName).toBeUndefined();
    });
  });
});
