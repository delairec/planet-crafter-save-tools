import {describe, expect, it} from 'bun:test';
import {selectEnergyLevelsOfDeclaredVersion} from './energyLevelsByWorldObjectName';

describe('selectEnergyLevelsOfDeclaredVersion', () => {

  describe('When the declared version resolves to a release of the releases table', () => {
    it.each([
      ['1.618', '1.618', 2.6],
      ['2.008', '2.004', 2.6],
      ['2.100', '2.100', 0.6],
      ['2.103', '2.102', 0.6]
    ])('should take for a save declaring %s the values of %s, OreBreaker1 drawing %p kW', (declaredVersion, expectedRelease, expectedKilowatts) => {
      // Act
      const energyLevels = selectEnergyLevelsOfDeclaredVersion(declaredVersion);

      // Assert
      expect(energyLevels.release).toBe(expectedRelease);
      expect(energyLevels.consumption.OreBreaker1).toBe(expectedKilowatts);
    });
  });

  describe('When the declared version resolves to no release', () => {
    it('should take the values of the last release of the table', () => {
      // Arrange
      const unreadableVersion = 'unknown';

      // Act
      const energyLevels = selectEnergyLevelsOfDeclaredVersion(unreadableVersion);

      // Assert
      expect(energyLevels.release).toBe('2.102');
    });
  });

  describe('When the save declares no version', () => {
    it('should take the values of the last release of the table', () => {
      // Arrange
      const noDeclaredVersion = undefined;

      // Act
      const energyLevels = selectEnergyLevelsOfDeclaredVersion(noDeclaredVersion);

      // Assert
      expect(energyLevels.release).toBe('2.102');
    });
  });
});
