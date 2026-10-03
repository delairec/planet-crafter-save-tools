import {describe, expect, it} from 'bun:test';
import {TerraformationLevelEntity} from '../entities/TerraformationLevelEntity';
import {computeSystemTerraformationIndex, SystemTerraformationIndex} from './computeSystemTerraformationIndex';

function createTerraformationLevel(planetId: string, unitOxygenLevel: number): TerraformationLevelEntity {
  return new TerraformationLevelEntity({
    planetId,
    unitOxygenLevel,
    unitHeatLevel: 0,
    unitPressureLevel: 0,
    unitPlantsLevel: 0,
    unitInsectsLevel: 0,
    unitAnimalsLevel: 0,
    unitPurificationLevel: undefined
  });
}

describe('computeSystemTerraformationIndex', () => {
  it('should multiply the Terraformation Index of every planet of the save', () => {
    // Arrange
    const terraformationLevels = [
      createTerraformationLevel('Prime', 7_500),
      createTerraformationLevel('Humble', 20),
      createTerraformationLevel('Selenea', 3)
    ];

    // Act
    const systemTerraformationIndex = computeSystemTerraformationIndex(terraformationLevels);

    // Assert
    expect<SystemTerraformationIndex | undefined>(systemTerraformationIndex).toEqual({index: 450_000, planetCount: 3});
  });

  describe('When a planet has a Terraformation Index of zero', () => {
    it('should leave that planet out of the product and out of the count', () => {
      // Arrange
      const terraformationLevels = [
        createTerraformationLevel('Prime', 7_500),
        createTerraformationLevel('Aqualis', 0)
      ];

      // Act
      const systemTerraformationIndex = computeSystemTerraformationIndex(terraformationLevels);

      // Assert
      expect<SystemTerraformationIndex | undefined>(systemTerraformationIndex).toEqual({index: 7_500, planetCount: 1});
    });
  });

  describe('When no planet has a Terraformation Index above zero', () => {
    it.each<{situation: string; terraformationLevels: TerraformationLevelEntity[]}>([
      {situation: 'no terraformation level', terraformationLevels: []},
      {situation: 'only levels of zero', terraformationLevels: [createTerraformationLevel('Prime', 0)]}
    ])('should compute no SysTi for a save with $situation', ({terraformationLevels}) => {
      // Act
      const systemTerraformationIndex = computeSystemTerraformationIndex(terraformationLevels);

      // Assert
      expect<SystemTerraformationIndex | undefined>(systemTerraformationIndex).toBeUndefined();
    });
  });
});
