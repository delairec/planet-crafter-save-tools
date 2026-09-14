import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveSectionsReaderService} from "../testing/FakeSaveSectionsReaderService";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {LoadTerraformationLevelsSection} from './LoadTerraformationLevelsSection';

describe('LoadTerraformationLevelsSection', () => {
  it('should present all terraformation levels from the parsed save', async () => {
    // Arrange
    const saveSectionsReader: SaveSectionsReaderPort = new FakeSaveSectionsReaderService();
    const presenter = {displayTerraformationLevels: mock()};
    const useCase = new LoadTerraformationLevelsSection(saveSectionsReader, presenter);

    // Act
    await useCase.execute();

    // Assert
    expect(presenter.displayTerraformationLevels).toHaveBeenCalledTimes(1);
    expect(presenter.displayTerraformationLevels).toHaveBeenCalledWith([
      {
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
      }
    ]);
  });
});
