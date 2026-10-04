import {describe, expect, it} from 'bun:test';
import {formatTerraformationFigures, FormattedTerraformationFigures} from "./formatTerraformationFigures";

const nbsp = ' ';

describe('formatTerraformationFigures', () => {
  it('should format the terraformation figures of a planet', () => {
    // Act
    const figures = formatTerraformationFigures({
      planetId: 'Prime',
      unitOxygenLevel: 123_123,
      unitHeatLevel: 456_456,
      unitPressureLevel: 789_789,
      unitPlantsLevel: 101_101,
      unitInsectsLevel: 112_112,
      unitAnimalsLevel: 131_131,
      unitPurificationLevel: 415_415,
      terraformationIndex: 2_129_127,
      biomass: 344_344
    });

    // Assert
    expect<FormattedTerraformationFigures>(figures).toEqual({
      terraformationIndex: `2.129${nbsp}MTi`,
      oxygen: `123.123${nbsp}ppt`,
      heat: `456.456${nbsp}nK`,
      pressure: `789.789${nbsp}µPa`,
      purification: `415.415${nbsp}kPu`,
      plants: `101.101${nbsp}kg`,
      insects: `112.112${nbsp}kg`,
      animals: `131.131${nbsp}kg`,
      biomass: `344.344${nbsp}kg`
    });
  });

  describe('When the planet does not handle purification', () => {
    it('should leave out the purification', () => {
      // Arrange
      const noPurificationLevel = undefined;

      // Act
      const figures = formatTerraformationFigures({
        planetId: 'Prime',
        unitOxygenLevel: 123_123,
        unitHeatLevel: 456_456,
        unitPressureLevel: 789_789,
        unitPlantsLevel: 101_101,
        unitInsectsLevel: 112_112,
        unitAnimalsLevel: 131_131,
        unitPurificationLevel: noPurificationLevel,
        terraformationIndex: 1_713_712,
        biomass: 344_344
      });

      // Assert
      expect<FormattedTerraformationFigures>(figures).toEqual({
        terraformationIndex: `1.714${nbsp}MTi`,
        oxygen: `123.123${nbsp}ppt`,
        heat: `456.456${nbsp}nK`,
        pressure: `789.789${nbsp}µPa`,
        plants: `101.101${nbsp}kg`,
        insects: `112.112${nbsp}kg`,
        animals: `131.131${nbsp}kg`,
        biomass: `344.344${nbsp}kg`
      });
    });
  });
});
