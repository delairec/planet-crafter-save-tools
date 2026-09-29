import {describe, expect, it} from 'bun:test';
import {EnergyLevelsReaderService} from './EnergyLevelsReaderService';
import {GameReleasesReaderService} from './GameReleasesReaderService';
import {compareGameReleases} from '../domain/rules/compareGameReleases';
import {resolveCurrentGameRelease} from '../domain/rules/resolveCurrentGameRelease';
import {resolveDeclaredGameRelease} from '../domain/rules/resolveDeclaredGameRelease';
import {selectEnergyLevelsOfDeclaredVersion} from '../domain/energyLevelsByWorldObjectName';
import {WorldObjectName, worldObjectNamesByEnergyRole} from '../domain/worldObjectNames';

const ENERGY_LEVELS_READER = new EnergyLevelsReaderService();
const GAME_ENERGY_TABLES = {
  energyLevels: ENERGY_LEVELS_READER.readEnergyLevels(),
  divergingEnergyLevelsByRelease: ENERGY_LEVELS_READER.readDivergingEnergyLevelsByRelease()
};
const GAME_RELEASES = new GameReleasesReaderService().readGameReleases();
const CURRENT_GAME_RELEASE = resolveCurrentGameRelease(GAME_RELEASES);

describe('EnergyLevelsReaderService', () => {

  describe('When it reads the energy levels of the last release', () => {
    const energyLevels = selectEnergyLevelsOfDeclaredVersion('2.103', GAME_ENERGY_TABLES, GAME_RELEASES);
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
      const resolvedRelease = resolveDeclaredGameRelease(release, GAME_RELEASES)?.release;

      // Assert
      expect(resolvedRelease).toBe(release);
      expect(compareGameReleases(release, CURRENT_GAME_RELEASE)).toBeLessThan(0);
    });

    it.each(releasesOfATable)('should hold in the table of %s only values that differ from the next newer table, or from the energy table for the newest', (release) => {
      // Arrange
      const rows = divergingEnergyLevelsByRelease[release] ?? [];
      const nextNewerRelease = releasesOfATable
        .filter((tableRelease) => compareGameReleases(tableRelease, release) > 0)
        .sort(compareGameReleases)[0] ?? CURRENT_GAME_RELEASE;

      // Act
      const nextNewerEnergyLevels = selectEnergyLevelsOfDeclaredVersion(nextNewerRelease, GAME_ENERGY_TABLES, GAME_RELEASES);

      // Assert
      rows.forEach((row) => {
        const nextNewerKilowatts = nextNewerEnergyLevels[row.role as 'production' | 'consumption'][row.worldObjectName as WorldObjectName];
        expect(nextNewerKilowatts).toBeDefined();
        expect(nextNewerKilowatts).not.toBe(row.kilowatts);
      });
    });
  });
});
