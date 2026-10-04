import {describe, expect, it} from 'bun:test';
import {identifyPlanet} from "./identifyPlanet";

describe('identifyPlanet', () => {
  it('should identify a named planet by its name', () => {
    // Act
    const planetIdentifier = identifyPlanet({planetId: -1140328421, planetName: 'Prime'});

    // Assert
    expect(planetIdentifier).toBe('Prime');
  });

  describe('When the planet has no name', () => {
    it.each<[string, number, string]>([
      ['a positive', 1, '1'],
      ['a negative', -1083271456, '-1083271456']
    ])('should identify it by %s numeric identifier written in decimal', (_signCase, planetId, expectedIdentifier) => {
      // Arrange
      const noPlanetName = undefined;

      // Act
      const planetIdentifier = identifyPlanet({planetId, planetName: noPlanetName});

      // Assert
      expect(planetIdentifier).toBe(expectedIdentifier);
    });
  });
});
