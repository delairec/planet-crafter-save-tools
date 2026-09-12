import {describe, expect, it, mock} from 'bun:test';
import {MergeSaveFiles} from './MergeSaveFiles';
import {SaveValidatorPort} from './ports/SaveValidatorPort';
import {MergeSource, MergeSourceReaderPort} from './ports/MergeSourceReaderPort';
import {MergedSaveSerializerPort, MergedSaveToSerialize} from './ports/MergedSaveSerializerPort';
import {MergeResultPresenterPort} from './ports/MergeResultPresenterPort';
import {MergeSucceededResponse} from './responses/MergeSucceededResponse';
import {SaveFilesInvalidResponse} from './responses/SaveFilesInvalidResponse';
import {ValidationIssue, VALIDATION_ISSUE_CODES} from './ports/ValidationIssue';
import {SaveValidationResult} from './ports/SaveValidationResult';
import {SaveParseError, SaveWarningCode} from 'shared-save-processing/gameDefinitions';
import {createPlayer, createSaveConfiguration} from 'shared-save-processing/testing/createSaveRecords.js';
import {createSaveSections} from '../testing/createSaveSections';

describe('MergeSaveFiles', () => {

  const MERGED_FILE_NAME = 'Save-A-Save-B-merged.json';
  const TWO_VALID_SAVES = {fileNameA: 'Save-A.json', contentA: 'contentA', fileNameB: 'Save-B.json', contentB: 'contentB'};
  const noErrorsFromTheMerge: ValidationIssue[] = [];
  const noParseErrors: SaveParseError[] = [];

  const ACCEPTED: SaveValidationResult = {isValid: true, errors: [], warnings: []};
  const rejectedWith = (...errors: ValidationIssue[]): SaveValidationResult => ({isValid: false, errors, warnings: []});
  const acceptedWith = (...warnings: SaveWarningCode[]): SaveValidationResult => ({isValid: true, errors: [], warnings});

  const validatorAnswering = (resultsByFileName: Record<string, SaveValidationResult>): SaveValidatorPort['validate'] =>
    (fileName: string) => resultsByFileName[fileName] ?? ACCEPTED;

  const readerAnswering = (sourcesByContent: Record<string, MergeSource>): MergeSourceReaderPort['read'] =>
    (content: string) => sourcesByContent[content] ?? {sections: createSaveSections(), errors: noParseErrors};

  interface UseCaseOverrides {
    validate?: SaveValidatorPort['validate'];
    read?: MergeSourceReaderPort['read'];
  }

  function createUseCase({validate = () => ACCEPTED, read = readerAnswering({})}: UseCaseOverrides = {}) {
    const validator: SaveValidatorPort = {validate: mock(validate)};
    const sourceReader: MergeSourceReaderPort = {read: mock(read)};
    const serializer: MergedSaveSerializerPort = {
      buildFileName: mock(() => ({fileName: MERGED_FILE_NAME, stem: 'Save-A-Save-B-merged'})),
      serialize: mock(({fileName}: MergedSaveToSerialize) => ({fileName, content: 'merged content'}))
    };
    const presenter: MergeResultPresenterPort = {presentMergeSucceeded: mock(), presentSaveFilesInvalid: mock(), presentMergedSaveUnusable: mock()};

    return {useCase: new MergeSaveFiles(validator, sourceReader, serializer, presenter), validator, sourceReader, serializer, presenter};
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
        mergeErrors: noErrorsFromTheMerge,
        saveAWarnings: [],
        saveBWarnings: []
      } satisfies MergeSucceededResponse);
    });

    it('should name the merged file after both source files', async () => {
      // Arrange
      const {useCase, serializer} = createUseCase();

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(serializer.buildFileName).toHaveBeenCalledWith({fileNameA: 'Save-A.json', fileNameB: 'Save-B.json'});
    });

    it('should hand the serializer the sections merged from both saves, with their identifier conflicts resolved', async () => {
      // Arrange
      const playerFromSaveA = createPlayer({id: '1', name: 'Nikowa', inventoryId: 10, equipmentId: 11});
      const playerFromSaveB = createPlayer({id: '2', name: 'Sakia', inventoryId: 10, equipmentId: 11, host: false});
      const {useCase, serializer} = createUseCase({
        read: readerAnswering({
          contentA: {sections: createSaveSections({players: [playerFromSaveA], inventories: [{id: 10, woIds: [], size: 20}, {id: 11, woIds: [], size: 10}]}), errors: noParseErrors},
          contentB: {sections: createSaveSections({players: [playerFromSaveB], inventories: [{id: 10, woIds: [], size: 20}, {id: 11, woIds: [], size: 10}]}), errors: noParseErrors}
        })
      });

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(serializer.serialize).toHaveBeenCalledWith(expect.objectContaining({
        fileName: 'Save-A-Save-B-merged.json',
        sections: expect.objectContaining({
          players: {fromSaveA: [playerFromSaveA], fromSaveB: [{...playerFromSaveB, inventoryId: 12, equipmentId: 13}]},
          inventories: {
            fromSaveA: [{id: 10, woIds: [], size: 20}, {id: 11, woIds: [], size: 10}],
            fromSaveB: [{id: 12, woIds: [], size: 20}, {id: 13, woIds: [], size: 10}]
          }
        })
      }));
    });
  });

  describe('When no display name is requested for the merged save', () => {
    it('should name the merged save after the stem of the merged file', async () => {
      // Arrange
      const {useCase, serializer} = createUseCase({
        read: readerAnswering({
          contentA: {sections: createSaveSections({saveConfigurations: [createSaveConfiguration({saveDisplayName: 'Save A'})]}), errors: noParseErrors}
        })
      });

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(serializer.serialize).toHaveBeenCalledWith(expect.objectContaining({
        sections: expect.objectContaining({
          saveConfiguration: expect.objectContaining({saveDisplayName: 'Save-A-Save-B-merged'})
        })
      }));
    });
  });

  describe('When a display name is requested for the merged save', () => {
    it('should give the merged save that display name', async () => {
      // Arrange
      const {useCase, serializer} = createUseCase({
        read: readerAnswering({
          contentA: {sections: createSaveSections({saveConfigurations: [createSaveConfiguration({saveDisplayName: 'Save A'})]}), errors: noParseErrors}
        })
      });

      // Act
      await useCase.execute({...TWO_VALID_SAVES, saveDisplayName: 'Our merged world'});

      // Assert
      expect(serializer.serialize).toHaveBeenCalledWith(expect.objectContaining({
        sections: expect.objectContaining({
          saveConfiguration: expect.objectContaining({saveDisplayName: 'Our merged world'})
        })
      }));
    });
  });

  describe('When at least one save is invalid', () => {
    it('should present a validation error result without reading the saves for the merge', async () => {
      // Arrange
      const invalidJsonError = {code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: contentA'};
      const {useCase, sourceReader, presenter} = createUseCase({
        validate: validatorAnswering({'Save-A.json': rejectedWith(invalidJsonError)})
      });

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(sourceReader.read).not.toHaveBeenCalled();
      expect(presenter.presentSaveFilesInvalid).toHaveBeenCalledWith({
        saveAErrors: [invalidJsonError],
        saveBErrors: [],
        saveAWarnings: [],
        saveBWarnings: []
      } satisfies SaveFilesInvalidResponse);
    });
  });

  describe('When a save file has an invalid extension', () => {
    it('should present a validation error result reported by the validator', async () => {
      // Arrange
      const invalidExtensionError = {code: VALIDATION_ISSUE_CODES.INVALID_EXTENSION, detail: 'Invalid file extension: expected a .json file.'};
      const {useCase, validator, sourceReader, presenter} = createUseCase({
        validate: validatorAnswering({'Save-A.txt': rejectedWith(invalidExtensionError)})
      });

      // Act
      await useCase.execute({...TWO_VALID_SAVES, fileNameA: 'Save-A.txt'});

      // Assert
      expect(validator.validate).toHaveBeenCalledTimes(2);
      expect(validator.validate).toHaveBeenCalledWith('Save-A.txt', 'contentA');
      expect(validator.validate).toHaveBeenCalledWith('Save-B.json', 'contentB');
      expect(sourceReader.read).not.toHaveBeenCalled();
      expect(presenter.presentSaveFilesInvalid).toHaveBeenCalledWith({
        saveAErrors: [invalidExtensionError],
        saveBErrors: [],
        saveAWarnings: [],
        saveBWarnings: []
      } satisfies SaveFilesInvalidResponse);
    });
  });

  describe('When validation reports that a save had to be adapted', () => {
    it('should present the warnings of each save on a successful merge', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase({
        validate: validatorAnswering({'Save-A.json': acceptedWith('legacy-save-format')})
      });

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith({
        fileName: 'Save-A-Save-B-merged.json',
        content: 'merged content',
        mergeErrors: noErrorsFromTheMerge,
        saveAWarnings: ['legacy-save-format'],
        saveBWarnings: []
      } satisfies MergeSucceededResponse);
    });

    it('should present the warnings of each save when the merge is rejected', async () => {
      // Arrange
      const invalidJsonError = {code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: contentB'};
      const {useCase, presenter} = createUseCase({
        validate: validatorAnswering({
          'Save-A.json': acceptedWith('legacy-save-format'),
          'Save-B.json': rejectedWith(invalidJsonError)
        })
      });

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentSaveFilesInvalid).toHaveBeenCalledWith({
        saveAErrors: [],
        saveBErrors: [invalidJsonError],
        saveAWarnings: ['legacy-save-format'],
        saveBWarnings: []
      } satisfies SaveFilesInvalidResponse);
    });
  });

  describe('When the merged save does not pass validation', () => {
    const uniqueHostError = {code: VALIDATION_ISSUE_CODES.UNIQUE_HOST, detail: 'Expected exactly one host player, found 2'};

    const rejectOnlyTheMergedSave = validatorAnswering({[MERGED_FILE_NAME]: rejectedWith(uniqueHostError)});

    it('should present a success carrying the errors of the produced save', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase({validate: rejectOnlyTheMergedSave});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith({
        fileName: 'Save-A-Save-B-merged.json',
        content: 'merged content',
        mergeErrors: [uniqueHostError],
        saveAWarnings: [],
        saveBWarnings: []
      } satisfies MergeSucceededResponse);
    });

    it('should not blame the input files, which validation has already accepted', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase({validate: rejectOnlyTheMergedSave});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentSaveFilesInvalid).not.toHaveBeenCalled();
    });

    it('should validate the file name and the content the serializer produced', async () => {
      // Arrange
      const {useCase, validator} = createUseCase({validate: rejectOnlyTheMergedSave});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(validator.validate).toHaveBeenCalledTimes(3);
      expect(validator.validate).toHaveBeenCalledWith('Save-A-Save-B-merged.json', 'merged content');
    });
  });

  describe('When a save reaches the merge with a line that cannot be read', () => {
    const unreadableLine: SaveParseError = {section: 4, entryIndex: 0, detail: 'Invalid JSON: {not valid json'};
    const readSaveAWithAnUnreadableLine = readerAnswering({contentA: {sections: createSaveSections(), errors: [unreadableLine]}});

    it('should present the merged save as unusable instead of a success', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase({read: readSaveAWithAnUnreadableLine});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentMergedSaveUnusable).toHaveBeenCalled();
      expect(presenter.presentMergeSucceeded).not.toHaveBeenCalled();
    });

    it('should not blame the input files, which validation has already accepted', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase({read: readSaveAWithAnUnreadableLine});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentSaveFilesInvalid).not.toHaveBeenCalled();
    });

    it('should not produce a save amputated of what could not be read', async () => {
      // Arrange
      const {useCase, serializer, validator} = createUseCase({read: readSaveAWithAnUnreadableLine});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(serializer.serialize).not.toHaveBeenCalled();
      expect(validator.validate).toHaveBeenCalledTimes(2);
    });
  });

  describe('When reading a save fails', () => {
    it('should let the failure surface rather than turn it into a merge outcome', async () => {
      // Arrange
      const readFailure = new Error('Unexpected failure while reading the save');
      const {useCase, presenter} = createUseCase({
        read: () => {
          throw readFailure;
        }
      });

      // Act
      const mergeSaveFiles = useCase.execute(TWO_VALID_SAVES);

      // Assert
      await expect(mergeSaveFiles).rejects.toThrow(readFailure);
      expect(presenter.presentMergedSaveUnusable).not.toHaveBeenCalled();
    });
  });
});
