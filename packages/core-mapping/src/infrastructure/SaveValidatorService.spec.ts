import {describe, expect, it} from 'bun:test';
import {SaveValidatorService} from './SaveValidatorService';
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue';
import {createFakeSaveContent, createLegacyFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {createSaveConfiguration, createWorldObject} from 'shared-save-processing/testing/createSaveRecords.js';

describe('SaveValidatorService', () => {

  describe('When the file name has an invalid extension', () => {
    it('should return an invalid result without checking the content', () => {
      // Arrange
      const service = new SaveValidatorService();
      const content = createFakeSaveContent();

      // Act
      const result = service.validate('Save-A.txt', content);

      // Assert
      expect(result).toEqual({
        isValid: false,
        errors: [{code: VALIDATION_ISSUE_CODES.INVALID_EXTENSION, detail: 'Invalid file extension: expected a .json file.'}],
        warnings: []
      });
    });
  });

  describe('When the file name has a valid extension and the save content is valid', () => {
    it('should return a valid result with no error messages', () => {
      // Arrange
      const service = new SaveValidatorService();
      const content = createFakeSaveContent();

      // Act
      const result = service.validate('Save-A.json', content);

      // Assert
      expect(result).toEqual({isValid: true, errors: [], warnings: []});
    });
  });

  describe('When the file name has a valid extension and the save content is invalid', () => {
    it('should return an invalid result with the validation errors', () => {
      // Arrange
      const service = new SaveValidatorService();
      const content = 'not a valid save at all';

      // Act
      const result = service.validate('Save-A.json', content);

      // Assert
      expect(result).toEqual({
        isValid: false,
        errors: [{code: VALIDATION_ISSUE_CODES.INVALID_STRUCTURE, detail: 'Expected 11 or 12 sections but found 1'}],
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
      const result = service.validate('Save-A.json', content);

      // Assert
      expect(result).toEqual({isValid: true, errors: [], warnings: [{code: 'legacy-save-format'}]});
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
      const result = service.validate('Save-A.json', content);

      // Assert
      expect(result).toEqual({isValid: true, errors: [], warnings: []});
    });
  });
});
