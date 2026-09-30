import {describe, expect, it} from 'bun:test';
import {SaveFileValidationPresenter} from './SaveFileValidationPresenter';
import {VALIDATION_ISSUE_CODES} from '../domain/validation/validationIssueCodes';
import type {SaveWarningResponse} from "../application/responses/SaveWarningResponse";
import {SaveFileValidationViewModel, SaveValidationMessageViewModel} from './viewModels/SaveFileValidationViewModel';

const noWarnings: SaveWarningResponse[] = [];

describe('SaveFileValidationPresenter', () => {

  describe('When presenting a valid save file', () => {
    it('should update the view model with the valid status and no error', () => {
      // Arrange
      const presenter = new SaveFileValidationPresenter();

      // Act
      presenter.presentValidSaveFile(noWarnings);

      // Assert
      expect<SaveFileValidationViewModel>(presenter.viewModel).toEqual({status: 'valid', errors: [], warnings: []});
    });

    it('should translate the warning codes into user messages', () => {
      // Arrange
      const presenter = new SaveFileValidationPresenter();

      // Act
      presenter.presentValidSaveFile([{code: 'legacy-save-format'}]);

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
      const presenter = new SaveFileValidationPresenter();

      // Act
      presenter.presentFileWithoutJsonExtension();

      // Assert
      expect<SaveFileValidationViewModel>(presenter.viewModel).toEqual({
        status: 'invalid',
        errors: [{message: 'Invalid file extension: expected a .json file.', location: null}],
        warnings: []
      });
    });
  });

  describe('When presenting an invalid save file', () => {
    it('should update the view model with the invalid status and the formatted errors', () => {
      // Arrange
      const presenter = new SaveFileValidationPresenter();

      // Act
      presenter.presentInvalidSaveFile({errors: [{code: VALIDATION_ISSUE_CODES.UNEXPECTED_SECTION_COUNT, foundSectionCount: 3, expectedSectionCounts: [11, 12]}], warnings: noWarnings});

      // Assert
      expect<SaveFileValidationViewModel>(presenter.viewModel).toEqual({
        status: 'invalid',
        errors: [{message: 'Expected 11 or 12 sections but found 3', location: null}],
        warnings: []
      });
    });

    it('should tell where in the save each error was found', () => {
      // Arrange
      const presenter = new SaveFileValidationPresenter();

      // Act
      presenter.presentInvalidSaveFile({errors: [{code: VALIDATION_ISSUE_CODES.INVALID_JSON, section: {name: 'globalMetadata', index: 0}, entryIndex: 3, line: '{'}], warnings: noWarnings});

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.errors).toEqual([{message: 'Invalid JSON: {', location: 'Global metadata (section 0), entry 3'}]);
    });

    it('should keep the warnings alongside the errors', () => {
      // Arrange
      const presenter = new SaveFileValidationPresenter();

      // Act
      presenter.presentInvalidSaveFile({errors: [{code: VALIDATION_ISSUE_CODES.INVALID_JSON, section: {name: 'globalMetadata', index: 0}, entryIndex: 3, line: '{'}], warnings: [{code: 'legacy-save-format'}]});

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.warnings).toEqual([{
        message: 'This save was written by version 1.618 of the game or earlier, in the format that still carries the Terrain Layers section.',
        location: null
      }]);
    });
  });

  describe('When presenting a save file with unreadable lines', () => {
    it('should update the view model with the invalid status and each unreadable line located', () => {
      // Arrange
      const presenter = new SaveFileValidationPresenter();

      // Act
      presenter.presentSaveFileWithUnreadableLines({unreadableLines: [{section: {name: 'globalMetadata', index: 0}, entryIndex: 0, line: '{'}], warnings: noWarnings});

      // Assert
      expect<SaveFileValidationViewModel>(presenter.viewModel).toEqual({
        status: 'invalid',
        errors: [{message: 'Invalid JSON: {', location: 'Global metadata (section 0), entry 0'}],
        warnings: []
      });
    });
  });

  describe('When presenting a save file that designates no host or more than one', () => {
    it('should update the view model with the invalid status and the host count found', () => {
      // Arrange
      const presenter = new SaveFileValidationPresenter();

      // Act
      presenter.presentSaveFileWithoutUniqueHost(0, noWarnings);

      // Assert
      expect<SaveFileValidationViewModel>(presenter.viewModel).toEqual({
        status: 'invalid',
        errors: [{message: 'Expected exactly one host player, found 0', location: null}],
        warnings: []
      });
    });
  });
});
