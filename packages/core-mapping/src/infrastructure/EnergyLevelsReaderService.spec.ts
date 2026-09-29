import {describe, expect, it} from 'bun:test';
import {CURRENT_FORMAT_RELEASE, compareGameReleases, resolveGameRelease} from 'shared-save-processing/gameReleases.js';
import {EnergyLevelsReaderService} from './EnergyLevelsReaderService';
import {selectEnergyLevelsOfDeclaredVersion} from '../domain/energyLevelsByWorldObjectName';
import {OptimizerRangeValueObject} from '../domain/valueObjects/OptimizerRangeValueObject';
import {WorldObjectName} from '../domain/worldObjectNames';
import {readGameEnergyTables} from '../testing/readGameEnergyTables';

const GAME_ENERGY_TABLES = readGameEnergyTables();

describe('EnergyLevelsReaderService', () => {

  describe('When it reads the range of an optimizer', () => {
    it('should read the radius and the machine capacity of a known optimizer', () => {
      // Act
      const range = new EnergyLevelsReaderService().readOptimizerRanges().Optimizer1;

      // Assert
      expect<OptimizerRangeValueObject | undefined>(range).toEqual({radius: 120, maxMachines: 5});
    });

    it('should read no range for a machine that is no optimizer', () => {
      // Act
      const range = new EnergyLevelsReaderService().readOptimizerRanges().Drill0;

      // Assert
      expect(range).toBeUndefined();
    });
  });

  describe('When it reads the diverging energy levels of the earlier releases', () => {
    const divergingEnergyLevelsByRelease = new EnergyLevelsReaderService().readDivergingEnergyLevelsByRelease();
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
