import {describe, expect, it} from 'bun:test';
import {SaveValidatorService} from './SaveValidatorService';
import {VALIDATION_ISSUE_CODES} from '../domain/validation/validationIssueCodes';
import {createFakeSaveContent, createLegacyFakeSaveContent} from './wireFormat/testing/createFakeSaveContent.js';
import {createSaveConfiguration, createWorldObject} from './wireFormat/testing/createSaveRecords.js';

describe('SaveValidatorService', () => {

  describe('When checking the extension of a file name', () => {
    it.each([
      ['Save-A.json', true],
      ['Save-A.JSON', true],
      ['Save-A.txt', false]
    ])('should tell whether %p has a JSON extension', (fileName, expectedAnswer) => {
      // Arrange
      const service = new SaveValidatorService();

      // Act
      const hasJsonExtension = service.hasJsonExtension(fileName);

      // Assert
      expect(hasJsonExtension).toBe(expectedAnswer);
    });
  });

  describe('When the save content is valid', () => {
    it('should return a valid result with no error messages', () => {
      // Arrange
      const service = new SaveValidatorService();
      const content = createFakeSaveContent();

      // Act
      const result = service.validate(content);

      // Assert
      expect(result).toEqual({isValid: true, errors: [], warnings: [], declaredVersion: '2.004', carriedRelease: '2.004'});
    });
  });

  describe('When the save content is invalid', () => {
    it('should return an invalid result with the validation errors', () => {
      // Arrange
      const service = new SaveValidatorService();
      const content = 'not a valid save at all';

      // Act
      const result = service.validate(content);

      // Assert
      expect(result).toEqual({
        isValid: false,
        errors: [{code: VALIDATION_ISSUE_CODES.UNEXPECTED_SECTION_COUNT, foundSectionCount: 1, expectedSectionCounts: [11, 12]}],
        warnings: []
      });
    });
  });

  describe('When the save content is in the legacy format', () => {
    it('should return a valid result reporting the legacy save format warning', () => {
      // Arrange
      const service = new SaveValidatorService();
      const content = createLegacyFakeSaveContent();

      // Act
      const result = service.validate(content);

      // Assert
      expect(result).toEqual({isValid: true, errors: [], warnings: [{code: 'legacy-save-format'}], declaredVersion: '1.618', carriedRelease: '1.618'});
    });
  });

  describe('When the save carries a group id that game release 2.102 deprecated', () => {
    it.each(['Phytoplankton2', 'Phytoplankton3'])('should return a valid result with no warning for %s', (deprecatedGroupId) => {
      // Arrange
      const service = new SaveValidatorService();
      const content = createFakeSaveContent({
        saveConfiguration: createSaveConfiguration({version: '2.102'}),
        worldObjects: [createWorldObject({id: 79111656, gId: deprecatedGroupId})]
      });

      // Act
      const result = service.validate(content);

      // Assert
      expect(result).toEqual({isValid: true, errors: [], warnings: [], declaredVersion: '2.102', carriedRelease: '2.004'});
    });
  });
});
