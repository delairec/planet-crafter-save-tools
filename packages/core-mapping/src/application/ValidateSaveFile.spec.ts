import {describe, expect, it, mock} from 'bun:test';
import {ValidateSaveFile} from './ValidateSaveFile';
import {SaveValidatorPort} from './ports/SaveValidatorPort';
import {SaveFileValidationPresenterPort} from './ports/SaveFileValidationPresenterPort';
import {SaveSectionsReaderPort} from './ports/SaveSectionsReaderPort';
import {ValidationIssue} from '../domain/validation/ValidationIssue';
import {VALIDATION_ISSUE_CODES} from '../domain/validation/validationIssueCodes';
import {UnreadableLine} from '../domain/save/SaveSectionLocation';
import type {SaveWarningResponse} from "./responses/SaveWarningResponse";
import {SAVE_CONTENT, stubSaveSectionsReader} from '../testing/stubSaveSectionsReader';
import {stubGameReleasesReader} from '../testing/stubGameReleasesReader';
import {WORLD_OBJECTS_SECTION} from '../testing/saveSectionLocations';
import {CarriedAndDeclaredReleases} from '../domain/rules/detectDeclaredReleaseContradiction';
import {createPlayerFlaggedAsHost, SaveSectionsWithPlayers} from '../testing/SaveSectionsWithPlayers';

interface UseCaseOverrides {
  fileHasJsonExtension?: boolean;
  validationErrors?: ValidationIssue[];
  validationWarnings?: SaveWarningResponse[];
  declaredAndCarriedReleases?: CarriedAndDeclaredReleases;
  saveSectionsReader?: SaveSectionsReaderPort;
}

function setupUseCase({
                        fileHasJsonExtension = true,
                        validationErrors = [],
                        validationWarnings = [],
                        declaredAndCarriedReleases = {declaredVersion: undefined, carriedRelease: undefined},
                        saveSectionsReader = stubSaveSectionsReader()
                      }: UseCaseOverrides = {}) {
  const validator: SaveValidatorPort = {
    hasJsonExtension: mock(() => fileHasJsonExtension),
    validate: mock(() => ({isValid: validationErrors.length === 0, errors: validationErrors, warnings: validationWarnings, ...declaredAndCarriedReleases}))
  };
  const reader: SaveSectionsReaderPort = {read: mock(saveSectionsReader.read)};
  const presenter: SaveFileValidationPresenterPort = {
    presentFileWithoutJsonExtension: mock(),
    presentValidSaveFile: mock(),
    presentInvalidSaveFile: mock(),
    presentSaveFileWithUnreadableLines: mock(),
    presentSaveFileWithoutUniqueHost: mock()
  };

  return {useCase: new ValidateSaveFile(validator, reader, stubGameReleasesReader(), presenter), validator, reader, presenter};
}

describe('ValidateSaveFile', () => {

  describe('When the release the save declares contradicts the format it carries', () => {
    it('should present the contradiction after the warnings of the validation', async () => {
      // Arrange
      const {useCase, presenter} = setupUseCase({
        validationWarnings: [{code: 'legacy-save-format'}],
        declaredAndCarriedReleases: {declaredVersion: '2.103', carriedRelease: '1.618'}
      });

      // Act
      await useCase.execute({fileName: 'Save-A.json', content: SAVE_CONTENT});

      // Assert
      expect(presenter.presentValidSaveFile).toHaveBeenCalledWith([
        {code: 'legacy-save-format'},
        {code: 'declared-release-contradicts-content', declaredVersion: '2.103', declaredRelease: '2.102', carriedRelease: '1.618'}
      ]);
    });
  });

  describe('When the save file is valid', () => {
    it('should present a valid save file', async () => {
      // Arrange
      const {useCase, validator, presenter} = setupUseCase();

      // Act
      await useCase.execute({fileName: 'Save-A.json', content: SAVE_CONTENT});

      // Assert
      expect(validator.validate).toHaveBeenCalledWith(SAVE_CONTENT);
      expect(presenter.presentValidSaveFile).toHaveBeenCalledWith([]);
      expect(presenter.presentInvalidSaveFile).not.toHaveBeenCalled();
      expect(presenter.presentSaveFileWithoutUniqueHost).not.toHaveBeenCalled();
    });

    it('should keep the warnings alongside the unreadable lines', async () => {
      // Arrange
      const unreadableLine: UnreadableLine = {section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{'};
      const {useCase, presenter} = setupUseCase({
        validationWarnings: [{code: 'legacy-save-format'}],
        saveSectionsReader: stubSaveSectionsReader({unreadableLines: [unreadableLine]})
      });

      // Act
      await useCase.execute({fileName: 'Save-A.json', content: SAVE_CONTENT});

      // Assert
      expect(presenter.presentSaveFileWithUnreadableLines).toHaveBeenCalledWith({unreadableLines: [unreadableLine], warnings: [{code: 'legacy-save-format'}]});
    });
  });

  describe('When the file has no JSON extension', () => {
    it('should reject the file before validating its content', async () => {
      // Arrange
      const {useCase, validator, presenter} = setupUseCase({fileHasJsonExtension: false});

      // Act
      await useCase.execute({fileName: 'Save-A.txt', content: SAVE_CONTENT});

      // Assert
      expect(presenter.presentFileWithoutJsonExtension).toHaveBeenCalledTimes(1);
      expect(validator.validate).not.toHaveBeenCalled();
      expect(presenter.presentInvalidSaveFile).not.toHaveBeenCalled();
    });
  });

  describe('When the save file is invalid', () => {
    it('should present an invalid save file with the validation errors and never read the content', async () => {
      // Arrange
      const validationErrors: ValidationIssue[] = [{code: VALIDATION_ISSUE_CODES.UNEXPECTED_SECTION_COUNT, foundSectionCount: 3, expectedSectionCounts: [11, 12]}];
      const {useCase, reader, presenter} = setupUseCase({validationErrors});

      // Act
      await useCase.execute({fileName: 'Save-A.json', content: SAVE_CONTENT});

      // Assert
      expect(presenter.presentInvalidSaveFile).toHaveBeenCalledWith({errors: validationErrors, warnings: []});
      expect(presenter.presentValidSaveFile).not.toHaveBeenCalled();
      expect(reader.read).not.toHaveBeenCalled();
    });
  });

  describe('When the reader cannot read some lines of a valid save file', () => {
    it('should present the save file with its unreadable lines, never as a valid save file', async () => {
      // Arrange
      const unreadableLine: UnreadableLine = {section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{'};
      const {useCase, presenter} = setupUseCase({saveSectionsReader: stubSaveSectionsReader({unreadableLines: [unreadableLine]})});

      // Act
      await useCase.execute({fileName: 'Save-A.json', content: SAVE_CONTENT});

      // Assert
      expect(presenter.presentSaveFileWithUnreadableLines).toHaveBeenCalledWith({unreadableLines: [unreadableLine], warnings: []});
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
      const validationErrors: ValidationIssue[] = [{code: VALIDATION_ISSUE_CODES.INVALID_JSON, section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{'}];
      const {useCase, presenter} = setupUseCase({validationErrors, validationWarnings: [{code: 'legacy-save-format'}]});

      // Act
      await useCase.execute({fileName: 'Save-A.json', content: SAVE_CONTENT});

      // Assert
      expect(presenter.presentInvalidSaveFile).toHaveBeenCalledWith({errors: validationErrors, warnings: [{code: 'legacy-save-format'}]});
    });
  });
});
