import {describe, expect, it} from 'bun:test';
import {TerraformationLevelEntity} from '../entities/TerraformationLevelEntity';
import {isFactorOfTheSystemTerraformationIndex} from './isFactorOfTheSystemTerraformationIndex';

function createTerraformationLevel(unitOxygenLevel: number): TerraformationLevelEntity {
  return new TerraformationLevelEntity({
    planetId: 'Prime',
    unitOxygenLevel,
    unitHeatLevel: 0,
    unitPressureLevel: 0,
    unitPlantsLevel: 0,
    unitInsectsLevel: 0,
    unitAnimalsLevel: 0,
    unitPurificationLevel: undefined
  });
}

describe('isFactorOfTheSystemTerraformationIndex', () => {
  it.each<{situation: string; unitOxygenLevel: number; isFactor: boolean}>([
    {situation: 'above zero', unitOxygenLevel: 7_500, isFactor: true},
    {situation: 'of zero', unitOxygenLevel: 0, isFactor: false}
  ])('should tell whether a planet whose Terraformation Index is $situation multiplies the SysTi', ({unitOxygenLevel, isFactor}) => {
    // Arrange
    const terraformationLevel = createTerraformationLevel(unitOxygenLevel);

    // Act
    const multipliesTheSystemTerraformationIndex = isFactorOfTheSystemTerraformationIndex(terraformationLevel);

    // Assert
    expect(multipliesTheSystemTerraformationIndex).toBe(isFactor);
  });
});
