import {describe, expect, it} from 'bun:test';
import {resolvePlanetName} from './resolvePlanetName';

const NO_NAME_OF_NUMERIC_ID = undefined;

describe('resolvePlanetName', () => {
  describe('When the planet numeric id has a name in the planet names table (Rule EN-PLANET-3)', () => {
    it('should return that name without looking at the world object names', () => {
      // Arrange
      const nameOfNumericId = 'Prime';
      const noWorldObjectNamesOnPlanet: string[] = [];
      const noTerraformedPlanetNames: string[] = [];

      // Act
      const planetName = resolvePlanetName(nameOfNumericId, noWorldObjectNamesOnPlanet, noTerraformedPlanetNames);

      // Assert
      expect(planetName).toBe('Prime');
    });
  });

  describe('When the planet numeric id has no name in the planet names table and exactly one known planet name appears in a world object name (Rule EN-PLANET-2)', () => {
    it('should return that planet name', () => {
      // Arrange
      const worldObjectNamesHintingAtHumble = ['Seed7Humble', 'EnergyGenerator1'];
      const terraformedPlanetNames = ['Humble', 'Aqualis'];

      // Act
      const planetName = resolvePlanetName(NO_NAME_OF_NUMERIC_ID, worldObjectNamesHintingAtHumble, terraformedPlanetNames);

      // Assert
      expect(planetName).toBe('Humble');
    });
  });

  describe('When the planet numeric id has no name in the planet names table and no known planet name appears in a world object name', () => {
    it('should not resolve any planet name', () => {
      // Arrange
      const worldObjectNamesWithoutPlanetHint = ['EnergyGenerator1'];
      const terraformedPlanetNames = ['Humble', 'Aqualis'];

      // Act
      const planetName = resolvePlanetName(NO_NAME_OF_NUMERIC_ID, worldObjectNamesWithoutPlanetHint, terraformedPlanetNames);

      // Assert
      expect(planetName).toBeUndefined();
    });
  });

  describe('When the planet numeric id has no name in the planet names table and several known planet names appear in the world object names', () => {
    it('should not resolve any planet name, the hint being ambiguous', () => {
      // Arrange
      const worldObjectNamesHintingAtTwoPlanets = ['Seed7Humble', 'Seed7Aqualis'];
      const terraformedPlanetNames = ['Humble', 'Aqualis'];

      // Act
      const planetName = resolvePlanetName(NO_NAME_OF_NUMERIC_ID, worldObjectNamesHintingAtTwoPlanets, terraformedPlanetNames);

      // Assert
      expect(planetName).toBeUndefined();
    });
  });
});
