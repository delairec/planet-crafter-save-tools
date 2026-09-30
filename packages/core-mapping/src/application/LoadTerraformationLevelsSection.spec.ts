import {UnreadableLine} from "../domain/save/SaveSectionLocation";
import {describe, expect, it, mock} from 'bun:test';
import {SAVE_CONTENT, stubSaveSectionsReader} from "../testing/stubSaveSectionsReader";
import {LoadTerraformationLevelsSection} from './LoadTerraformationLevelsSection';
import {TerraformationLevelsPresenterPort} from './ports/TerraformationLevelsPresenterPort';

function createPresenter(): TerraformationLevelsPresenterPort {
  return {displayTerraformationLevels: mock(), displaySaveWithUnreadableLines: mock()};
}

describe('LoadTerraformationLevelsSection', () => {
  it('should present all terraformation levels from the parsed save', async () => {
    // Arrange
    const presenter = createPresenter();
    const useCase = new LoadTerraformationLevelsSection(stubSaveSectionsReader(), presenter);

    // Act
    await useCase.execute({content: SAVE_CONTENT});

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

  describe('When the save has unreadable lines', () => {
    it('should display the unreadable lines instead of the terraformation levels', async () => {
      // Arrange
      const unreadableLines: UnreadableLine[] = [{section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{not valid json'}];
      const presenter = createPresenter();
      const useCase = new LoadTerraformationLevelsSection(stubSaveSectionsReader({unreadableLines}), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT});

      // Assert
      expect(presenter.displaySaveWithUnreadableLines).toHaveBeenCalledWith({unreadableLines: [{section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{not valid json'}]});
      expect(presenter.displayTerraformationLevels).not.toHaveBeenCalled();
    });
  });
});
