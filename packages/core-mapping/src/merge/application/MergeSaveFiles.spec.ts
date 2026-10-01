import {describe, expect, it, mock} from 'bun:test';
import {MergeSaveFiles} from './MergeSaveFiles';
import {SaveValidatorPort} from '../../save/application/ports/SaveValidatorPort';
import {SaveSectionsParserPort} from '../../save/application/ports/SaveSectionsParserPort';
import {ParsedSaveSectionsResponse} from '../../save/application/responses/ParsedSaveSectionsResponse';
import {SaveSectionsSerializerPort} from './ports/SaveSectionsSerializerPort';
import {MergeResultPresenterPort} from './ports/MergeResultPresenterPort';
import {MergeSucceededResponse} from './responses/MergeSucceededResponse';
import {SaveFilesInvalidResponse} from './responses/SaveFilesInvalidResponse';
import {SaveFilesWithoutUniqueHostResponse} from './responses/SaveFilesWithoutUniqueHostResponse';
import {MergeWarning} from '../domain/rules/MergeWarning';
import {ValidationIssue} from '../../save/domain/validation/ValidationIssue';
import {VALIDATION_ISSUE_CODES} from '../../save/domain/validation/validationIssueCodes';
import {SaveValidationResponse} from '../../save/application/responses/SaveValidationResponse';
import {UnreadableLine} from '../../save/domain/save/SaveSectionLocation';
import {PlayerEntry} from '../../save/domain/save/PlayerEntry';
import type {SaveWarning} from "../../save/domain/validation/SaveWarning";
import {createPlayerEntry, createSaveConfigurationEntry, createTerrainLayerEntry} from '../../save/testing/createSaveEntries';
import {createSaveSections} from '../../save/testing/createSaveSections';
import {INVENTORIES_SECTION, PLAYERS_SECTION} from '../../save/testing/saveSectionLocations';
import {stubGameReleasesReader} from '../../save/testing/stubGameReleasesReader';
import {FileNameSanitizerPort} from './ports/FileNameSanitizerPort';

describe('MergeSaveFiles', () => {

  const TWO_VALID_SAVES = {fileNameA: 'Save-A.json', contentA: 'contentA', fileNameB: 'Save-B.json', contentB: 'contentB'};
  const noErrorsFromTheMerge: ValidationIssue[] = [];
  const noMergeWarnings: MergeWarning[] = [];
  const noParseErrors: UnreadableLine[] = [];

  const ACCEPTED: SaveValidationResponse = {isValid: true, errors: [], warnings: []};
  const rejectedWith = (...errors: ValidationIssue[]): SaveValidationResponse => ({isValid: false, errors, warnings: []});
  const acceptedWith = (...warnings: SaveWarning[]): SaveValidationResponse => ({isValid: true, errors: [], warnings});

  const validatorAnswering = (resultsByContent: Record<string, SaveValidationResponse>): SaveValidatorPort['validate'] =>
    (content: string) => resultsByContent[content] ?? ACCEPTED;

  const parserAnswering = (savesByContent: Record<string, ParsedSaveSectionsResponse>): SaveSectionsParserPort['parse'] =>
    (content: string) => savesByContent[content] ?? {sections: createSaveSections(), errors: noParseErrors};

  interface UseCaseOverrides {
    hasJsonExtension?: SaveValidatorPort['hasJsonExtension'];
    validate?: SaveValidatorPort['validate'];
    parse?: SaveSectionsParserPort['parse'];
  }

  function createUseCase({hasJsonExtension = () => true, validate = () => ACCEPTED, parse = parserAnswering({})}: UseCaseOverrides = {}) {
    const validator: SaveValidatorPort = {hasJsonExtension: mock(hasJsonExtension), validate: mock(validate)};
    const parser: SaveSectionsParserPort = {parse: mock(parse)};
    const serializer: SaveSectionsSerializerPort = {serialize: mock(() => 'merged content')};
    const fileNameSanitizer: FileNameSanitizerPort = {sanitize: mock(() => ({fileName: 'Save-A-Save-B-merged.json', stem: 'Save-A-Save-B-merged'}))};
    const presenter: MergeResultPresenterPort = {
      presentMergeSucceeded: mock(),
      presentSaveFilesInvalid: mock(),
      presentSaveFilesWithoutUniqueHost: mock(),
      presentMergedSaveUnusable: mock()
    };

    return {useCase: new MergeSaveFiles(validator, parser, serializer, stubGameReleasesReader(), fileNameSanitizer, presenter), validator, parser, serializer, fileNameSanitizer, presenter};
  }

  describe('When the release a save declares contradicts the format it carries', () => {
    it('should present the contradiction among the warnings of that save', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase({
        validate: validatorAnswering({contentA: {isValid: true, errors: [], warnings: [], declaredVersion: '1.0', carriedRelease: '2.004'}})
      });

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith(expect.objectContaining({
        saveAWarnings: [{code: 'declared-release-contradicts-content', declaredVersion: '1.0', declaredRelease: '1.618', carriedRelease: '2.004'}],
        saveBWarnings: []
      }));
    });
  });

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

    it('should name the merged file after both source files, marked as merged', async () => {
      // Arrange
      const {useCase, fileNameSanitizer} = createUseCase();

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(fileNameSanitizer.sanitize).toHaveBeenCalledWith({sourceFileNames: ['Save-A.json', 'Save-B.json'], suffix: '-merged'});
    });

    it('should hand the serializer the sections merged from both saves, with their identifier conflicts resolved', async () => {
      // Arrange
      const playerFromSaveA = createPlayerEntry({id: '1', name: 'Nikowa', inventoryId: 10, equipmentId: 11});
      const playerFromSaveB = createPlayerEntry({id: '2', name: 'Sakia', inventoryId: 10, equipmentId: 11, host: true});
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
        players: [
          {
            id: '1',
            name: 'Nikowa',
            inventoryId: 10,
            equipmentId: 11,
            playerPosition: '1751.865,472.58,-1106.104',
            playerRotation: '0,0.5740051,0,-0.8188518',
            playerGaugeOxygen: 280.0,
            playerGaugeThirst: 96.3858642578125,
            playerGaugeHealth: 72.67363739013672,
            playerGaugeToxic: 0.0,
            host: true,
            planetId: 'Toxicity',
            cameraView: 0,
            totalCraftedObjects: 1820,
            totalTerraTokenEarned: 9000
          },
          {
            id: '2',
            name: 'Sakia',
            inventoryId: 12,
            equipmentId: 13,
            playerPosition: '1751.865,472.58,-1106.104',
            playerRotation: '0,0.5740051,0,-0.8188518',
            playerGaugeOxygen: 280.0,
            playerGaugeThirst: 96.3858642578125,
            playerGaugeHealth: 72.67363739013672,
            playerGaugeToxic: 0.0,
            host: false,
            planetId: 'Toxicity',
            cameraView: 0,
            totalCraftedObjects: 1820,
            totalTerraTokenEarned: 9000
          }
        ] satisfies PlayerEntry[],
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

    it('should present the report the merge makes on the format it wrote', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase({parse: parseALegacySaveAAndACurrentSaveB});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith(expect.objectContaining({
        mergeWarnings: [
          {code: 'merged-save-format', formatRelease: '2.004'},
          {code: 'merged-save-section-dropped', section: 'terrainLayers'}
        ],
        legacyFormatCouldBeKept: true
      }));
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
    });
  });

  describe('When at least one save is invalid', () => {
    it('should present a validation error result without parsing the saves for the merge', async () => {
      // Arrange
      const invalidJsonError: ValidationIssue = {code: VALIDATION_ISSUE_CODES.INVALID_JSON, section: PLAYERS_SECTION, entryIndex: 0, line: 'contentA'};
      const {useCase, parser, presenter} = createUseCase({
        validate: validatorAnswering({contentA: rejectedWith(invalidJsonError)})
      });

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(parser.parse).not.toHaveBeenCalled();
      expect(presenter.presentSaveFilesInvalid).toHaveBeenCalledWith({
        saveA: {hasJsonExtension: true, errors: [invalidJsonError], warnings: []},
        saveB: {hasJsonExtension: true, errors: [], warnings: []}
      } satisfies SaveFilesInvalidResponse);
    });
  });

  describe('When a save file has no JSON extension', () => {
    it('should present that save as without JSON extension beside the findings of the other save', async () => {
      // Arrange
      const invalidJsonError: ValidationIssue = {code: VALIDATION_ISSUE_CODES.INVALID_JSON, section: PLAYERS_SECTION, entryIndex: 0, line: 'contentB'};
      const {useCase, presenter} = createUseCase({
        hasJsonExtension: (fileName: string) => fileName !== 'Save-A.txt',
        validate: validatorAnswering({contentB: {isValid: false, errors: [invalidJsonError], warnings: [{code: 'legacy-save-format'}]}})
      });

      // Act
      await useCase.execute({...TWO_VALID_SAVES, fileNameA: 'Save-A.txt'});

      // Assert
      expect(presenter.presentSaveFilesInvalid).toHaveBeenCalledWith({
        saveA: {hasJsonExtension: false},
        saveB: {hasJsonExtension: true, errors: [invalidJsonError], warnings: [{code: 'legacy-save-format'}]}
      } satisfies SaveFilesInvalidResponse);
    });

    it('should leave the content of that save unvalidated', async () => {
      // Arrange
      const {useCase, validator} = createUseCase({
        hasJsonExtension: (fileName: string) => fileName !== 'Save-A.txt'
      });

      // Act
      await useCase.execute({...TWO_VALID_SAVES, fileNameA: 'Save-A.txt'});

      // Assert
      expect(validator.validate).not.toHaveBeenCalledWith('contentA');
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

      describe('When save B is the one written by 1.618 or earlier', () => {
        it('should present the warning among those of save B', async () => {
          // Arrange
          const {useCase, presenter} = createUseCase({
            validate: validatorAnswering({contentB: acceptedWith({code: 'legacy-save-format'})})
          });

          // Act
          await useCase.execute(TWO_VALID_SAVES);

          // Assert
          expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith(expect.objectContaining({
            saveAWarnings: [],
            saveBWarnings: [{code: 'legacy-save-format'}]
          }));
        });
      });
    });

    describe('When the merge is rejected', () => {
      it('should present the warnings of each save', async () => {
        // Arrange
        const invalidJsonError: ValidationIssue = {code: VALIDATION_ISSUE_CODES.INVALID_JSON, section: PLAYERS_SECTION, entryIndex: 0, line: 'contentB'};
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
          saveA: {hasJsonExtension: true, errors: [], warnings: [{code: 'legacy-save-format'}]},
          saveB: {hasJsonExtension: true, errors: [invalidJsonError], warnings: []}
        } satisfies SaveFilesInvalidResponse);
      });
    });
  });

  describe('When the merged save does not pass validation', () => {
    const missingPlayerName: ValidationIssue = {
      code: VALIDATION_ISSUE_CODES.MISSING_FIELD,
      section: PLAYERS_SECTION,
      entryIndex: 0,
      fieldPath: '',
      missingFieldName: 'name'
    };

    const rejectOnlyTheMergedSave = validatorAnswering({'merged content': rejectedWith(missingPlayerName)});

    it('should present a success carrying the errors of the produced save', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase({validate: rejectOnlyTheMergedSave});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(presenter.presentMergeSucceeded).toHaveBeenCalledWith({
        fileName: 'Save-A-Save-B-merged.json',
        content: 'merged content',
        mergeErrors: [missingPlayerName],
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
    const unreadableLine: UnreadableLine = {code: 'invalid-json', section: INVENTORIES_SECTION, entryIndex: 0, line: '{not valid json'};
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

  describe('When a save designates no host or more than one', () => {
    const saveAWithTwoHosts: ParsedSaveSectionsResponse = {
      sections: createSaveSections({players: [createPlayerEntry({name: 'Nikowa', host: true}), createPlayerEntry({name: 'Sakia', host: true})]}),
      errors: noParseErrors
    };
    const parseSaveAWithTwoHosts = parserAnswering({contentA: saveAWithTwoHosts});

    it('should present the saves without a unique host, with the host count of the save at fault', async () => {
      // Arrange
      const {useCase, presenter} = createUseCase({
        validate: validatorAnswering({contentA: acceptedWith({code: 'legacy-save-format'})}),
        parse: parseSaveAWithTwoHosts
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
      const {useCase, serializer} = createUseCase({parse: parseSaveAWithTwoHosts});

      // Act
      await useCase.execute(TWO_VALID_SAVES);

      // Assert
      expect(serializer.serialize).not.toHaveBeenCalled();
    });

    describe('When save B alone designates a wrong number of hosts', () => {
      it('should present the host count of save B alone, with its warnings', async () => {
        // Arrange
        const {useCase, presenter} = createUseCase({
          validate: validatorAnswering({contentB: acceptedWith({code: 'legacy-save-format'})}),
          parse: parserAnswering({
            contentB: {sections: createSaveSections({players: [createPlayerEntry({name: 'Chileny', host: false})]}), errors: noParseErrors}
          })
        });

        // Act
        await useCase.execute(TWO_VALID_SAVES);

        // Assert
        expect(presenter.presentSaveFilesWithoutUniqueHost).toHaveBeenCalledWith({
          saveAWrongHostCount: undefined,
          saveBWrongHostCount: 0,
          saveAWarnings: [],
          saveBWarnings: [{code: 'legacy-save-format'}]
        } satisfies SaveFilesWithoutUniqueHostResponse);
      });
    });

    describe('When the other save designates a wrong number of hosts too', () => {
      it('should present the host count of each save', async () => {
        // Arrange
        const {useCase, presenter} = createUseCase({
          parse: parserAnswering({
            contentA: saveAWithTwoHosts,
            contentB: {sections: createSaveSections({players: [createPlayerEntry({name: 'Chileny', host: false})]}), errors: noParseErrors}
          })
        });

        // Act
        await useCase.execute(TWO_VALID_SAVES);

        // Assert
        expect(presenter.presentSaveFilesWithoutUniqueHost).toHaveBeenCalledWith({
          saveAWrongHostCount: 2,
          saveBWrongHostCount: 0,
          saveAWarnings: [],
          saveBWarnings: []
        } satisfies SaveFilesWithoutUniqueHostResponse);
      });
    });

    describe('When the other save has a line that cannot be read', () => {
      it('should present the merged save as unusable', async () => {
        // Arrange
        const unreadableLine: UnreadableLine = {code: 'invalid-json', section: INVENTORIES_SECTION, entryIndex: 0, line: '{not valid json'};
        const {useCase, presenter} = createUseCase({
          parse: parserAnswering({
            contentA: saveAWithTwoHosts,
            contentB: {sections: createSaveSections(), errors: [unreadableLine]}
          })
        });

        // Act
        await useCase.execute(TWO_VALID_SAVES);

        // Assert
        expect(presenter.presentMergedSaveUnusable).toHaveBeenCalled();
        expect(presenter.presentSaveFilesWithoutUniqueHost).not.toHaveBeenCalled();
      });
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
