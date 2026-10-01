import {describe, expect, it, mock} from 'bun:test';
import {ValidateSaveFile} from './ValidateSaveFile';
import {SaveValidatorPort} from '../../save/application/ports/SaveValidatorPort';
import {SaveFileValidationPresenterPort} from './ports/SaveFileValidationPresenterPort';
import {SaveSectionsParserPort} from '../../save/application/ports/SaveSectionsParserPort';
import {ValidationIssue} from '../../save/domain/validation/ValidationIssue';
import {VALIDATION_ISSUE_CODES} from '../../save/domain/validation/validationIssueCodes';
import {UnreadableLine} from '../../save/domain/save/SaveSectionLocation';
import {PlayerEntry} from '../../save/domain/save/PlayerEntry';
import type {SaveWarning} from "../../save/domain/validation/SaveWarning";
import {stubGameReleasesReader} from '../../save/testing/stubGameReleasesReader';
import {GLOBAL_METADATA_SECTION, WORLD_OBJECTS_SECTION} from '../../save/testing/saveSectionLocations';
import {createPlayerEntry} from '../../save/testing/createSaveEntries';
import {createSaveSections} from '../../save/testing/createSaveSections';
import {CarriedAndDeclaredReleases} from '../../save/domain/rules/detectDeclaredReleaseContradiction';

const SAVE_CONTENT = 'save content';

const UNEXPECTED_CONTENT_LINE: UnreadableLine = {
  code: 'invalid-json',
  section: GLOBAL_METADATA_SECTION,
  entryIndex: 0,
  line: `The parser double parses only "${SAVE_CONTENT}"`
};

interface UseCaseOverrides {
  fileHasJsonExtension?: boolean;
  validationErrors?: ValidationIssue[];
  validationWarnings?: SaveWarning[];
  declaredAndCarriedReleases?: CarriedAndDeclaredReleases;
  players?: PlayerEntry[];
  unreadableLines?: UnreadableLine[];
}

function setupUseCase({
                        fileHasJsonExtension = true,
                        validationErrors = [],
                        validationWarnings = [],
                        declaredAndCarriedReleases = {declaredVersion: undefined, carriedRelease: undefined},
                        players = [createPlayerEntry({name: 'Nikowa', host: true})],
                        unreadableLines = []
                      }: UseCaseOverrides = {}) {
  const validator: SaveValidatorPort = {
    hasJsonExtension: mock(() => fileHasJsonExtension),
    validate: mock(() => ({isValid: validationErrors.length === 0, errors: validationErrors, warnings: validationWarnings, ...declaredAndCarriedReleases}))
  };
  const parser: SaveSectionsParserPort = {
    parse: mock((content: string) => ({sections: createSaveSections({players}), errors: content === SAVE_CONTENT ? unreadableLines : [UNEXPECTED_CONTENT_LINE]}))
  };
  const presenter: SaveFileValidationPresenterPort = {
    presentFileWithoutJsonExtension: mock(),
    presentValidSaveFile: mock(),
    presentInvalidSaveFile: mock(),
    presentSaveFileWithUnreadableLines: mock(),
    presentSaveFileWithoutUniqueHost: mock()
  };

  return {useCase: new ValidateSaveFile(validator, parser, stubGameReleasesReader(), presenter), validator, parser, presenter};
}

describe('ValidateSaveFile', () => {

  describe('When the release the save declares contradicts the format it carries', () => {
    const contradictingReleases: CarriedAndDeclaredReleases = {declaredVersion: '2.103', carriedRelease: '1.618'};

    it('should present the contradiction among the warnings of the save', async () => {
      // Arrange
      const {useCase, presenter} = setupUseCase({declaredAndCarriedReleases: contradictingReleases});

      // Act
      await useCase.execute({fileName: 'Save-A.json', content: SAVE_CONTENT});

      // Assert
      expect(presenter.presentValidSaveFile).toHaveBeenCalledWith([
        {code: 'declared-release-contradicts-content', declaredVersion: '2.103', declaredRelease: '2.102', carriedRelease: '1.618'}
      ]);
    });

    describe('When the validation refuses the save', () => {
      it('should present the contradiction beside the validation errors', async () => {
        // Arrange
        const validationErrors: ValidationIssue[] = [{code: VALIDATION_ISSUE_CODES.INVALID_JSON, section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{'}];
        const {useCase, presenter} = setupUseCase({validationErrors, declaredAndCarriedReleases: contradictingReleases});

        // Act
        await useCase.execute({fileName: 'Save-A.json', content: SAVE_CONTENT});

        // Assert
        expect(presenter.presentInvalidSaveFile).toHaveBeenCalledWith({
          errors: [{code: 'invalid-json', section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{'}],
          warnings: [{code: 'declared-release-contradicts-content', declaredVersion: '2.103', declaredRelease: '2.102', carriedRelease: '1.618'}]
        });
      });
    });

    describe('When some lines of the save cannot be read', () => {
      it('should present the contradiction beside the unreadable lines', async () => {
        // Arrange
        const unreadableLine: UnreadableLine = {code: 'invalid-json', section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{'};
        const {useCase, presenter} = setupUseCase({unreadableLines: [unreadableLine], declaredAndCarriedReleases: contradictingReleases});

        // Act
        await useCase.execute({fileName: 'Save-A.json', content: SAVE_CONTENT});

        // Assert
        expect(presenter.presentSaveFileWithUnreadableLines).toHaveBeenCalledWith({
          unreadableLines: [{code: 'invalid-json', section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{'}],
          warnings: [{code: 'declared-release-contradicts-content', declaredVersion: '2.103', declaredRelease: '2.102', carriedRelease: '1.618'}]
        });
      });
    });

    describe('When the save designates a wrong number of hosts too', () => {
      it('should present the contradiction beside the host count found', async () => {
        // Arrange
        const {useCase, presenter} = setupUseCase({
          players: [createPlayerEntry({name: 'Nikowa', host: true}), createPlayerEntry({name: 'Sakia', host: true})],
          declaredAndCarriedReleases: contradictingReleases
        });

        // Act
        await useCase.execute({fileName: 'Save-A.json', content: SAVE_CONTENT});

        // Assert
        expect(presenter.presentSaveFileWithoutUniqueHost).toHaveBeenCalledWith(2, [
          {code: 'declared-release-contradicts-content', declaredVersion: '2.103', declaredRelease: '2.102', carriedRelease: '1.618'}
        ]);
      });
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
      const unreadableLine: UnreadableLine = {code: 'invalid-json', section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{'};
      const {useCase, presenter} = setupUseCase({
        validationWarnings: [{code: 'legacy-save-format'}],
        unreadableLines: [unreadableLine]
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
      const {useCase, parser, presenter} = setupUseCase({validationErrors});

      // Act
      await useCase.execute({fileName: 'Save-A.json', content: SAVE_CONTENT});

      // Assert
      expect(presenter.presentInvalidSaveFile).toHaveBeenCalledWith({errors: validationErrors, warnings: []});
      expect(presenter.presentValidSaveFile).not.toHaveBeenCalled();
      expect(parser.parse).not.toHaveBeenCalled();
    });
  });

  describe('When some lines of a valid save file cannot be read', () => {
    it('should present the save file with its unreadable lines, never as a valid save file', async () => {
      // Arrange
      const unreadableLine: UnreadableLine = {code: 'invalid-json', section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{'};
      const {useCase, presenter} = setupUseCase({unreadableLines: [unreadableLine]});

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
      const {useCase, presenter} = setupUseCase({players: [createPlayerEntry({name: 'Nikowa', host: false})]});

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
      const {useCase, presenter} = setupUseCase({
        validationWarnings: [{code: 'legacy-save-format'}],
        players: [createPlayerEntry({name: 'Nikowa', host: true}), createPlayerEntry({name: 'Sakia', host: true})]
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
