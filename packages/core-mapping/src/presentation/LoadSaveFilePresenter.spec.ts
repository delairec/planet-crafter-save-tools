import {describe, expect, it} from 'bun:test';
import {LoadSaveFilePresenter} from './LoadSaveFilePresenter';
import type {SaveWarningResponse} from "../application/responses/SaveWarningResponse";
import {LoadSaveFileViewModel} from './viewModels/LoadSaveFileViewModel';
import {SaveValidationMessageViewModel} from './viewModels/SaveFileValidationViewModel';

const noWarnings: SaveWarningResponse[] = [];

describe('LoadSaveFilePresenter', () => {

  describe('When presenting a valid save file', () => {
    it('should update the view model with the valid status and no error', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentValidSaveFile(noWarnings);

      // Assert
      expect<LoadSaveFileViewModel>(presenter.viewModel).toEqual({status: 'valid', errors: [], warnings: []});
    });

    it('should translate the warning codes into user messages', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentValidSaveFile([{code: 'legacy-save-format'}]);

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.warnings).toEqual([{
        message: 'This save was written by version 1.618 of the game or earlier, in the format that still carries the Terrain Layers section.',
        location: null
      }]);
    });
  });

  describe('When presenting a save file with unreadable lines', () => {
    it('should update the view model with the invalid status and the unreadable lines located', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentSaveFileWithUnreadableLines({unreadableLines: [{code: 'invalid-json', section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{'}], warnings: noWarnings});

      // Assert
      expect<LoadSaveFileViewModel>(presenter.viewModel).toEqual({
        status: 'invalid',
        errors: [{message: 'Invalid JSON: {', location: 'World objects (section 78), entry 2'}],
        warnings: []
      });
    });

    it('should keep the warnings alongside the unreadable lines', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentSaveFileWithUnreadableLines({unreadableLines: [{code: 'invalid-json', section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{'}], warnings: [{code: 'legacy-save-format'}]});

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.warnings).toEqual([{
        message: 'This save was written by version 1.618 of the game or earlier, in the format that still carries the Terrain Layers section.',
        location: null
      }]);
    });
  });

  describe('When presenting a file without a JSON extension', () => {
    it('should update the view model with the invalid status and the extension error', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentFileWithoutJsonExtension();

      // Assert
      expect<LoadSaveFileViewModel>(presenter.viewModel).toEqual({
        status: 'invalid',
        errors: [{message: 'Invalid file extension: expected a .json file.', location: null}],
        warnings: []
      });
    });
  });

  describe('When presenting an invalid save file', () => {
    it('should update the view model with the invalid status and the formatted errors', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentInvalidSaveFile({errors: [{code: 'unexpected-section-count', foundSectionCount: 3, expectedSectionCounts: [11, 12]}], warnings: noWarnings});

      // Assert
      expect<LoadSaveFileViewModel>(presenter.viewModel).toEqual({
        status: 'invalid',
        errors: [{message: 'Expected 11 or 12 sections but found 3', location: null}],
        warnings: []
      });
    });

    it('should keep the warnings alongside the errors', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentInvalidSaveFile({errors: [{code: 'invalid-json', section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{'}], warnings: [{code: 'legacy-save-format'}]});

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.warnings).toEqual([{
        message: 'This save was written by version 1.618 of the game or earlier, in the format that still carries the Terrain Layers section.',
        location: null
      }]);
    });

    it('should tell where in the save each error was found', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentInvalidSaveFile({errors: [{code: 'invalid-json', section: {name: 'players', index: 77}, entryIndex: 1, line: '{'}], warnings: noWarnings});

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.errors).toEqual([{message: 'Invalid JSON: {', location: 'Players (section 77), entry 1'}]);
    });
  });

  describe('When presenting a save file that designates no host or more than one', () => {
    it('should update the view model with the invalid status and the host count found', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentSaveFileWithoutUniqueHost(2, [{code: 'legacy-save-format'}]);

      // Assert
      expect<LoadSaveFileViewModel>(presenter.viewModel).toEqual({
        status: 'invalid',
        errors: [{message: 'Expected exactly one host player, found 2', location: null}],
        warnings: [{
          message: 'This save was written by version 1.618 of the game or earlier, in the format that still carries the Terrain Layers section.',
          location: null
        }]
      });
    });
  });
});
