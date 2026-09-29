import {describe, expect, it, mock} from 'bun:test';
import {MergeSaveFiles} from './MergeSaveFiles';
import {SaveValidatorPort} from './ports/SaveValidatorPort';
import {ParsedSaveSections, SaveSectionsParserPort} from './ports/SaveSectionsParserPort';
import {SaveSectionsReaderPort, SaveSectionsReading} from './ports/SaveSectionsReaderPort';
import {SaveSectionsSerializerPort} from './ports/SaveSectionsSerializerPort';
import {MergeResultPresenterPort} from './ports/MergeResultPresenterPort';
import {MergeSucceededResponse} from './responses/MergeSucceededResponse';
import {SaveFilesInvalidResponse} from './responses/SaveFilesInvalidResponse';
import {SaveFilesWithoutJsonExtensionResponse} from './responses/SaveFilesWithoutJsonExtensionResponse';
import {SaveFilesWithoutUniqueHostResponse} from './responses/SaveFilesWithoutUniqueHostResponse';
import {MergeWarning} from './responses/MergeWarning';
import {ValidationIssue} from './ports/ValidationIssue';
import {VALIDATION_ISSUE_CODES} from './ports/validationIssueCodes';
import {SaveValidationResult} from './ports/SaveValidationResult';
import {UnreadableLine} from './ports/SaveSectionLocation';
import {SaveWarning} from 'shared-save-processing/gameDefinitions';
import {INVENTORIES_SECTION_INDEX, PLAYERS_SECTION_INDEX} from 'shared-save-processing/sectionIndexes.js';
import {createPlayerEntry, createSaveConfigurationEntry, createTerrainLayerEntry} from '../testing/createSaveEntries';
import {createSaveSections} from '../testing/createSaveSections';
import {FakeSaveSectionsMapperService} from '../testing/FakeSaveSectionsMapperService';
import {createPlayerFlaggedAsHost, SaveSectionsWithPlayers} from '../testing/SaveSectionsWithPlayers';

describe('MergeSaveFiles', () => {

  const TWO_VALID_SAVES = {fileNameA: 'Save-A.json', contentA: 'contentA', fileNameB: 'Save-B.json', contentB: 'contentB'};
  const noErrorsFromTheMerge: ValidationIssue[] = [];
  const noMergeWarnings: MergeWarning[] = [];
  const noParseErrors: UnreadableLine[] = [];

  const ACCEPTED: SaveValidationResult = {isValid: true, errors: [], warnings: []};
  const rejectedWith = (...errors: ValidationIssue[]): SaveValidationResult => ({isValid: false, errors, warnings: []});
  const acceptedWith = (...warnings: SaveWarning[]): SaveValidationResult => ({isValid: true, errors: [], warnings});

  const validatorAnswering = (resultsByContent: Record<string, SaveValidationResult>): SaveValidatorPort['validate'] =>
    (content: string) => resultsByContent[content] ?? ACCEPTED;

  const parserAnswering = (savesByContent: Record<string, ParsedSaveSections>): SaveSectionsParserPort['parse'] =>
    (content: string) => savesByContent[content] ?? {sections: createSaveSections(), errors: noParseErrors};

  const readerAnswering = (readingsByContent: Record<string, SaveSectionsReading>): SaveSectionsReaderPort['read'] =>
    (content: string) => readingsByContent[content] ?? {saveSections: new FakeSaveSectionsMapperService(), unreadableLines: noParseErrors};

  interface UseCaseOverrides {
    hasJsonExtension?: SaveValidatorPort['hasJsonExtension'];
    validate?: SaveValidatorPort['validate'];
    read?: SaveSectionsReaderPort['read'];
    parse?: SaveSectionsParserPort['parse'];
  }

  function createUseCase({hasJsonExtension = () => true, validate = () => ACCEPTED, read = readerAnswering({}), parse = parserAnswering({})}: UseCaseOverrides = {}) {
    const validator: SaveValidatorPort = {hasJsonExtension: mock(hasJsonExtension), validate: mock(validate)};
    const reader: SaveSectionsReaderPort = {read: mock(read)};
    const parser: SaveSectionsParserPort = {parse: mock(parse)};
    const serializer: SaveSectionsSerializerPort = {serialize: mock(() => 'merged content')};
    const presenter: MergeResultPresenterPort = {
      presentMergeSucceeded: mock(),
      presentSaveFilesWithoutJsonExtension: mock(),
      presentSaveFilesInvalid: mock(),
      presentSaveFilesWithoutUniqueHost: mock(),
      presentMergedSaveUnusable: mock()
    };

    return {useCase: new MergeSaveFiles(validator, reader, parser, serializer, presenter), validator, reader, parser, serializer, presenter};
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
        legacyFormatCouldBeKept: false,
        saveAWarnings: [],
        saveBWarnings: []
      } satisfies MergeSucceededResponse);
    });

    it('should hand the serializer the sections merged from both saves, with their identifier conflicts resolved', async () => {
      // Arrange
      const playerFromSaveA = createPlayerEntry({id: '1', name: 'Nikowa', inventoryId: 10, equipmentId: 11});
      const playerFromSaveB = createPlayerEntry({id: '2', name: 'Sakia', inventoryId: 10, equipmentId: 11, host: false});
      const {useCase, serializer} = createUseCase({
        parse: parserAnswering({
          contentA: {sections: createSaveSections({players: [playerFromSaveA], inventories: [{id: 10, worldObjectIds: [], size: 20}, {id: 11, worldObjectIds: [], size: 10}]}), errors: noParseErrors},
          contentB: {sections: createSaveSections({players: [playerFromSaveB], inventories: [{id: 10, worldObjectIds: [], size: 20}, {id: 11, worldObjectIds: [], size: 10}]}), errors: noParseErrors}
        })
      });

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(serializer.serialize).toHaveBeenCalledWith(expect.objectContaining({
        players: [playerFromSaveA, {...playerFromSaveB, inventoryId: 12, equipmentId: 13}],
        inventories: [
          {id: 10, worldObjectIds: [], size: 20}, {id: 11, worldObjectIds: [], size: 10},
          {id: 12, worldObjectIds: [], size: 20}, {id: 13, worldObjectIds: [], size: 10}
        ]
      }));
    });
  });

  describe('When no display name is requested for the merged save', () => {
    it('should name the merged save after the stem of the merged file', async () => {
      // Arrange
      const {useCase, serializer} = createUseCase({
        parse: parserAnswering({
          contentA: {sections: createSaveSections({saveConfigurations: [createSaveConfigurationEntry({saveDisplayName: 'Save A'})]}), errors: noParseErrors}
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
          contentA: {sections: createSaveSections({saveConfigurations: [createSaveConfigurationEntry({saveDisplayName: 'Save A'})]}), errors: noParseErrors}
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
      contentA: {sections: createSaveSections({formatRelease: '1.618', terrainLayers: [createTerrainLayerEntry()]}), errors: noParseErrors},
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

    it('should state that the legacy format could have been kept', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase({parse: parseALegacySaveAAndACurrentSaveB});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith(expect.objectContaining({legacyFormatCouldBeKept: true}));
    });

    describe('When the merge asks for the legacy format', () => {
      it('should hand the serializer the sections in the legacy format', async () => {
        // Arrange
        const {useCase, serializer} = createUseCase({parse: parseALegacySaveAAndACurrentSaveB});

        // Act
        await useCase.execute({...TWO_VALID_SAVES, preferLegacyFormat: true});

        // Assert
        expect(serializer.serialize).toHaveBeenCalledWith(expect.objectContaining({
          formatRelease: '1.618',
          terrainLayers: [createTerrainLayerEntry()]
        }));
      });

      it('should report the legacy format written, no section dropped, and the content the earlier release may not know', async () => {
        // Arrange
        const {useCase, presenter} = createUseCase({parse: parseALegacySaveAAndACurrentSaveB});

        // Act
        await useCase.execute({...TWO_VALID_SAVES, preferLegacyFormat: true});

        // Assert
        expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith(expect.objectContaining({
          mergeWarnings: [
            {code: 'merged-save-format', formatRelease: '1.618'},
            {code: 'merged-save-content-newer-than-format', formatRelease: '1.618', contentRelease: '2.004'}
          ]
        }));
      });

      it('should not state that the legacy format could have been kept, the merge having kept it', async () => {
        // Arrange
        const {useCase, presenter} = createUseCase({parse: parseALegacySaveAAndACurrentSaveB});

        // Act
        await useCase.execute({...TWO_VALID_SAVES, preferLegacyFormat: true});

        // Assert
        expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith(expect.objectContaining({legacyFormatCouldBeKept: false}));
      });
    });
  });

  describe('When the two saves carry the legacy format', () => {
    it('should not state that the legacy format could have been kept, no format being lost', async () => {
      // Arrange
      const legacySave: ParsedSaveSections = {sections: createSaveSections({formatRelease: '1.618', terrainLayers: [createTerrainLayerEntry()]}), errors: noParseErrors};
      const {useCase, presenter} = createUseCase({parse: parserAnswering({contentA: legacySave, contentB: legacySave})});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith(expect.objectContaining({legacyFormatCouldBeKept: false}));
    });
  });

  describe('When at least one save is invalid', () => {
    it('should present a validation error result without parsing the saves for the merge', async () => {
      // Arrange
      const invalidJsonError: ValidationIssue = {code: VALIDATION_ISSUE_CODES.INVALID_JSON, section: {name: 'players', index: PLAYERS_SECTION_INDEX}, entryIndex: 0, line: 'contentA'};
      const {useCase, parser, presenter} = createUseCase({
        validate: validatorAnswering({contentA: rejectedWith(invalidJsonError)})
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

  describe('When a save file has no JSON extension', () => {
    it('should reject the saves before validating their content', async () => {
      // Arrange
      const {useCase, validator, presenter} = createUseCase({
        hasJsonExtension: (fileName: string) => fileName !== 'Save-A.txt'
      });

      // Act
      await useCase.execute({...TWO_VALID_SAVES, fileNameA: 'Save-A.txt'});

      // Assert
      expect(validator.validate).not.toHaveBeenCalled();
      expect(presenter.presentSaveFilesWithoutJsonExtension).toHaveBeenCalledWith({
        saveAHasJsonExtension: false,
        saveBHasJsonExtension: true
      } satisfies SaveFilesWithoutJsonExtensionResponse);
    });
  });

  describe('When validation reports that a save was written by 1.618 or earlier', () => {
    describe('When the merge succeeds', () => {
      it('should present the warnings of each save', async () => {
        // Arrange
        const {useCase, presenter} = createUseCase({
          validate: validatorAnswering({contentA: acceptedWith({code: 'legacy-save-format'})})
        });

        // Act
        await useCase.execute(TWO_VALID_SAVES);

        // Assert
        expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith({
          fileName: 'Save-A-Save-B-merged.json',
          content: 'merged content',
          mergeErrors: noErrorsFromTheMerge,
          mergeWarnings: noMergeWarnings,
          legacyFormatCouldBeKept: false,
          saveAWarnings: [{code: 'legacy-save-format'}],
          saveBWarnings: []
        } satisfies MergeSucceededResponse);
      });
    });

    describe('When the merge is rejected', () => {
      it('should present the warnings of each save', async () => {
        // Arrange
        const invalidJsonError: ValidationIssue = {code: VALIDATION_ISSUE_CODES.INVALID_JSON, section: {name: 'players', index: PLAYERS_SECTION_INDEX}, entryIndex: 0, line: 'contentB'};
        const {useCase, presenter} = createUseCase({
          validate: validatorAnswering({
            contentA: acceptedWith({code: 'legacy-save-format'}),
            contentB: rejectedWith(invalidJsonError)
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
  });

  describe('When the merged save does not pass validation', () => {
    const schemaViolation: ValidationIssue = {
      code: VALIDATION_ISSUE_CODES.SCHEMA_VIOLATION,
      section: {name: 'players', index: PLAYERS_SECTION_INDEX},
      entryIndex: 0,
      fieldPath: '',
      schemaMessage: "must have required property 'name'"
    };

    const rejectOnlyTheMergedSave = validatorAnswering({'merged content': rejectedWith(schemaViolation)});

    it('should present a success carrying the errors of the produced save', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase({validate: rejectOnlyTheMergedSave});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith({
        fileName: 'Save-A-Save-B-merged.json',
        content: 'merged content',
        mergeErrors: [schemaViolation],
        mergeWarnings: noMergeWarnings,
        legacyFormatCouldBeKept: false,
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

    it('should validate the content the serializer produced', async () => {
      // Arrange
      const {useCase, validator} = createUseCase({validate: rejectOnlyTheMergedSave});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(validator.validate).toHaveBeenCalledTimes(3);
      expect(validator.validate).toHaveBeenCalledWith('merged content');
    });
  });

  describe('When a save reaches the merge with a line that cannot be read', () => {
    const unreadableLine: UnreadableLine = {section: {name: 'inventories', index: INVENTORIES_SECTION_INDEX}, entryIndex: 0, line: '{not valid json'};
    const readSaveAWithAnUnreadableLine = readerAnswering({contentA: {saveSections: new FakeSaveSectionsMapperService(), unreadableLines: [unreadableLine]}});

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

  describe('When a save designates no host or more than one', () => {
    const readSaveAWithTwoHosts = readerAnswering({
      contentA: {
        saveSections: new SaveSectionsWithPlayers([createPlayerFlaggedAsHost('Nikowa', true), createPlayerFlaggedAsHost('Sakia', true)]),
        unreadableLines: noParseErrors
      }
    });

    it('should present the saves without a unique host, with the host count of the save at fault', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase({
        validate: validatorAnswering({contentA: acceptedWith({code: 'legacy-save-format'})}),
        read: readSaveAWithTwoHosts
      });

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentSaveFilesWithoutUniqueHost).toHaveBeenCalledWith({
        saveAWrongHostCount: 2,
        saveBWrongHostCount: undefined,
        saveAWarnings: [{code: 'legacy-save-format'}],
        saveBWarnings: []
      } satisfies SaveFilesWithoutUniqueHostResponse);
      expect(presenter.presentSaveFilesInvalid).not.toHaveBeenCalled();
      expect(presenter.presentMergeSucceeded).not.toHaveBeenCalled();
    });

    it('should not merge the saves', async () => {
      // Arrange
      const {useCase, parser, serializer} = createUseCase({read: readSaveAWithTwoHosts});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(parser.parse).not.toHaveBeenCalled();
      expect(serializer.serialize).not.toHaveBeenCalled();
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
