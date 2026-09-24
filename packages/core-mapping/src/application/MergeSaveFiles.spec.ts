import {describe, expect, it, mock} from 'bun:test';
import {MergeSaveFiles} from './MergeSaveFiles';
import {SaveValidatorPort} from './ports/SaveValidatorPort';
import {ParsedSaveSections, SaveSectionsParserPort} from './ports/SaveSectionsParserPort';
import {SaveSectionsSerializerPort} from './ports/SaveSectionsSerializerPort';
import {MergeResultPresenterPort} from './ports/MergeResultPresenterPort';
import {MergeSucceededResponse} from './responses/MergeSucceededResponse';
import {SaveFilesInvalidResponse} from './responses/SaveFilesInvalidResponse';
import {MergeWarning} from './responses/MergeWarning';
import {ValidationIssue, VALIDATION_ISSUE_CODES} from './ports/ValidationIssue';
import {SaveValidationResult} from './ports/SaveValidationResult';
import {SaveParseError, SaveWarning} from 'shared-save-processing/gameDefinitions';
import {INVENTORIES_SECTION_INDEX} from 'shared-save-processing/sectionIndexes.js';
import {createPlayer, createSaveConfiguration, createTerrainLayer} from 'shared-save-processing/testing/createSaveRecords.js';
import {createSaveSections} from '../testing/createSaveSections';

describe('MergeSaveFiles', () => {

  const MERGED_FILE_NAME = 'Save-A-Save-B-merged.json';
  const TWO_VALID_SAVES = {fileNameA: 'Save-A.json', contentA: 'contentA', fileNameB: 'Save-B.json', contentB: 'contentB'};
  const noErrorsFromTheMerge: ValidationIssue[] = [];
  const noMergeWarnings: MergeWarning[] = [];
  const noParseErrors: SaveParseError[] = [];

  const ACCEPTED: SaveValidationResult = {isValid: true, errors: [], warnings: []};
  const rejectedWith = (...errors: ValidationIssue[]): SaveValidationResult => ({isValid: false, errors, warnings: []});
  const acceptedWith = (...warnings: SaveWarning[]): SaveValidationResult => ({isValid: true, errors: [], warnings});

  const validatorAnswering = (resultsByFileName: Record<string, SaveValidationResult>): SaveValidatorPort['validate'] =>
    (fileName: string) => resultsByFileName[fileName] ?? ACCEPTED;

  const parserAnswering = (savesByContent: Record<string, ParsedSaveSections>): SaveSectionsParserPort['parse'] =>
    (content: string) => savesByContent[content] ?? {sections: createSaveSections(), errors: noParseErrors};

  interface UseCaseOverrides {
    validate?: SaveValidatorPort['validate'];
    parse?: SaveSectionsParserPort['parse'];
  }

  function createUseCase({validate = () => ACCEPTED, parse = parserAnswering({})}: UseCaseOverrides = {}) {
    const validator: SaveValidatorPort = {validate: mock(validate)};
    const parser: SaveSectionsParserPort = {parse: mock(parse)};
    const serializer: SaveSectionsSerializerPort = {serialize: mock(() => 'merged content')};
    const presenter: MergeResultPresenterPort = {presentMergeSucceeded: mock(), presentSaveFilesInvalid: mock(), presentMergedSaveUnusable: mock()};

    return {useCase: new MergeSaveFiles(validator, parser, serializer, presenter), validator, parser, serializer, presenter};
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
        mergeWarnings: noMergeWarnings,
        saveAWarnings: [],
        saveBWarnings: []
      } satisfies MergeSucceededResponse);
    });

    it('should hand the serializer the sections merged from both saves, with their identifier conflicts resolved', async () => {
      // Arrange
      const playerFromSaveA = createPlayer({id: '1', name: 'Nikowa', inventoryId: 10, equipmentId: 11});
      const playerFromSaveB = createPlayer({id: '2', name: 'Sakia', inventoryId: 10, equipmentId: 11, host: false});
      const {useCase, serializer} = createUseCase({
        parse: parserAnswering({
          contentA: {sections: createSaveSections({players: [playerFromSaveA], inventories: [{id: 10, woIds: [], size: 20}, {id: 11, woIds: [], size: 10}]}), errors: noParseErrors},
          contentB: {sections: createSaveSections({players: [playerFromSaveB], inventories: [{id: 10, woIds: [], size: 20}, {id: 11, woIds: [], size: 10}]}), errors: noParseErrors}
        })
      });

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(serializer.serialize).toHaveBeenCalledWith(expect.objectContaining({
        players: [playerFromSaveA, {...playerFromSaveB, inventoryId: 12, equipmentId: 13}],
        inventories: [
          {id: 10, woIds: [], size: 20}, {id: 11, woIds: [], size: 10},
          {id: 12, woIds: [], size: 20}, {id: 13, woIds: [], size: 10}
        ]
      }));
    });
  });

  describe('When no display name is requested for the merged save', () => {
    it('should name the merged save after the stem of the merged file', async () => {
      // Arrange
      const {useCase, serializer} = createUseCase({
        parse: parserAnswering({
          contentA: {sections: createSaveSections({saveConfigurations: [createSaveConfiguration({saveDisplayName: 'Save A'})]}), errors: noParseErrors}
        })
      });

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(serializer.serialize).toHaveBeenCalledWith(expect.objectContaining({
        saveConfigurations: [expect.objectContaining({saveDisplayName: 'Save-A-Save-B-merged'})]
      }));
    });
  });

  describe('When a display name is requested for the merged save', () => {
    it('should give the merged save that display name', async () => {
      // Arrange
      const {useCase, serializer} = createUseCase({
        parse: parserAnswering({
          contentA: {sections: createSaveSections({saveConfigurations: [createSaveConfiguration({saveDisplayName: 'Save A'})]}), errors: noParseErrors}
        })
      });

      // Act
      await useCase.execute({...TWO_VALID_SAVES, saveDisplayName: 'Our merged world'});

      // Assert
      expect(serializer.serialize).toHaveBeenCalledWith(expect.objectContaining({
        saveConfigurations: [expect.objectContaining({saveDisplayName: 'Our merged world'})]
      }));
    });
  });

  describe('When the two saves carry different formats', () => {
    const parseALegacySaveAAndACurrentSaveB = parserAnswering({
      contentA: {sections: createSaveSections({formatRelease: '1.618', terrainLayers: [createTerrainLayer()]}), errors: noParseErrors},
      contentB: {sections: createSaveSections({formatRelease: '2.004'}), errors: noParseErrors}
    });

    it('should report the format written and the Terrain Layers section writing it dropped', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase({parse: parseALegacySaveAAndACurrentSaveB});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith(expect.objectContaining({
        mergeWarnings: [
          {code: 'merged-save-format', formatRelease: '2.004'},
          {code: 'merged-save-section-dropped', section: 'terrainLayers'}
        ]
      }));
    });

    it('should hand the serializer the sections in the legacy format when the merge asks for it', async () => {
      // Arrange
      const {useCase, serializer} = createUseCase({parse: parseALegacySaveAAndACurrentSaveB});

      // Act
      await useCase.execute({...TWO_VALID_SAVES, preferLegacyFormat: true});

      // Assert
      expect(serializer.serialize).toHaveBeenCalledWith(expect.objectContaining({
        formatRelease: '1.618',
        terrainLayers: [createTerrainLayer()]
      }));
    });

    it('should report the legacy format written and no section dropped when the merge asks for it', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase({parse: parseALegacySaveAAndACurrentSaveB});

      // Act
      await useCase.execute({...TWO_VALID_SAVES, preferLegacyFormat: true});

      // Assert
      expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith(expect.objectContaining({
        mergeWarnings: [{code: 'merged-save-format', formatRelease: '1.618'}]
      }));
    });
  });

  describe('When at least one save is invalid', () => {
    it('should present a validation error result without parsing the saves for the merge', async () => {
      // Arrange
      const invalidJsonError = {code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: contentA'};
      const {useCase, parser, presenter} = createUseCase({
        validate: validatorAnswering({'Save-A.json': rejectedWith(invalidJsonError)})
      });

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(parser.parse).not.toHaveBeenCalled();
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
      const {useCase, validator, parser, presenter} = createUseCase({
        validate: validatorAnswering({'Save-A.txt': rejectedWith(invalidExtensionError)})
      });

      // Act
      await useCase.execute({...TWO_VALID_SAVES, fileNameA: 'Save-A.txt'});

      // Assert
      expect(validator.validate).toHaveBeenCalledTimes(2);
      expect(validator.validate).toHaveBeenCalledWith('Save-A.txt', 'contentA');
      expect(validator.validate).toHaveBeenCalledWith('Save-B.json', 'contentB');
      expect(parser.parse).not.toHaveBeenCalled();
      expect(presenter.presentSaveFilesInvalid).toHaveBeenCalledWith({
        saveAErrors: [invalidExtensionError],
        saveBErrors: [],
        saveAWarnings: [],
        saveBWarnings: []
      } satisfies SaveFilesInvalidResponse);
    });
  });

  describe('When validation reports that a save was written by 1.618 or earlier', () => {
    it('should present the warnings of each save on a successful merge', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase({
        validate: validatorAnswering({'Save-A.json': acceptedWith({code: 'legacy-save-format'})})
      });

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith({
        fileName: 'Save-A-Save-B-merged.json',
        content: 'merged content',
        mergeErrors: noErrorsFromTheMerge,
        mergeWarnings: noMergeWarnings,
        saveAWarnings: [{code: 'legacy-save-format'}],
        saveBWarnings: []
      } satisfies MergeSucceededResponse);
    });

    it('should present the warnings of each save when the merge is rejected', async () => {
      // Arrange
      const invalidJsonError = {code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: 'Invalid JSON: contentB'};
      const {useCase, presenter} = createUseCase({
        validate: validatorAnswering({
          'Save-A.json': acceptedWith({code: 'legacy-save-format'}),
          'Save-B.json': rejectedWith(invalidJsonError)
        })
      });

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentSaveFilesInvalid).toHaveBeenCalledWith({
        saveAErrors: [],
        saveBErrors: [invalidJsonError],
        saveAWarnings: [{code: 'legacy-save-format'}],
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
        mergeWarnings: noMergeWarnings,
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
    const unreadableLine: SaveParseError = {section: INVENTORIES_SECTION_INDEX, entryIndex: 0, detail: 'Invalid JSON: {not valid json'};
    const parseSaveAWithAnUnreadableLine = parserAnswering({contentA: {sections: createSaveSections(), errors: [unreadableLine]}});

    it('should present the merged save as unusable instead of a success', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase({parse: parseSaveAWithAnUnreadableLine});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentMergedSaveUnusable).toHaveBeenCalled();
      expect(presenter.presentMergeSucceeded).not.toHaveBeenCalled();
    });

    it('should not blame the input files, which validation has already accepted', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase({parse: parseSaveAWithAnUnreadableLine});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentSaveFilesInvalid).not.toHaveBeenCalled();
    });

    it('should not produce a save amputated of what could not be read', async () => {
      // Arrange
      const {useCase, serializer, validator} = createUseCase({parse: parseSaveAWithAnUnreadableLine});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(serializer.serialize).not.toHaveBeenCalled();
      expect(validator.validate).toHaveBeenCalledTimes(2);
    });
  });

  describe('When parsing a save fails', () => {
    it('should let the failure surface rather than turn it into a merge outcome', async () => {
      // Arrange
      const parseFailure = new Error('Unexpected failure while parsing the save');
      const {useCase, presenter} = createUseCase({
        parse: () => {
          throw parseFailure;
        }
      });

      // Act
      const mergeSaveFiles = useCase.execute(TWO_VALID_SAVES);

      // Assert
      await expect(mergeSaveFiles).rejects.toThrow(parseFailure);
      expect(presenter.presentMergedSaveUnusable).not.toHaveBeenCalled();
    });
  });
});
