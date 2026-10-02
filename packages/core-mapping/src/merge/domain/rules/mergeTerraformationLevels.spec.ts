import {describe, expect, it} from 'bun:test';
import {mergeTerraformationLevels} from './mergeTerraformationLevels';
import {createTerraformationLevelEntry} from '../../../save/testing/createSaveEntries';
import {TerraformationLevelEntry} from '../../../save/domain/save/TerraformationLevelEntry';

describe('Merge terraformation levels', () => {
  const purificationNotHandled = undefined;

  const toxicityLevelFromSaveA = createTerraformationLevelEntry({
    planetId: 'Toxicity',
    unitOxygenLevel: 100.0,
    unitHeatLevel: 200.0,
    unitPressureLevel: 300.0,
    unitPlantsLevel: 400.0,
    unitInsectsLevel: 500.0,
    unitAnimalsLevel: 600.0,
    unitPurificationLevel: 700.0
  });

  const primeLevelFromSaveB = createTerraformationLevelEntry({
    planetId: 'Prime',
    unitOxygenLevel: 10.0,
    unitHeatLevel: 20.0,
    unitPressureLevel: 30.0,
    unitPlantsLevel: 40.0,
    unitInsectsLevel: 50.0,
    unitAnimalsLevel: 60.0,
    unitPurificationLevel: purificationNotHandled
  });

  const aqualisLevelFromSaveB = createTerraformationLevelEntry({
    planetId: 'Aqualis',
    unitOxygenLevel: 1.0,
    unitHeatLevel: 2.0,
    unitPressureLevel: 3.0,
    unitPlantsLevel: 4.0,
    unitInsectsLevel: 5.0,
    unitAnimalsLevel: 6.0,
    unitPurificationLevel: purificationNotHandled
  });

  describe('When terraformation levels are unique', () => {
    it('should simply concat terraformation levels', () => {
      // Act
      const result = mergeTerraformationLevels([toxicityLevelFromSaveA], [primeLevelFromSaveB, aqualisLevelFromSaveB]);

      // Assert
      expect<TerraformationLevelEntry[]>(result).toEqual([toxicityLevelFromSaveA, primeLevelFromSaveB, aqualisLevelFromSaveB]);
    });
  });

  describe('When terraformation levels are duplicated', () => {
    it('should merge terraformation levels by taking max values', () => {
      // Arrange
      const toxicityLevelFromSaveB = createTerraformationLevelEntry({
        planetId: 'Toxicity',
        unitOxygenLevel: 101.0,
        unitHeatLevel: 20.0,
        unitPressureLevel: 301.0,
        unitPlantsLevel: 40.0,
        unitInsectsLevel: 501.0,
        unitAnimalsLevel: 60.0,
        unitPurificationLevel: 701.0
      });

      // Act
      const result = mergeTerraformationLevels([toxicityLevelFromSaveA], [toxicityLevelFromSaveB]);

      // Assert
      expect<TerraformationLevelEntry[]>(result).toEqual([
        {
          planetId: 'Toxicity',
          unitOxygenLevel: 101.0, unitHeatLevel: 200.0, unitPressureLevel: 301.0,
          unitPlantsLevel: 400.0, unitInsectsLevel: 501.0, unitAnimalsLevel: 600.0,
          unitPurificationLevel: 701.0
        }
      ]);
    });
  });

  describe('When neither save carries a purification level for a planet', () => {
    it('should leave the planet without a purification level', () => {
      // Arrange
      const primeLevelFromSaveA = createTerraformationLevelEntry({
        planetId: 'Prime',
        unitOxygenLevel: 10.0,
        unitHeatLevel: 20.0,
        unitPressureLevel: 30.0,
        unitPlantsLevel: 40.0,
        unitInsectsLevel: 50.0,
        unitAnimalsLevel: 60.0,
        unitPurificationLevel: purificationNotHandled
      });

      // Act
      const result = mergeTerraformationLevels([primeLevelFromSaveA], [primeLevelFromSaveB]);

      // Assert
      expect<TerraformationLevelEntry[]>(result).toEqual([
        {
          planetId: 'Prime',
          unitOxygenLevel: 10.0, unitHeatLevel: 20.0, unitPressureLevel: 30.0,
          unitPlantsLevel: 40.0, unitInsectsLevel: 50.0, unitAnimalsLevel: 60.0,
          unitPurificationLevel: undefined
        }
      ]);
    });
  });

  describe('When only one save carries a purification level for a planet', () => {
    it.each([
      {carriedBy: 'save B', purificationLevelA: purificationNotHandled, purificationLevelB: 500.0},
      {carriedBy: 'save A', purificationLevelA: 500.0, purificationLevelB: purificationNotHandled}
    ])('should take the purification level of the save that carries it, $carriedBy', ({purificationLevelA, purificationLevelB}) => {
      // Arrange
      const levelsFromSaveA = [createTerraformationLevelEntry({planetId: 'Toxicity', unitPurificationLevel: purificationLevelA})];
      const levelsFromSaveB = [createTerraformationLevelEntry({planetId: 'Toxicity', unitPurificationLevel: purificationLevelB})];

      // Act
      const result = mergeTerraformationLevels(levelsFromSaveA, levelsFromSaveB);

      // Assert
      expect(result[0]?.unitPurificationLevel).toBe(500.0);
    });
  });
});
