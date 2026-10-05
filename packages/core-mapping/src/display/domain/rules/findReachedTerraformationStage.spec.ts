import {describe, expect, it} from 'bun:test';
import {TerraformationLevelEntity} from '../entities/TerraformationLevelEntity';
import {TerraformationStageValueObject} from '../valueObjects/TerraformationStageValueObject';
import {findReachedTerraformationStage} from './findReachedTerraformationStage';

const TERRAFORMATION_STAGES: readonly TerraformationStageValueObject[] = [
  {planetNames: ['Prime', 'Humble'], startTerraformationIndex: 175_000, stageName: 'Blue Sky'},
  {planetNames: ['Prime', 'Humble'], startTerraformationIndex: 0, stageName: 'Barren'},
  {planetNames: ['Prime', 'Humble'], startTerraformationIndex: 350_000, stageName: 'Clouds'},
  {planetNames: ['Toxicity'], startTerraformationIndex: 0, stageName: 'Toxic wasteland'},
  {planetNames: ['Toxicity'], startTerraformationIndex: 200_000, stageName: 'Toxic dust'}
];

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

describe('findReachedTerraformationStage', () => {
  it.each<[string, string, number, TerraformationStageValueObject]>([
    ['between the start of two stages', 'Prime', 174_999, {planetNames: ['Prime', 'Humble'], startTerraformationIndex: 0, stageName: 'Barren'}],
    ['at the start of a stage', 'Humble', 175_000, {planetNames: ['Prime', 'Humble'], startTerraformationIndex: 175_000, stageName: 'Blue Sky'}],
    ['beyond the start of the last stage', 'Prime', 9_000_000, {planetNames: ['Prime', 'Humble'], startTerraformationIndex: 350_000, stageName: 'Clouds'}],
    ['at a Terraformation Index another planet reaches a later stage with', 'Toxicity', 175_000, {planetNames: ['Toxicity'], startTerraformationIndex: 0, stageName: 'Toxic wasteland'}]
  ])('should find the latest stage of the planet started at or below its Terraformation Index, %s', (_indexCase, planetId, terraformationIndex, expectedStage) => {
    // Arrange
    const level = createTerraformationLevel(planetId, terraformationIndex);

    // Act
    const stage = findReachedTerraformationStage(level, TERRAFORMATION_STAGES);

    // Assert
    expect<TerraformationStageValueObject | undefined>(stage).toEqual(expectedStage);
  });

  describe('When no stage lists the planet', () => {
    it('should find no stage', () => {
      // Arrange
      const level = createTerraformationLevel('Unknown', 9_000_000);

      // Act
      const stage = findReachedTerraformationStage(level, TERRAFORMATION_STAGES);

      // Assert
      expect(stage).toBeUndefined();
    });
  });
});
