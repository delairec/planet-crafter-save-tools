import {describe, expect, it, mock} from 'bun:test';
import {MergeSaveFiles} from './MergeSaveFiles';
import {SaveValidatorPort} from './ports/SaveValidatorPort';
import {SaveFilesMergerPort} from './ports/SaveFilesMergerPort';
import {MergeResultPresenterPort} from './ports/MergeResultPresenterPort';
import {ValidationIssue, VALIDATION_ISSUE_CODES} from './ports/ValidationIssue';
import {InvalidSaveDataError} from '../domain/errors/InvalidSaveDataError';

describe('MergeSaveFiles', () => {

  const MERGED_SAVE = {fileName: 'Save-A-Save-B-merged.json', content: 'merged content'};
  const TWO_VALID_SAVES = {fileNameA: 'Save-A.json', contentA: 'contentA', fileNameB: 'Save-B.json', contentB: 'contentB'};
  const noIssuesFromTheMergedSave: ValidationIssue[] = [];

  interface UseCaseOverrides {
    validate?: SaveValidatorPort['validate'];
    merge?: SaveFilesMergerPort['merge'];
  }

  function createUseCase({validate = () => ({isValid: true, errors: [], warnings: []}), merge = () => MERGED_SAVE}: UseCaseOverrides = {}) {
    const validator: SaveValidatorPort = {validate: mock(validate)};
    const merger: SaveFilesMergerPort = {merge: mock(merge)};
    const presenter: MergeResultPresenterPort = {presentMergeSucceeded: mock(), presentSaveFilesInvalid: mock(), presentMergedSaveUnusable: mock()};

    return {useCase: new MergeSaveFiles(validator, merger, presenter), validator, merger, presenter};
  }

  describe('When both saves are valid', () => {
    it('should present a success result with the merged file name and content', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase();

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith({
        fileName: 'Save-A-Save-B-merged.json',
        content: 'merged content',
        mergedSaveIssues: noIssuesFromTheMergedSave,
        saveAWarnings: [],
        saveBWarnings: []
      });
    });
  });

  describe('When at least one save is invalid', () => {
    it('should present a validation error result without merging', async () => {
      // Arrange
      const invalidJsonError = {code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: contentA'};
      const {useCase, merger, presenter} = createUseCase({
        validate: (fileName: string, content: string) => content === 'contentA'
          ? {isValid: false, errors: [invalidJsonError], warnings: []}
          : {isValid: true, errors: [], warnings: []}
      });

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(merger.merge).not.toHaveBeenCalled();
      expect(presenter.presentSaveFilesInvalid).toHaveBeenCalledWith({
        saveAErrors: [invalidJsonError],
        saveBErrors: [],
        saveAWarnings: [],
        saveBWarnings: []
      });
    });
  });

  describe('When a save file has an invalid extension', () => {
    it('should present a validation error result reported by the validator', async () => {
      // Arrange
      const invalidExtensionError = {code: VALIDATION_ISSUE_CODES.INVALID_EXTENSION, detail: 'Invalid file extension: expected a .json file.'};
      const {useCase, validator, merger, presenter} = createUseCase({
        validate: (fileName: string) => fileName === 'Save-A.txt'
          ? {isValid: false, errors: [invalidExtensionError], warnings: []}
          : {isValid: true, errors: [], warnings: []}
      });

      // Act
      await useCase.execute({...TWO_VALID_SAVES, fileNameA: 'Save-A.txt'});

      // Assert
      expect(validator.validate).toHaveBeenCalledTimes(2);
      expect(validator.validate).toHaveBeenCalledWith('Save-A.txt', 'contentA');
      expect(validator.validate).toHaveBeenCalledWith('Save-B.json', 'contentB');
      expect(merger.merge).not.toHaveBeenCalled();
      expect(presenter.presentSaveFilesInvalid).toHaveBeenCalledWith({
        saveAErrors: [invalidExtensionError],
        saveBErrors: [],
        saveAWarnings: [],
        saveBWarnings: []
      });
    });
  });

  describe('When validation reports that a save had to be adapted', () => {
    it('should present the warnings of each save on a successful merge', () => {
      // Arrange
      const {useCase, presenter} = createUseCase({
        validate: (fileName: string, content: string) => content === 'contentA'
          ? {isValid: true, errors: [], warnings: ['legacy-save-format' as const]}
          : {isValid: true, errors: [], warnings: []}
      });

      // Act
      useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith({
        fileName: 'Save-A-Save-B-merged.json',
        content: 'merged content',
        mergedSaveIssues: noIssuesFromTheMergedSave,
        saveAWarnings: ['legacy-save-format'],
        saveBWarnings: []
      });
    });

    it('should present the warnings of each save when the merge is rejected', () => {
      // Arrange
      const invalidJsonError = {code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: contentB'};
      const {useCase, presenter} = createUseCase({
        validate: (fileName: string, content: string) => content === 'contentA'
          ? {isValid: true, errors: [], warnings: ['legacy-save-format' as const]}
          : {isValid: false, errors: [invalidJsonError], warnings: []}
      });

      // Act
      useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentSaveFilesInvalid).toHaveBeenCalledWith({
        saveAErrors: [],
        saveBErrors: [invalidJsonError],
        saveAWarnings: ['legacy-save-format'],
        saveBWarnings: []
      });
    });
  });

  describe('When the merged save does not pass validation', () => {
    const uniqueHostError = {code: VALIDATION_ISSUE_CODES.UNIQUE_HOST, detail: 'Expected exactly one host player, found 2'};

    function acceptBothInputsAndRejectTheMergedSave(fileName: string, content: string) {
      return content === MERGED_SAVE.content
        ? {isValid: false, errors: [uniqueHostError], warnings: []}
        : {isValid: true, errors: [], warnings: []};
    }

    it('should present a success carrying the errors of the produced save', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase({validate: acceptBothInputsAndRejectTheMergedSave});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith({
        fileName: 'Save-A-Save-B-merged.json',
        content: 'merged content',
        mergedSaveIssues: [uniqueHostError],
        saveAWarnings: [],
        saveBWarnings: []
      });
    });

    it('should not blame the input files, which validation has already accepted', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase({validate: acceptBothInputsAndRejectTheMergedSave});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentSaveFilesInvalid).not.toHaveBeenCalled();
    });

    it('should validate the file name and the content the merger produced', async () => {
      // Arrange
      const {useCase, validator} = createUseCase({validate: acceptBothInputsAndRejectTheMergedSave});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(validator.validate).toHaveBeenCalledTimes(3);
      expect(validator.validate).toHaveBeenCalledWith('Save-A-Save-B-merged.json', 'merged content');
    });
  });

  describe('When the merge produces a save that cannot be used', () => {
    function throwInvalidSaveData(): never {
      throw new InvalidSaveDataError('MergedSaveValueObject.content must be a non-empty string, received ');
    }

    it('should present the merged save as unusable instead of a success', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase({merge: throwInvalidSaveData});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentMergedSaveUnusable).toHaveBeenCalled();
      expect(presenter.presentMergeSucceeded).not.toHaveBeenCalled();
    });

    it('should not blame the input files, which validation has already accepted', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase({merge: throwInvalidSaveData});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentSaveFilesInvalid).not.toHaveBeenCalled();
    });
  });

  describe('When the merge fails on anything other than unusable save data', () => {
    it('should let the failure surface rather than turn it into a merge outcome', async () => {
      // Arrange
      const unreadableSaveContentError = new Error('Save file "Save-A.json" cannot be parsed: Invalid JSON: {not valid json');
      const {useCase, presenter} = createUseCase({
        merge: () => {
          throw unreadableSaveContentError;
        }
      });

      // Act
      const mergeSaveFiles = useCase.execute(TWO_VALID_SAVES);

      // Assert
      await expect(mergeSaveFiles).rejects.toThrow(unreadableSaveContentError);
      expect(presenter.presentMergedSaveUnusable).not.toHaveBeenCalled();
    });
  });
});
