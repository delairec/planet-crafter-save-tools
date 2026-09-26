import {describe, expect, it} from 'bun:test';
import {CURRENT_FORMAT_RELEASE, compareGameReleases, resolveGameRelease} from 'shared-save-processing/gameReleases.js';
import {divergingEnergyLevelsByRelease, selectEnergyLevelsOfDeclaredVersion} from './energyLevelsByWorldObjectName';
import {WorldObjectName} from './worldObjectNames';

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

describe('divergingEnergyLevelsByRelease', () => {
  const releasesOfATable = Object.keys(divergingEnergyLevelsByRelease);

  it.each(releasesOfATable)('should name by %s a release of the releases table earlier than the last one', (release) => {
    // Act
    const resolvedRelease = resolveGameRelease(release);

    // Assert
    expect(resolvedRelease).toBe(release);
    expect(compareGameReleases(release, CURRENT_FORMAT_RELEASE)).toBeLessThan(0);
  });

  it.each(releasesOfATable)('should hold in the table of %s only values that differ from the next newer table, or from the energy table for the newest', (release) => {
    // Arrange
    const rows = divergingEnergyLevelsByRelease[release] ?? [];
    const nextNewerRelease = releasesOfATable
      .filter((tableRelease) => compareGameReleases(tableRelease, release) > 0)
      .sort(compareGameReleases)[0] ?? CURRENT_FORMAT_RELEASE;

    // Act
    const nextNewerEnergyLevels = selectEnergyLevelsOfDeclaredVersion(nextNewerRelease);

    // Assert
    rows.forEach((row) => {
      const nextNewerKilowatts = nextNewerEnergyLevels[row.role as 'production' | 'consumption'][row.worldObjectName as WorldObjectName];
      expect(nextNewerKilowatts).toBeDefined();
      expect(nextNewerKilowatts).not.toBe(row.kilowatts);
    });
  });
});
