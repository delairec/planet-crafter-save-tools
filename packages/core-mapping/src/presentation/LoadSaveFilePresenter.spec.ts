import {describe, expect, it} from 'bun:test';
import {LoadSaveFilePresenter} from './LoadSaveFilePresenter';
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue';
import {SaveWarning} from 'shared-save-processing/gameDefinitions';
import {PLAYERS_SECTION_INDEX, WORLD_OBJECTS_SECTION_INDEX} from 'shared-save-processing/sectionIndexes.js';
import {LoadSaveFileViewModel} from './viewModels/LoadSaveFileViewModel';
import {SaveValidationMessageViewModel} from './viewModels/SaveFileValidationViewModel';

const noWarnings: SaveWarning[] = [];

describe('LoadSaveFilePresenter', () => {

  describe('When presenting a loaded save file', () => {
    it('should update the view model with the valid status and no error', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentLoadedSaveFile(noWarnings);

      // Assert
      expect<LoadSaveFileViewModel>(presenter.viewModel).toEqual({status: 'valid', errors: [], warnings: []});
    });

    it('should translate the warning codes into user messages', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentLoadedSaveFile([{code: 'legacy-save-format'}]);

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
      presenter.presentSaveFileWithUnreadableLines([{section: {name: 'worldObjects', index: WORLD_OBJECTS_SECTION_INDEX}, entryIndex: 2, line: '{'}], noWarnings);

      // Assert
      expect<LoadSaveFileViewModel>(presenter.viewModel).toEqual({
        status: 'invalid',
        errors: [{message: 'Invalid JSON: {', location: 'World objects (section 3), entry 2'}],
        warnings: []
      });
    });

    it('should keep the warnings alongside the unreadable lines', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentSaveFileWithUnreadableLines([{section: {name: 'worldObjects', index: WORLD_OBJECTS_SECTION_INDEX}, entryIndex: 2, line: '{'}], [{code: 'legacy-save-format'}]);

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.warnings).toEqual([{
        message: 'This save was written by version 1.618 of the game or earlier, in the format that still carries the Terrain Layers section.',
        location: null
      }]);
    });
  });

  describe('When presenting an invalid save file', () => {
    it('should update the view model with the invalid status and the formatted errors', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentInvalidSaveFile([{code: VALIDATION_ISSUE_CODES.INVALID_EXTENSION}], noWarnings);

      // Assert
      expect<LoadSaveFileViewModel>(presenter.viewModel).toEqual({
        status: 'invalid',
        errors: [{message: 'Invalid file extension: expected a .json file.', location: null}],
        warnings: []
      });
    });

    it('should keep the warnings alongside the errors', () => {
      // Arrange
      const presenter = new LoadSaveFilePresenter();

      // Act
      presenter.presentInvalidSaveFile([{code: VALIDATION_ISSUE_CODES.INVALID_JSON, section: {name: 'worldObjects', index: WORLD_OBJECTS_SECTION_INDEX}, entryIndex: 2, line: '{'}], [{code: 'legacy-save-format'}]);

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
      presenter.presentInvalidSaveFile([{code: VALIDATION_ISSUE_CODES.INVALID_JSON, section: {name: 'players', index: PLAYERS_SECTION_INDEX}, entryIndex: 1, line: '{'}], noWarnings);

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.errors).toEqual([{message: 'Invalid JSON: {', location: 'Players (section 2), entry 1'}]);
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
