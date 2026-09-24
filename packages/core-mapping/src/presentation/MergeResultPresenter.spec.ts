import {describe, expect, it} from 'bun:test';
import {MergeResultPresenter} from './MergeResultPresenter';
import {ValidationIssue, VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue';
import {SaveWarning} from 'shared-save-processing/gameDefinitions';
import {INVENTORIES_SECTION_INDEX, PLAYERS_SECTION_INDEX, WORLD_OBJECTS_SECTION_INDEX} from 'shared-save-processing/sectionIndexes.js';
import {MergeResultViewModel} from './viewModels/MergeResultViewModel';
import {MergeWarning} from '../application/responses/MergeWarning';
import {SaveValidationMessageViewModel} from './viewModels/SaveFileValidationViewModel';

const noErrorsFromSaveB: ValidationIssue[] = [];
const noErrorsFromTheMerge: ValidationIssue[] = [];
const noMergeWarnings: MergeWarning[] = [];
const noWarningsFromSaveA: SaveWarning[] = [];
const noWarningsFromSaveB: SaveWarning[] = [];

describe('MergeResultPresenter', () => {

  describe('When presenting a merge success', () => {
    it('should update the view model with the success status, file name and content', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentMergeSucceeded({
        fileName: 'merged.json',
        content: 'merged content',
        mergeErrors: noErrorsFromTheMerge,
        mergeWarnings: noMergeWarnings,
        saveAWarnings: noWarningsFromSaveA,
        saveBWarnings: noWarningsFromSaveB
      });

      // Assert
      expect<MergeResultViewModel>(presenter.viewModel).toEqual({
        status: 'success',
        fileName: 'merged.json',
        content: 'merged content',
        mergeFailureMessage: '',
        mergeErrors: [],
        saveAErrors: [],
        saveBErrors: [],
        saveAWarnings: [],
        saveBWarnings: []
      });
    });

    it('should translate the warning codes of each merged save into user messages', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentMergeSucceeded({
        fileName: 'merged.json',
        content: 'merged content',
        mergeErrors: noErrorsFromTheMerge,
        mergeWarnings: noMergeWarnings,
        saveAWarnings: [{code: 'legacy-save-format'}],
        saveBWarnings: noWarningsFromSaveB
      });

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.saveAWarnings).toEqual([{
        message: 'This save was written by version 1.618 of the game or earlier, in the format that still carries the Terrain Layers section.',
        location: null
      }]);
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.saveBWarnings).toEqual([]);
    });
  });

  describe('When presenting a merge success whose produced save does not pass validation', () => {
    it('should keep the success status, the file name and the content of the produced save', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentMergeSucceeded({
        fileName: 'merged.json',
        content: 'merged content',
        mergeErrors: [{code: VALIDATION_ISSUE_CODES.UNIQUE_HOST, detail: 'Expected exactly one host player, found 2', section: PLAYERS_SECTION_INDEX, formatRelease: '2.004'}],
        mergeWarnings: noMergeWarnings,
        saveAWarnings: noWarningsFromSaveA,
        saveBWarnings: noWarningsFromSaveB
      });

      // Assert
      expect<MergeResultViewModel>(presenter.viewModel).toEqual({
        status: 'success',
        fileName: 'merged.json',
        content: 'merged content',
        mergeFailureMessage: '',
        mergeErrors: [{message: 'Expected exactly one host player, found 2', location: 'Players (section 2)'}],
        saveAErrors: [],
        saveBErrors: [],
        saveAWarnings: [],
        saveBWarnings: []
      });
    });

    it('should tell where in the produced save each error was found', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentMergeSucceeded({
        fileName: 'merged.json',
        content: 'merged content',
        mergeErrors: [{code: VALIDATION_ISSUE_CODES.SCHEMA_VIOLATION, detail: 'must have required property gId', section: WORLD_OBJECTS_SECTION_INDEX, entryIndex: 12, formatRelease: '2.004'}],
        mergeWarnings: noMergeWarnings,
        saveAWarnings: noWarningsFromSaveA,
        saveBWarnings: noWarningsFromSaveB
      });

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.mergeErrors).toEqual([{message: 'must have required property gId', location: 'World objects (section 3), entry 12'}]);
    });
  });

  describe('When presenting invalid save files', () => {
    it('should update the view model with the validation error status and each save errors', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentSaveFilesInvalid({
        saveAErrors: [{code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: contentA'}],
        saveBErrors: noErrorsFromSaveB,
        saveAWarnings: noWarningsFromSaveA,
        saveBWarnings: noWarningsFromSaveB
      });

      // Assert
      expect<MergeResultViewModel>(presenter.viewModel).toEqual({
        status: 'validationError',
        fileName: '',
        content: '',
        mergeFailureMessage: '',
        mergeErrors: [],
        saveAErrors: [{message: 'Invalid JSON: contentA', location: null}],
        saveBErrors: [],
        saveAWarnings: [],
        saveBWarnings: []
      });
    });

    it('should keep the warnings alongside the errors', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentSaveFilesInvalid({
        saveAErrors: [{code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: contentA'}],
        saveBErrors: noErrorsFromSaveB,
        saveAWarnings: noWarningsFromSaveA,
        saveBWarnings: [{code: 'legacy-save-format'}]
      });

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.saveBWarnings).toEqual([{
        message: 'This save was written by version 1.618 of the game or earlier, in the format that still carries the Terrain Layers section.',
        location: null
      }]);
    });

    it('should tell where in each save the errors were found', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentSaveFilesInvalid({
        saveAErrors: [{code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: { broken', section: PLAYERS_SECTION_INDEX, entryIndex: 1, formatRelease: '2.004'}],
        saveBErrors: [{code: VALIDATION_ISSUE_CODES.SCHEMA_VIOLATION, detail: 'must have required property gId', section: INVENTORIES_SECTION_INDEX, entryIndex: 0, formatRelease: '2.004'}],
        saveAWarnings: noWarningsFromSaveA,
        saveBWarnings: noWarningsFromSaveB
      });

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.saveAErrors).toEqual([{message: 'Invalid JSON: { broken', location: 'Players (section 2), entry 1'}]);
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.saveBErrors).toEqual([{message: 'must have required property gId', location: 'Inventories (section 4), entry 0'}]);
    });
  });

  describe('When presenting a merge that produced no usable save', () => {
    it('should update the view model with the merge failure status and a sentence written for the user', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentMergedSaveUnusable();

      // Assert
      expect<MergeResultViewModel>(presenter.viewModel).toEqual({
        status: 'mergeFailed',
        fileName: '',
        content: '',
        mergeFailureMessage: 'The merge could not produce a usable save file. Both save files were left untouched.',
        mergeErrors: [],
        saveAErrors: [],
        saveBErrors: [],
        saveAWarnings: [],
        saveBWarnings: []
      });
    });

    it('should leave the errors of each input save empty, the merge failure being none of their doing', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentMergedSaveUnusable();

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.saveAErrors).toEqual([]);
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.saveBErrors).toEqual([]);
    });
  });
});
