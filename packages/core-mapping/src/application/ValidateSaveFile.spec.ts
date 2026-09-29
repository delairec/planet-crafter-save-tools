import {describe, expect, it, mock} from 'bun:test';
import {ValidateSaveFile} from './ValidateSaveFile';
import {SaveValidatorPort} from './ports/SaveValidatorPort';
import {SaveFileValidationPresenterPort} from './ports/SaveFileValidationPresenterPort';
import {SaveSectionsReaderPort} from './ports/SaveSectionsReaderPort';
import {ValidationIssue} from './ports/ValidationIssue';
import {VALIDATION_ISSUE_CODES} from './ports/validationIssueCodes';
import {UnreadableLine} from './ports/SaveSectionLocation';
import {SaveWarning} from 'shared-save-processing/gameDefinitions';
import {WORLD_OBJECTS_SECTION_INDEX} from 'shared-save-processing/sectionIndexes.js';
import {SAVE_CONTENT, stubSaveSectionsReader} from '../testing/stubSaveSectionsReader';
import {createPlayerFlaggedAsHost, SaveSectionsWithPlayers} from '../testing/SaveSectionsWithPlayers';

interface UseCaseOverrides {
  validationErrors?: ValidationIssue[];
  validationWarnings?: SaveWarning[];
  saveSectionsReader?: SaveSectionsReaderPort;
}

function setupUseCase({
                        validationErrors = [],
                        validationWarnings = [],
                        saveSectionsReader = stubSaveSectionsReader()
                      }: UseCaseOverrides = {}) {
  const validator: SaveValidatorPort = {
    validate: mock(() => ({isValid: validationErrors.length === 0, errors: validationErrors, warnings: validationWarnings}))
  };
  const reader: SaveSectionsReaderPort = {read: mock(saveSectionsReader.read)};
  const presenter: SaveFileValidationPresenterPort = {
    presentValidSaveFile: mock(),
    presentInvalidSaveFile: mock(),
    presentSaveFileWithUnreadableLines: mock(),
    presentSaveFileWithoutUniqueHost: mock()
  };

  return {useCase: new ValidateSaveFile(validator, reader, presenter), validator, reader, presenter};
}

describe('ValidateSaveFile', () => {

  describe('When the save file is valid', () => {
    it('should present a valid save file', async () => {
      // Arrange
      const {useCase, validator, presenter} = setupUseCase();

      // Act
      await useCase.execute({fileName: 'Save-A.json', content: SAVE_CONTENT});

      // Assert
      expect(validator.validate).toHaveBeenCalledWith('Save-A.json', SAVE_CONTENT);
      expect(presenter.presentValidSaveFile).toHaveBeenCalledWith([]);
      expect(presenter.presentInvalidSaveFile).not.toHaveBeenCalled();
      expect(presenter.presentSaveFileWithoutUniqueHost).not.toHaveBeenCalled();
    });
  });

  describe('When the save file is invalid', () => {
    it('should present an invalid save file with the validation errors and never read the content', async () => {
      // Arrange
      const validationErrors = [{code: VALIDATION_ISSUE_CODES.INVALID_EXTENSION}];
      const {useCase, reader, presenter} = setupUseCase({validationErrors});

      // Act
      await useCase.execute({fileName: 'Save-A.txt', content: SAVE_CONTENT});

      // Assert
      expect(presenter.presentInvalidSaveFile).toHaveBeenCalledWith(validationErrors, []);
      expect(presenter.presentValidSaveFile).not.toHaveBeenCalled();
      expect(reader.read).not.toHaveBeenCalled();
    });
  });

  describe('When the reader cannot read some lines of a valid save file', () => {
    it('should present the save file with its unreadable lines, never as a valid save file', async () => {
      // Arrange
      const unreadableLine: UnreadableLine = {section: {name: 'worldObjects', index: WORLD_OBJECTS_SECTION_INDEX}, entryIndex: 2, line: '{'};
      const {useCase, presenter} = setupUseCase({saveSectionsReader: stubSaveSectionsReader({unreadableLines: [unreadableLine]})});

      // Act
      await useCase.execute({fileName: 'Save-A.json', content: SAVE_CONTENT});

      // Assert
      expect(presenter.presentSaveFileWithUnreadableLines).toHaveBeenCalledWith([unreadableLine], []);
      expect(presenter.presentValidSaveFile).not.toHaveBeenCalled();
      expect(presenter.presentSaveFileWithoutUniqueHost).not.toHaveBeenCalled();
    });
  });

  describe('When the save designates no host', () => {
    it('should present the save file without a unique host, with the host count found', async () => {
      // Arrange
      const saveSections = new SaveSectionsWithPlayers([createPlayerFlaggedAsHost('Nikowa', false)]);
      const {useCase, presenter} = setupUseCase({saveSectionsReader: stubSaveSectionsReader({saveSections})});

      // Act
      await useCase.execute({fileName: 'Save-A.json', content: SAVE_CONTENT});

      // Assert
      expect(presenter.presentSaveFileWithoutUniqueHost).toHaveBeenCalledWith(0, []);
      expect(presenter.presentValidSaveFile).not.toHaveBeenCalled();
      expect(presenter.presentInvalidSaveFile).not.toHaveBeenCalled();
    });
  });

  describe('When the save designates more than one host', () => {
    it('should present the save file without a unique host, with its warnings', async () => {
      // Arrange
      const saveSections = new SaveSectionsWithPlayers([createPlayerFlaggedAsHost('Nikowa', true), createPlayerFlaggedAsHost('Sakia', true)]);
      const {useCase, presenter} = setupUseCase({
        validationWarnings: [{code: 'legacy-save-format'}],
        saveSectionsReader: stubSaveSectionsReader({saveSections})
      });

      // Act
      await useCase.execute({fileName: 'Save-A.json', content: SAVE_CONTENT});

      // Assert
      expect(presenter.presentSaveFileWithoutUniqueHost).toHaveBeenCalledWith(2, [{code: 'legacy-save-format'}]);
      expect(presenter.presentValidSaveFile).not.toHaveBeenCalled();
    });
  });

  describe('When validation reports that the save was written by 1.618 or earlier', () => {
    it('should present the warnings of a valid save file', async () => {
      // Arrange
      const {useCase, presenter} = setupUseCase({validationWarnings: [{code: 'legacy-save-format'}]});

      // Act
      await useCase.execute({fileName: 'Save-A.json', content: SAVE_CONTENT});

      // Assert
      expect(presenter.presentValidSaveFile).toHaveBeenCalledWith([{code: 'legacy-save-format'}]);
    });

    it('should present the warnings of an invalid save file too', async () => {
      // Arrange
      const validationErrors: ValidationIssue[] = [{code: VALIDATION_ISSUE_CODES.INVALID_JSON, section: {name: 'worldObjects', index: WORLD_OBJECTS_SECTION_INDEX}, entryIndex: 2, line: '{'}];
      const {useCase, presenter} = setupUseCase({validationErrors, validationWarnings: [{code: 'legacy-save-format'}]});

      // Act
      await useCase.execute({fileName: 'Save-A.json', content: SAVE_CONTENT});

      // Assert
      expect(presenter.presentInvalidSaveFile).toHaveBeenCalledWith(validationErrors, [{code: 'legacy-save-format'}]);
    });
  });
});
