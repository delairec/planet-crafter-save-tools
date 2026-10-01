import {UnreadableLineResponse} from "../../save/application/responses/UnreadableLineResponse";
import {describe, expect, it} from 'bun:test';
import {SaveIdentityPresenter} from "./SaveIdentityPresenter";
import {SaveIdentityViewModel} from "./viewModels/SaveIdentityViewModel";

describe('SaveIdentityPresenter', () => {
  it('should show the save identity', () => {
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

  describe('When the save has unreadable lines', () => {
    it('should show the file name with the unreadable lines', () => {
      // Arrange
      const unreadableLines: UnreadableLineResponse[] = [{code: 'invalid-json', section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{not valid json'}];
      const presenter = new SaveIdentityPresenter();

      // Act
      presenter.displaySaveWithUnreadableLines('Standard-1.json', {unreadableLines});

      // Assert
      expect(presenter.viewModel).toEqual<SaveIdentityViewModel>({fileName: 'Standard-1.json', unreadableLines: [{message: 'Invalid JSON: {not valid json', location: 'World objects (section 78), entry 2'}]});
    });
  });
});
