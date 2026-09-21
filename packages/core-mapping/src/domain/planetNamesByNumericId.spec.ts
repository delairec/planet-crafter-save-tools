import {describe, expect, it} from 'bun:test';
import {createWorldEvent} from 'shared-save-processing/testing/createSaveRecords.js';
import {planetNamesByNumericId} from './planetNamesByNumericId';

const SKEO_PLANET_NUMERIC_ID = -440810600;

describe('planetNamesByNumericId', () => {
  describe('When a world event carries the Skeo numeric id (Rule APlanetNumericIdIsStableAcrossSaves)', () => {
    it('should name the planet Skeo', () => {
      // Arrange
      const worldEventOnSkeo = createWorldEvent({planet: SKEO_PLANET_NUMERIC_ID});

      // Act
      const planetName = planetNamesByNumericId[worldEventOnSkeo.planet];

      // Assert
      expect(planetName).toBe('Skeo');
    });
  });
});
