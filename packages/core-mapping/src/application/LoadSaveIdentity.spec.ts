import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveSectionsReaderService} from "../testing/FakeSaveSectionsReaderService";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {SaveIdentityPresenterPort} from "./ports/SaveIdentityPresenterPort";
import {LoadSaveIdentity} from "./LoadSaveIdentity";
import {SaveIdentityValueObject} from "../domain/valueObjects/SaveIdentityValueObject";

function createPresenter(): SaveIdentityPresenterPort {
  return {displaySaveIdentity: mock(), displayUnconfiguredSaveIdentity: mock()};
}

describe('LoadSaveIdentity', () => {
  it('should present the save identity', async () => {
    // Arrange
    const presenter = createPresenter();
    const useCase = new LoadSaveIdentity(new FakeSaveSectionsReaderService(), presenter);

    // Act
    await useCase.execute({fileName: 'Standard-1.json'});

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
      const saveSectionsReader: SaveSectionsReaderPort = new FakeSaveSectionsReaderService();
      saveSectionsReader.getDeclaredVersion = () => undefined;
      const presenter = createPresenter();
      const useCase = new LoadSaveIdentity(saveSectionsReader, presenter);

      // Act
      await useCase.execute({fileName: 'Standard-1.json'});

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
      const saveSectionsReader: SaveSectionsReaderPort = new FakeSaveSectionsReaderService();
      saveSectionsReader.getSaveConfiguration = () => undefined;
      const presenter = createPresenter();
      const useCase = new LoadSaveIdentity(saveSectionsReader, presenter);

      // Act
      await useCase.execute({fileName: 'Standard-1.json'});

      // Assert
      expect(presenter.displayUnconfiguredSaveIdentity).toHaveBeenCalledWith('Standard-1.json');
      expect(presenter.displaySaveIdentity).not.toHaveBeenCalled();
    });
  });
});
