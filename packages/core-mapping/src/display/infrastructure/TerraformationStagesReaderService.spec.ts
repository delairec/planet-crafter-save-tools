import {describe, expect, it} from 'bun:test';
import {TerraformationStageValueObject} from '../domain/valueObjects/TerraformationStageValueObject';
import {TerraformationStagesReaderService} from './TerraformationStagesReaderService';

function findStageNamed(stageName: string): TerraformationStageValueObject | undefined {
  return new TerraformationStagesReaderService().readTerraformationStages().find((stage) => stage.stageName === stageName);
}

describe('TerraformationStagesReaderService', () => {
  it('should read a stage of the game with the planets that list it and the Terraformation Index it starts at', () => {
    // Act
    const stage = findStageNamed('Herds');

    // Assert
    expect<TerraformationStageValueObject | undefined>(stage).toEqual({planetNames: ['Skeo'], startTerraformationIndex: 2_500_000_000_000, stageName: 'Herds'});
  });

  it('should read no stage the game does not have', () => {
    // Act
    const stage = findStageNamed('Unknown');

    // Assert
    expect(stage).toBeUndefined();
  });
});
