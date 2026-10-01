import {describe, expect, it} from 'bun:test';
import {MergeResultPresenter} from './MergeResultPresenter';
import type {ValidationIssueResponse} from '../../save/application/responses/ValidationIssueResponse';
import type {SaveWarningResponse} from "../../save/application/responses/SaveWarningResponse";
import {MergeResultViewModel} from './viewModels/MergeResultViewModel';
import type {MergeWarningResponse} from '../application/responses/MergeWarningResponse';
import {SaveValidationMessageViewModel} from '../../save/presentation/viewModels/SaveValidationMessageViewModel';

const noErrorsFromSaveB: ValidationIssueResponse[] = [];
const noErrorsFromTheMerge: ValidationIssueResponse[] = [];
const noMergeWarnings: MergeWarningResponse[] = [];
const noWarningsFromSaveA: SaveWarningResponse[] = [];
const noWarningsFromSaveB: SaveWarningResponse[] = [];

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
        legacyFormatCouldBeKept: false,
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
        mergeWarnings: [],
        legacyFormatCouldBeKept: false,
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
        legacyFormatCouldBeKept: false,
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

  describe('When presenting a merge success across two save formats', () => {
    it('should translate the merge warnings into user messages', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentMergeSucceeded({
        fileName: 'merged.json',
        content: 'merged content',
        mergeErrors: noErrorsFromTheMerge,
        mergeWarnings: [
          {code: 'merged-save-format', formatRelease: '2.004'},
          {code: 'merged-save-section-dropped', section: 'terrainLayers'}
        ],
        legacyFormatCouldBeKept: true,
        saveAWarnings: noWarningsFromSaveA,
        saveBWarnings: noWarningsFromSaveB
      });

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.mergeWarnings).toEqual([
        {message: 'The two saves carry different formats; the merged save is written in the format of release 2.004.', location: null},
        {message: 'Writing that format dropped the Terrain layers section.', location: null}
      ]);
    });

    it('should tell the consumer that the legacy format could have been kept', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentMergeSucceeded({
        fileName: 'merged.json',
        content: 'merged content',
        mergeErrors: noErrorsFromTheMerge,
        mergeWarnings: [{code: 'merged-save-format', formatRelease: '2.004'}],
        legacyFormatCouldBeKept: true,
        saveAWarnings: noWarningsFromSaveA,
        saveBWarnings: noWarningsFromSaveB
      });

      // Assert
      expect(presenter.viewModel.legacyFormatCouldBeKept).toBe(true);
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
        mergeErrors: [{code: 'missing-field', section: {name: 'players', index: 77}, entryIndex: 0, fieldPath: '', missingFieldName: 'name'}],
        mergeWarnings: noMergeWarnings,
        legacyFormatCouldBeKept: false,
        saveAWarnings: noWarningsFromSaveA,
        saveBWarnings: noWarningsFromSaveB
      });

      // Assert
      expect<MergeResultViewModel>(presenter.viewModel).toEqual({
        status: 'success',
        fileName: 'merged.json',
        content: 'merged content',
        mergeFailureMessage: '',
        mergeErrors: [{message: "must have required property 'name'", location: 'Players (section 77), entry 0'}],
        mergeWarnings: [],
        legacyFormatCouldBeKept: false,
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
        mergeErrors: [{code: 'missing-field', section: {name: 'worldObjects', index: 78}, entryIndex: 12, fieldPath: '', missingFieldName: 'gId'}],
        mergeWarnings: noMergeWarnings,
        legacyFormatCouldBeKept: false,
        saveAWarnings: noWarningsFromSaveA,
        saveBWarnings: noWarningsFromSaveB
      });

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.mergeErrors).toEqual([{message: "must have required property 'gId'", location: 'World objects (section 78), entry 12'}]);
    });
  });

  describe('When presenting save files of which one has no JSON extension', () => {
    it('should report the extension error against the save at fault, as a validation error', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentSaveFilesInvalid({
        saveA: {hasJsonExtension: false},
        saveB: {hasJsonExtension: true, errors: noErrorsFromSaveB, warnings: noWarningsFromSaveB}
      });

      // Assert
      expect<MergeResultViewModel>(presenter.viewModel).toEqual({
        status: 'validationError',
        fileName: '',
        content: '',
        mergeFailureMessage: '',
        mergeErrors: [],
        mergeWarnings: [],
        legacyFormatCouldBeKept: false,
        saveAErrors: [{message: 'Invalid file extension: expected a .json file.', location: null}],
        saveBErrors: [],
        saveAWarnings: [],
        saveBWarnings: []
      });
    });
  });

  describe('When presenting invalid save files', () => {
    it('should update the view model with the validation error status and each save errors', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentSaveFilesInvalid({
        saveA: {
          hasJsonExtension: true,
          errors: [{code: 'invalid-json', section: {name: 'players', index: 77}, entryIndex: 0, line: 'contentA'}],
          warnings: noWarningsFromSaveA
        },
        saveB: {hasJsonExtension: true, errors: noErrorsFromSaveB, warnings: noWarningsFromSaveB}
      });

      // Assert
      expect<MergeResultViewModel>(presenter.viewModel).toEqual({
        status: 'validationError',
        fileName: '',
        content: '',
        mergeFailureMessage: '',
        mergeErrors: [],
        mergeWarnings: [],
        legacyFormatCouldBeKept: false,
        saveAErrors: [{message: 'Invalid JSON: contentA', location: 'Players (section 77), entry 0'}],
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
        saveA: {
          hasJsonExtension: true,
          errors: [{code: 'invalid-json', section: {name: 'players', index: 77}, entryIndex: 0, line: 'contentA'}],
          warnings: noWarningsFromSaveA
        },
        saveB: {hasJsonExtension: true, errors: noErrorsFromSaveB, warnings: [{code: 'legacy-save-format'}]}
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
        saveA: {
          hasJsonExtension: true,
          errors: [{code: 'invalid-json', section: {name: 'players', index: 77}, entryIndex: 1, line: '{ broken'}],
          warnings: noWarningsFromSaveA
        },
        saveB: {
          hasJsonExtension: true,
          errors: [{code: 'missing-field', section: {name: 'inventories', index: 79}, entryIndex: 0, fieldPath: '', missingFieldName: 'gId'}],
          warnings: noWarningsFromSaveB
        }
      });

      // Assert
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.saveAErrors).toEqual([{message: 'Invalid JSON: { broken', location: 'Players (section 77), entry 1'}]);
      expect<SaveValidationMessageViewModel[]>(presenter.viewModel.saveBErrors).toEqual([{message: "must have required property 'gId'", location: 'Inventories (section 79), entry 0'}]);
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
        mergeWarnings: [],
        legacyFormatCouldBeKept: false,
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

  describe('When presenting save files that designate no host or more than one', () => {
    it('should report the host count found against the save at fault, as a validation error', () => {
      // Arrange
      const presenter = new MergeResultPresenter();

      // Act
      presenter.presentSaveFilesWithoutUniqueHost({
        saveBWrongHostCount: 2,
        saveAWarnings: [{code: 'legacy-save-format'}],
        saveBWarnings: noWarningsFromSaveB
      });

      // Assert
      expect<MergeResultViewModel>(presenter.viewModel).toEqual({
        status: 'validationError',
        fileName: '',
        content: '',
        mergeFailureMessage: '',
        mergeErrors: [],
        mergeWarnings: [],
        legacyFormatCouldBeKept: false,
        saveAErrors: [],
        saveBErrors: [{message: 'Expected exactly one host player, found 2', location: null}],
        saveAWarnings: [{
          message: 'This save was written by version 1.618 of the game or earlier, in the format that still carries the Terrain Layers section.',
          location: null
        }],
        saveBWarnings: []
      });
    });
  });
});
