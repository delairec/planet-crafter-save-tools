import {UnreadableLine} from "./ports/SaveSectionLocation";
import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveSectionsMapperService} from "../testing/FakeSaveSectionsMapperService";
import {SAVE_CONTENT, stubSaveSectionsReader} from "../testing/stubSaveSectionsReader";
import {stubGameReleasesReader} from "../testing/stubGameReleasesReader";
import {SaveIdentityPresenterPort} from "./ports/SaveIdentityPresenterPort";
import {LoadSaveIdentity} from "./LoadSaveIdentity";
import {WORLD_OBJECTS_SECTION} from "../testing/saveSectionLocations";

function createPresenter(): SaveIdentityPresenterPort {
  return {displaySaveIdentity: mock(), displayUnconfiguredSaveIdentity: mock(), displaySaveWithUnreadableLines: mock()};
}

describe('LoadSaveIdentity', () => {
  it('should present the save identity', async () => {
    // Arrange
    const presenter = createPresenter();
    const useCase = new LoadSaveIdentity(stubSaveSectionsReader(), stubGameReleasesReader(), presenter);

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
    it('should present the current game release', async () => {
      // Arrange
      const saveSections = new FakeSaveSectionsMapperService();
      saveSections.getDeclaredVersion = () => undefined;
      const presenter = createPresenter();
      const useCase = new LoadSaveIdentity(stubSaveSectionsReader({saveSections}), stubGameReleasesReader(), presenter);

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
      const saveSections = new FakeSaveSectionsMapperService();
      saveSections.getSaveConfiguration = () => undefined;
      const presenter = createPresenter();
      const useCase = new LoadSaveIdentity(stubSaveSectionsReader({saveSections}), stubGameReleasesReader(), presenter);

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
      const unreadableLines: UnreadableLine[] = [{section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{not valid json'}];
      const presenter = createPresenter();
      const useCase = new LoadSaveIdentity(stubSaveSectionsReader({unreadableLines}), stubGameReleasesReader(), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT, fileName: 'Standard-1.json'});

      // Assert
      expect(presenter.displaySaveWithUnreadableLines).toHaveBeenCalledWith('Standard-1.json', [{section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{not valid json'}]);
      expect(presenter.displaySaveIdentity).not.toHaveBeenCalled();
    });
  });
});
