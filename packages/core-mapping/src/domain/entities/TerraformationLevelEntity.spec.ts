import {describe, expect, it} from 'bun:test';
import {TerraformationLevelEntity} from './TerraformationLevelEntity';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError';

describe('TerraformationLevelEntity', () => {
  it('should expose the unit levels it was built from', () => {
    // Arrange
    const input = {
      planetId: 'Toxicity',
      unitOxygenLevel: 100,
      unitHeatLevel: 200,
      unitPressureLevel: 300,
      unitPlantsLevel: 400,
      unitInsectsLevel: 500,
      unitAnimalsLevel: 600,
      unitPurificationLevel: 700
    };

    // Act
    const level = new TerraformationLevelEntity(input);

    // Assert
    expect(level.planetId).toBe('Toxicity');
    expect(level.unitOxygenLevel).toBe(100);
    expect(level.unitHeatLevel).toBe(200);
    expect(level.unitPressureLevel).toBe(300);
    expect(level.unitPlantsLevel).toBe(400);
    expect(level.unitInsectsLevel).toBe(500);
    expect(level.unitAnimalsLevel).toBe(600);
    expect(level.unitPurificationLevel).toBe(700);
  });

  it('should reject a non-finite unit level', () => {
    // Arrange
    const input = {
      planetId: 'Toxicity',
      unitOxygenLevel: NaN,
      unitHeatLevel: 200,
      unitPressureLevel: 300,
      unitPlantsLevel: 400,
      unitInsectsLevel: 500,
      unitAnimalsLevel: 600,
      unitPurificationLevel: 700
    };

    // Act
    const buildTerraformationLevel = () => new TerraformationLevelEntity(input);

    // Assert
    expect(buildTerraformationLevel).toThrow(InvalidSaveDataError);
  });

  describe('When summarized', () => {
    it('should sum plant, insect and animal levels into the biomass', () => {
      // Arrange
      const level = new TerraformationLevelEntity({
        planetId: 'Earth',
        unitOxygenLevel: 0,
        unitHeatLevel: 0,
        unitPressureLevel: 0,
        unitPurificationLevel: 0,
        unitPlantsLevel: 101_101,
        unitInsectsLevel: 112_112,
        unitAnimalsLevel: 131_131
      });

      // Act
      const {biomass} = level.summarize();

      // Assert
      expect(biomass).toBe(344_344);
    });

    it('should sum environmental levels and biomass into the terraformation index', () => {
      // Arrange
      const level = new TerraformationLevelEntity({
        planetId: 'Earth',
        unitOxygenLevel: 123_123,
        unitHeatLevel: 456_456,
        unitPressureLevel: 789_789,
        unitPurificationLevel: 415_415,
        unitPlantsLevel: 101_101,
        unitInsectsLevel: 112_112,
        unitAnimalsLevel: 131_131
      });

      // Act
      const {terraformationIndex} = level.summarize();

      // Assert
      expect(terraformationIndex).toBe(2_129_127);
    });

    it('should carry the unit levels it was built from into the summary', () => {
      // Arrange
      const level = new TerraformationLevelEntity({
        planetId: 'Toxicity',
        unitOxygenLevel: 100,
        unitHeatLevel: 200,
        unitPressureLevel: 300,
        unitPlantsLevel: 400,
        unitInsectsLevel: 500,
        unitAnimalsLevel: 600,
        unitPurificationLevel: 700
      });

      // Act
      const summary = level.summarize();

      // Assert
      expect(summary).toEqual({
        planetId: 'Toxicity',
        unitOxygenLevel: 100,
        unitHeatLevel: 200,
        unitPressureLevel: 300,
        unitPlantsLevel: 400,
        unitInsectsLevel: 500,
        unitAnimalsLevel: 600,
        unitPurificationLevel: 700,
        terraformationIndex: 2_800,
        biomass: 1_500
      });
    });
  });
});
