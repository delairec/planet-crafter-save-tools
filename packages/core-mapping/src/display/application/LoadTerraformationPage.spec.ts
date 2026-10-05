import {describe, expect, it, mock} from 'bun:test';
import {UnreadableLine} from "../../save/domain/save/SaveSectionLocation";
import {WORLD_OBJECTS_SECTION} from "../../save/testing/saveSectionLocations";
import {SAVE_CONTENT, stubSaveSectionsReader} from "../testing/stubSaveSectionsReader";
import {FakeSaveSectionsMapperService} from "../testing/FakeSaveSectionsMapperService";
import {TerraformationLevelEntity} from "../domain/entities/TerraformationLevelEntity";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {TerraformationPagePresenterPort} from "./ports/TerraformationPagePresenterPort";
import {LoadTerraformationPage} from './LoadTerraformationPage';

class SaveSectionsWithAqualisAtZero extends FakeSaveSectionsMapperService {
  override getTerraformationLevels(): TerraformationLevelEntity[] {
    return [
      ...super.getTerraformationLevels(),
      new TerraformationLevelEntity({
        planetId: 'Aqualis',
        unitOxygenLevel: 0,
        unitHeatLevel: 0,
        unitPressureLevel: 0,
        unitPlantsLevel: 0,
        unitInsectsLevel: 0,
        unitAnimalsLevel: 0,
        unitPurificationLevel: undefined
      })
    ];
  }
}

function createPresenter(): TerraformationPagePresenterPort {
  return {displayTerraformationPage: mock(), displaySaveWithUnreadableLines: mock()};
}

function createUseCase(presenter: TerraformationPagePresenterPort, saveSectionsReader: SaveSectionsReaderPort = stubSaveSectionsReader()): LoadTerraformationPage {
  return new LoadTerraformationPage(saveSectionsReader, presenter);
}

describe('LoadTerraformationPage', () => {
  it('should present each planet with its terraformation levels and the SysTi it multiplies', async () => {
    // Arrange
    const presenter = createPresenter();

    // Act
    await createUseCase(presenter).execute({content: SAVE_CONTENT});

    // Assert
    expect(presenter.displayTerraformationPage).toHaveBeenCalledWith({
      planets: [{
        levels: {
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
        },
        systemTerraformationIndex: {index: 2_800, planetCount: 1}
      }]
    });
  });

  describe('When a planet has a Terraformation Index of zero', () => {
    it('should present that planet without the SysTi it does not multiply', async () => {
      // Arrange
      const presenter = createPresenter();

      // Act
      await createUseCase(presenter, stubSaveSectionsReader({saveSections: new SaveSectionsWithAqualisAtZero()})).execute({content: SAVE_CONTENT});

      // Assert
      expect(presenter.displayTerraformationPage).toHaveBeenCalledWith({
        planets: [
          {
            levels: {
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
            },
            systemTerraformationIndex: {index: 2_800, planetCount: 1}
          },
          {
            levels: {
              planetId: 'Aqualis',
              unitOxygenLevel: 0,
              unitHeatLevel: 0,
              unitPressureLevel: 0,
              unitPlantsLevel: 0,
              unitInsectsLevel: 0,
              unitAnimalsLevel: 0,
              unitPurificationLevel: undefined,
              terraformationIndex: 0,
              biomass: 0
            }
          }
        ]
      });
    });
  });

  describe('When the save has unreadable lines', () => {
    it('should display the unreadable lines instead of the terraformation page', async () => {
      // Arrange
      const unreadableLines: UnreadableLine[] = [{code: 'invalid-json', section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{not valid json'}];
      const presenter = createPresenter();

      // Act
      await createUseCase(presenter, stubSaveSectionsReader({unreadableLines})).execute({content: SAVE_CONTENT});

      // Assert
      expect(presenter.displaySaveWithUnreadableLines).toHaveBeenCalledWith({unreadableLines: [{code: 'invalid-json', section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{not valid json'}]});
      expect(presenter.displayTerraformationPage).not.toHaveBeenCalled();
    });
  });
});
