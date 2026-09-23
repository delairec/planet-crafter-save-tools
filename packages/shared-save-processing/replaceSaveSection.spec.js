import {describe, it, expect} from 'bun:test';
import {replaceSaveSection} from './replaceSaveSection.js';

describe('replaceSaveSection', () => {

  describe('When a section other than the first or the last is replaced', () => {
    it('should return the save string with only that section changed', () => {
      // Arrange
      const saveString = 'metadata@players@worldObjects';

      // Act
      const result = replaceSaveSection(saveString, 1, () => 'newPlayers');

      // Assert
      expect(result).toBe('metadata@newPlayers@worldObjects');
    });

    it('should pass the current content of that section to the update function', () => {
      // Arrange
      const saveString = 'metadata@players@worldObjects';

      // Act
      const result = replaceSaveSection(saveString, 1, (currentSection) => `${currentSection}|\nextraEntry`);

      // Assert
      expect(result).toBe('metadata@players|\nextraEntry@worldObjects');
    });
  });

  describe('When the first section is replaced', () => {
    it('should return the save string with the first section changed', () => {
      // Arrange
      const saveString = 'metadata@players@worldObjects';

      // Act
      const result = replaceSaveSection(saveString, 0, () => '');

      // Assert
      expect(result).toBe('@players@worldObjects');
    });
  });

  describe('When the last section is replaced', () => {
    it('should return the save string with the last section changed', () => {
      // Arrange
      const saveString = 'metadata@players@worldObjects';

      // Act
      const result = replaceSaveSection(saveString, 2, () => '');

      // Assert
      expect(result).toBe('metadata@players@');
    });
  });

  describe('When the update function returns the same content it received', () => {
    it('should return a save string identical to the original', () => {
      // Arrange
      const saveString = 'metadata@players@worldObjects';

      // Act
      const result = replaceSaveSection(saveString, 1, (currentSection) => currentSection);

      // Assert
      expect(result).toBe(saveString);
    });
  });
});
