import {describe, expect, it, mock} from 'bun:test';
import {MergeSaveFiles} from './MergeSaveFiles';
import {SaveValidatorPort} from './ports/SaveValidatorPort';
import {SaveFilesMergerPort} from './ports/SaveFilesMergerPort';
import {MergeResultPresenterPort} from './ports/MergeResultPresenterPort';
import {VALIDATION_ISSUE_CODES} from './ports/ValidationIssue';
import {InvalidSaveDataError} from '../domain/errors/InvalidSaveDataError';

describe('MergeSaveFiles', () => {

  describe('When both saves are valid', () => {
    it('should present a success result with the merged file name and content', async () => {
      // Arrange
      const validator: SaveValidatorPort = {validate: mock(() => ({isValid: true, errors: [], warnings: []}))};
      const merger: SaveFilesMergerPort = {merge: mock(() => ({fileName: 'Save-A-Save-B-merged.json', content: 'merged content'}))};
      const presenter: MergeResultPresenterPort = {presentMergeSucceeded: mock(), presentSaveFilesInvalid: mock(), presentMergedSaveUnusable: mock()};
      const useCase = new MergeSaveFiles(validator, merger, presenter);

      // Act
      await useCase.execute({fileNameA: 'Save-A.json', contentA: 'contentA', fileNameB: 'Save-B.json', contentB: 'contentB'});

      // Assert
      expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith('Save-A-Save-B-merged.json', 'merged content', [], []);
    });
  });

  describe('When at least one save is invalid', () => {
    it('should present a validation error result without merging', async () => {
      // Arrange
      const invalidJsonError = {code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: contentA'};
      const validator: SaveValidatorPort = {
        validate: mock((fileName: string, content: string) => content === 'contentA'
          ? {isValid: false, errors: [invalidJsonError], warnings: []}
          : {isValid: true, errors: [], warnings: []})
      };
      const merger: SaveFilesMergerPort = {merge: mock()};
      const presenter: MergeResultPresenterPort = {presentMergeSucceeded: mock(), presentSaveFilesInvalid: mock(), presentMergedSaveUnusable: mock()};
      const useCase = new MergeSaveFiles(validator, merger, presenter);

      // Act
      await useCase.execute({fileNameA: 'Save-A.json', contentA: 'contentA', fileNameB: 'Save-B.json', contentB: 'contentB'});

      // Assert
      expect(merger.merge).not.toHaveBeenCalled();
      expect(presenter.presentSaveFilesInvalid).toHaveBeenCalledWith([invalidJsonError], [], [], []);
    });
  });

  describe('When a save file has an invalid extension', () => {
    it('should present a validation error result reported by the validator', async () => {
      // Arrange
      const invalidExtensionError = {code: VALIDATION_ISSUE_CODES.INVALID_EXTENSION, detail: 'Invalid file extension: expected a .json file.'};
      const validator: SaveValidatorPort = {
        validate: mock((fileName: string) => fileName === 'Save-A.txt'
          ? {isValid: false, errors: [invalidExtensionError], warnings: []}
          : {isValid: true, errors: [], warnings: []})
      };
      const merger: SaveFilesMergerPort = {merge: mock()};
      const presenter: MergeResultPresenterPort = {presentMergeSucceeded: mock(), presentSaveFilesInvalid: mock(), presentMergedSaveUnusable: mock()};
      const useCase = new MergeSaveFiles(validator, merger, presenter);

      // Act
      await useCase.execute({fileNameA: 'Save-A.txt', contentA: 'contentA', fileNameB: 'Save-B.json', contentB: 'contentB'});

      // Assert
      expect(validator.validate).toHaveBeenCalledTimes(2);
      expect(validator.validate).toHaveBeenCalledWith('Save-A.txt', 'contentA');
      expect(validator.validate).toHaveBeenCalledWith('Save-B.json', 'contentB');
      expect(merger.merge).not.toHaveBeenCalled();
      expect(presenter.presentSaveFilesInvalid).toHaveBeenCalledWith([invalidExtensionError], [], [], []);
    });
  });

  describe('When validation reports that a save had to be adapted', () => {
    it('should present the warnings of each save on a successful merge', () => {
      // Arrange
      const validator: SaveValidatorPort = {
        validate: mock((fileName: string, content: string) => content === 'contentA'
          ? {isValid: true, errors: [], warnings: ['legacy-save-format' as const]}
          : {isValid: true, errors: [], warnings: []})
      };
      const merger: SaveFilesMergerPort = {merge: mock(() => ({fileName: 'Save-A-Save-B-merged.json', content: 'merged content'}))};
      const presenter: MergeResultPresenterPort = {presentMergeSucceeded: mock(), presentSaveFilesInvalid: mock(), presentMergedSaveUnusable: mock()};
      const useCase = new MergeSaveFiles(validator, merger, presenter);

      // Act
      useCase.execute({fileNameA: 'Save-A.json', contentA: 'contentA', fileNameB: 'Save-B.json', contentB: 'contentB'});

      // Assert
      expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith('Save-A-Save-B-merged.json', 'merged content', ['legacy-save-format'], []);
    });

    it('should present the warnings of each save when the merge is rejected', () => {
      // Arrange
      const invalidJsonError = {code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: contentB'};
      const validator: SaveValidatorPort = {
        validate: mock((fileName: string, content: string) => content === 'contentA'
          ? {isValid: true, errors: [], warnings: ['legacy-save-format' as const]}
          : {isValid: false, errors: [invalidJsonError], warnings: []})
      };
      const merger: SaveFilesMergerPort = {merge: mock()};
      const presenter: MergeResultPresenterPort = {presentMergeSucceeded: mock(), presentSaveFilesInvalid: mock(), presentMergedSaveUnusable: mock()};
      const useCase = new MergeSaveFiles(validator, merger, presenter);

      // Act
      useCase.execute({fileNameA: 'Save-A.json', contentA: 'contentA', fileNameB: 'Save-B.json', contentB: 'contentB'});

      // Assert
      expect(presenter.presentSaveFilesInvalid).toHaveBeenCalledWith([], [invalidJsonError], ['legacy-save-format'], []);
    });
  });
  describe('When the merge produces a save that cannot be used', () => {
    it('should present the merged save as unusable instead of a success', async () => {
      // Arrange
      const validator: SaveValidatorPort = {validate: mock(() => ({isValid: true, errors: [], warnings: []}))};
      const merger: SaveFilesMergerPort = {
        merge: mock(() => {
          throw new InvalidSaveDataError('MergedSaveValueObject.content must be a non-empty string, received ');
        })
      };
      const presenter: MergeResultPresenterPort = {presentMergeSucceeded: mock(), presentSaveFilesInvalid: mock(), presentMergedSaveUnusable: mock()};
      const useCase = new MergeSaveFiles(validator, merger, presenter);

      // Act
      await useCase.execute({fileNameA: 'Save-A.json', contentA: 'contentA', fileNameB: 'Save-B.json', contentB: 'contentB'});

      // Assert
      expect(presenter.presentMergedSaveUnusable).toHaveBeenCalled();
      expect(presenter.presentMergeSucceeded).not.toHaveBeenCalled();
    });

    it('should not blame the input files, which validation has already accepted', async () => {
      // Arrange
      const validator: SaveValidatorPort = {validate: mock(() => ({isValid: true, errors: [], warnings: []}))};
      const merger: SaveFilesMergerPort = {
        merge: mock(() => {
          throw new InvalidSaveDataError('MergedSaveValueObject.content must be a non-empty string, received ');
        })
      };
      const presenter: MergeResultPresenterPort = {presentMergeSucceeded: mock(), presentSaveFilesInvalid: mock(), presentMergedSaveUnusable: mock()};
      const useCase = new MergeSaveFiles(validator, merger, presenter);

      // Act
      await useCase.execute({fileNameA: 'Save-A.json', contentA: 'contentA', fileNameB: 'Save-B.json', contentB: 'contentB'});

      // Assert
      expect(presenter.presentSaveFilesInvalid).not.toHaveBeenCalled();
    });
  });

  describe('When the merge fails on anything other than unusable save data', () => {
    it('should let the failure surface rather than turn it into a merge outcome', async () => {
      // Arrange
      const unreadableSaveContentError = new Error('Save file "Save-A.json" cannot be parsed: Invalid JSON: {not valid json');
      const validator: SaveValidatorPort = {validate: mock(() => ({isValid: true, errors: [], warnings: []}))};
      const merger: SaveFilesMergerPort = {
        merge: mock(() => {
          throw unreadableSaveContentError;
        })
      };
      const presenter: MergeResultPresenterPort = {presentMergeSucceeded: mock(), presentSaveFilesInvalid: mock(), presentMergedSaveUnusable: mock()};
      const useCase = new MergeSaveFiles(validator, merger, presenter);

      // Act
      const mergeSaveFiles = useCase.execute({fileNameA: 'Save-A.json', contentA: 'contentA', fileNameB: 'Save-B.json', contentB: 'contentB'});

      // Assert
      await expect(mergeSaveFiles).rejects.toThrow(unreadableSaveContentError);
      expect(presenter.presentMergedSaveUnusable).not.toHaveBeenCalled();
    });
  });
});
