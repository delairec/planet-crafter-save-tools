import {UnreadableLine} from "../../save/domain/save/SaveSectionLocation";
import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveSectionsMapperService} from "../testing/FakeSaveSectionsMapperService";
import {SAVE_CONTENT, stubSaveSectionsReader} from "../testing/stubSaveSectionsReader";
import {stubGameReleasesReader} from "../../save/testing/stubGameReleasesReader";
import {WORLD_OBJECTS_SECTION} from "../../save/testing/saveSectionLocations";
import {createGlobalProgressionValueObject} from "../domain/valueObjects/GlobalProgressionValueObject";
import {SaveSectionsMapperPort} from "./ports/SaveSectionsMapperPort";
import {OverviewPagePresenterPort} from "./ports/OverviewPagePresenterPort";
import {LoadOverviewPage} from "./LoadOverviewPage";

function createPresenter(): OverviewPagePresenterPort {
  return {displayOverviewPage: mock(), displaySaveWithUnreadableLines: mock()};
}

function createUseCase(presenter: OverviewPagePresenterPort, saveSections: SaveSectionsMapperPort = new FakeSaveSectionsMapperService()): LoadOverviewPage {
  return new LoadOverviewPage(stubSaveSectionsReader({saveSections}), stubGameReleasesReader(), presenter);
}

const SAVE_FILE_SIZE = 2_540;

describe('LoadOverviewPage', () => {
  it('should present the identity of the save file and its progression', async () => {
    // Arrange
    const presenter = createPresenter();

    // Act
    await createUseCase(presenter).execute({content: SAVE_CONTENT, fileName: 'Standard-1.json', fileSize: SAVE_FILE_SIZE});

    // Assert
    expect(presenter.displayOverviewPage).toHaveBeenCalledWith({
      saveFile: {name: 'Standard-1.json', size: 2_540},
      saveConfiguration: {displayName: 'Fake Save', mode: 'Standard', gameRelease: '2.004'},
      progression: {allTimeTerraTokens: 1_234_567, totalCraftedObjects: 10, droneLogistics: undefined}
    });
  });

  describe('When the save says whether the drone logistics are paused', () => {
    it('should present the drone logistics with their effect on the player', async () => {
      // Arrange
      const saveSections = new FakeSaveSectionsMapperService();
      saveSections.getGlobalProgression = () => createGlobalProgressionValueObject({allTimeTerraTokens: 1_234_567, logisticsPaused: true});
      const presenter = createPresenter();

      // Act
      await createUseCase(presenter, saveSections).execute({content: SAVE_CONTENT, fileName: 'Standard-1.json', fileSize: SAVE_FILE_SIZE});

      // Assert
      expect(presenter.displayOverviewPage).toHaveBeenCalledWith({
        saveFile: {name: 'Standard-1.json', size: 2_540},
        saveConfiguration: {displayName: 'Fake Save', mode: 'Standard', gameRelease: '2.004'},
        progression: {allTimeTerraTokens: 1_234_567, totalCraftedObjects: 10, droneLogistics: {paused: true, effect: 'penalisesThePlayer'}}
      });
    });
  });

  describe('When the save has no statistics', () => {
    it('should present the progression without a count of crafted objects', async () => {
      // Arrange
      const saveSections = new FakeSaveSectionsMapperService();
      saveSections.getStatistics = () => undefined;
      const presenter = createPresenter();

      // Act
      await createUseCase(presenter, saveSections).execute({content: SAVE_CONTENT, fileName: 'Standard-1.json', fileSize: SAVE_FILE_SIZE});

      // Assert
      expect(presenter.displayOverviewPage).toHaveBeenCalledWith({
        saveFile: {name: 'Standard-1.json', size: 2_540},
        saveConfiguration: {displayName: 'Fake Save', mode: 'Standard', gameRelease: '2.004'},
        progression: {allTimeTerraTokens: 1_234_567, totalCraftedObjects: undefined, droneLogistics: undefined}
      });
    });
  });

  describe('When the save has no configuration entry', () => {
    it('should present the save file without a configuration', async () => {
      // Arrange
      const saveSections = new FakeSaveSectionsMapperService();
      saveSections.getSaveConfiguration = () => undefined;
      const presenter = createPresenter();

      // Act
      await createUseCase(presenter, saveSections).execute({content: SAVE_CONTENT, fileName: 'Standard-1.json', fileSize: SAVE_FILE_SIZE});

      // Assert
      expect(presenter.displayOverviewPage).toHaveBeenCalledWith({
        saveFile: {name: 'Standard-1.json', size: 2_540},
        saveConfiguration: undefined,
        progression: {allTimeTerraTokens: 1_234_567, totalCraftedObjects: 10, droneLogistics: undefined}
      });
    });
  });

  describe('When the save has unreadable lines', () => {
    it('should display the unreadable lines instead of the overview', async () => {
      // Arrange
      const unreadableLines: UnreadableLine[] = [{code: 'invalid-json', section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{not valid json'}];
      const presenter = createPresenter();
      const useCase = new LoadOverviewPage(stubSaveSectionsReader({unreadableLines}), stubGameReleasesReader(), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT, fileName: 'Standard-1.json', fileSize: SAVE_FILE_SIZE});

      // Assert
      expect(presenter.displaySaveWithUnreadableLines).toHaveBeenCalledWith({unreadableLines: [{code: 'invalid-json', section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{not valid json'}]});
      expect(presenter.displayOverviewPage).not.toHaveBeenCalled();
    });
  });
});
