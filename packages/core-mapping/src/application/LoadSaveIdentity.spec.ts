import {SaveParseError} from "shared-save-processing/gameDefinitions";
import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveSectionsService} from "../testing/FakeSaveSectionsService";
import {SAVE_CONTENT, stubSaveSectionsReader} from "../testing/stubSaveSectionsReader";
import {SaveIdentityPresenterPort} from "./ports/SaveIdentityPresenterPort";
import {LoadSaveIdentity} from "./LoadSaveIdentity";

function createPresenter(): SaveIdentityPresenterPort {
  return {displaySaveIdentity: mock(), displayUnconfiguredSaveIdentity: mock(), displaySaveWithUnreadableLines: mock()};
}

describe('LoadSaveIdentity', () => {
  it('should present the save identity', async () => {
    // Arrange
    const presenter = createPresenter();
    const useCase = new LoadSaveIdentity(stubSaveSectionsReader(), presenter);

    // Act
    await useCase.execute({content: SAVE_CONTENT, fileName: 'Standard-1.json'});

    // Assert
    expect(presenter.displaySaveIdentity).toHaveBeenCalledWith({
      fileName: 'Standard-1.json',
      displayName: 'Fake Save',
      mode: 'Standard',
      gameRelease: '2.004'
    });
  });

  describe('When the save declares no version', () => {
    it('should present the current format release', async () => {
      // Arrange
      const saveSections = new FakeSaveSectionsService();
      saveSections.getDeclaredVersion = () => undefined;
      const presenter = createPresenter();
      const useCase = new LoadSaveIdentity(stubSaveSectionsReader({saveSections}), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT, fileName: 'Standard-1.json'});

      // Assert
      expect(presenter.displaySaveIdentity).toHaveBeenCalledWith({
        fileName: 'Standard-1.json',
        displayName: 'Fake Save',
        mode: 'Standard',
        gameRelease: '2.102'
      });
    });
  });

  describe('When the save has no configuration entry', () => {
    it('should present the file name alone', async () => {
      // Arrange
      const saveSections = new FakeSaveSectionsService();
      saveSections.getSaveConfiguration = () => undefined;
      const presenter = createPresenter();
      const useCase = new LoadSaveIdentity(stubSaveSectionsReader({saveSections}), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT, fileName: 'Standard-1.json'});

      // Assert
      expect(presenter.displayUnconfiguredSaveIdentity).toHaveBeenCalledWith('Standard-1.json');
      expect(presenter.displaySaveIdentity).not.toHaveBeenCalled();
    });
  });

  describe('When the save has unreadable lines', () => {
    it('should display the file name with the unreadable lines instead of the save identity', async () => {
      // Arrange
      const unreadableLines: SaveParseError[] = [{detail: 'Entry is not valid JSON', section: 3, entryIndex: 2}];
      const presenter = createPresenter();
      const useCase = new LoadSaveIdentity(stubSaveSectionsReader({unreadableLines}), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT, fileName: 'Standard-1.json'});

      // Assert
      expect(presenter.displaySaveWithUnreadableLines).toHaveBeenCalledWith('Standard-1.json', [{detail: 'Entry is not valid JSON', section: 3, entryIndex: 2}]);
      expect(presenter.displaySaveIdentity).not.toHaveBeenCalled();
    });
  });
});
