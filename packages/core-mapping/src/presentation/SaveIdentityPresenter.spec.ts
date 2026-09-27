import {describe, expect, it} from 'bun:test';
import {SaveIdentityPresenter} from "./SaveIdentityPresenter";
import {SaveIdentityViewModel} from "./viewModels/SaveIdentityViewModel";

describe('SaveIdentityPresenter', () => {
  it('should show the file name, the display name, the mode and the game release', () => {
    // Arrange
    const presenter = new SaveIdentityPresenter();

    // Act
    presenter.displaySaveIdentity({fileName: 'Standard-1.json', displayName: 'Fake Save', mode: 'Standard', gameRelease: '2.102'});

    // Assert
    expect(presenter.viewModel).toEqual<SaveIdentityViewModel>({
      fileName: 'Standard-1.json',
      displayName: 'Fake Save',
      mode: 'Standard',
      gameRelease: 'Game release 2.102'
    });
  });

  describe('When the save has no configuration entry', () => {
    it('should show the file name alone', () => {
      // Arrange
      const presenter = new SaveIdentityPresenter();

      // Act
      presenter.displayUnconfiguredSaveIdentity('Standard-1.json');

      // Assert
      expect(presenter.viewModel).toEqual<SaveIdentityViewModel>({fileName: 'Standard-1.json'});
    });
  });
});
