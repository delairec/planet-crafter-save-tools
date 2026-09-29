import {describe, expect, it} from 'bun:test';
import {CURRENT_FORMAT_RELEASE, compareGameReleases, resolveGameRelease} from 'shared-save-processing/gameReleases.js';
import {EnergyLevelsReaderService} from './EnergyLevelsReaderService';
import {selectEnergyLevelsOfDeclaredVersion} from '../domain/energyLevelsByWorldObjectName';
import {WorldObjectName, worldObjectNamesByEnergyRole} from '../domain/worldObjectNames';

const ENERGY_LEVELS_READER = new EnergyLevelsReaderService();
const GAME_ENERGY_TABLES = {
  energyLevels: ENERGY_LEVELS_READER.readEnergyLevels(),
  divergingEnergyLevelsByRelease: ENERGY_LEVELS_READER.readDivergingEnergyLevelsByRelease()
};

describe('EnergyLevelsReaderService', () => {

  describe('When it reads the energy levels of the last release', () => {
    const energyLevels = selectEnergyLevelsOfDeclaredVersion('2.103', GAME_ENERGY_TABLES);
    const {producing, consuming, withoutKnownEnergyLevel} = worldObjectNamesByEnergyRole;

    it.each([...producing])('should read a strictly positive production level for %s', (name) => {
      // Act
      const kilowatts = energyLevels.production[name];

      // Assert
      expect(kilowatts).toBeGreaterThan(0);
    });

    it.each([...consuming])('should charge %s, a world object grouped as an energy consumer', (name) => {
      // Act
      const kilowatts = energyLevels.consumption[name];

      // Assert
      expect(kilowatts).toBeGreaterThan(0);
    });

    it('should neither produce nor charge for the world objects without a known energy level', () => {
      // Act
      const withALevel = withoutKnownEnergyLevel.filter((name) => (energyLevels.production[name] ?? 0) > 0 || (energyLevels.consumption[name] ?? 0) > 0);

      // Assert
      expect(withALevel).toEqual([]);
    });
  });

  describe('When it reads the diverging energy levels of the earlier releases', () => {
    const divergingEnergyLevelsByRelease = GAME_ENERGY_TABLES.divergingEnergyLevelsByRelease;
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
      const nextNewerEnergyLevels = selectEnergyLevelsOfDeclaredVersion(nextNewerRelease, GAME_ENERGY_TABLES);

      // Assert
      rows.forEach((row) => {
        const nextNewerKilowatts = nextNewerEnergyLevels[row.role as 'production' | 'consumption'][row.worldObjectName as WorldObjectName];
        expect(nextNewerKilowatts).toBeDefined();
        expect(nextNewerKilowatts).not.toBe(row.kilowatts);
      });
    });
  });
});
