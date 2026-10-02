import {describe, it, expect} from 'bun:test';
import {stripJsonExtension} from './jsonExtension.js';

describe('stripJsonExtension', () => {

  describe('When the file name ends with .json', () => {
    it('should return the file name without its extension', () => {
      // Arrange
      const fileName = 'Save-A.json';

      // Act
      const result = stripJsonExtension(fileName);

      // Assert
      expect(result).toBe('Save-A');
    });
  });

  describe('When the file name ends with .JSON in a different case', () => {
    it('should return the file name without its extension', () => {
      // Arrange
      const fileName = 'Save-A.JSON';

      // Act
      const result = stripJsonExtension(fileName);

      // Assert
      expect(result).toBe('Save-A');
    });
  });

  describe('When the file name does not end with .json', () => {
    it('should return the file name unchanged', () => {
      // Arrange
      const fileName = 'Save-A.txt';

      // Act
      const result = stripJsonExtension(fileName);

      // Assert
      expect(result).toBe('Save-A.txt');
    });
  });

  describe('When the file name carries json somewhere other than its extension', () => {
    it('should only remove the trailing extension', () => {
      // Arrange
      const fileName = 'Save.json.backup.json';

      // Act
      const result = stripJsonExtension(fileName);

      // Assert
      expect(result).toBe('Save.json.backup');
    });
  });
});
