import {describe, it, expect} from 'bun:test';
import {verifySectionCount} from './verifySectionCount.js';

describe('verifySectionCount', () => {

  describe('When the save splits into the parts of the current 11-part format', () => {
    it('should report no error', () => {
      // Arrange
      const saveContent = 'part0@part1@part2@part3@part4@part5@part6@part7@part8@part9@part10';

      // Act
      const errors = verifySectionCount(saveContent);

      // Assert
      expect(errors).toEqual([]);
    });
  });

  describe('When the save splits into the parts of the legacy 12-part format', () => {
    it('should report no error', () => {
      // Arrange
      const saveContent = 'part0@part1@part2@part3@part4@part5@part6@part7@part8@part9@part10@part11';

      // Act
      const errors = verifySectionCount(saveContent);

      // Assert
      expect(errors).toEqual([]);
    });
  });

  describe('When the save splits into the parts of neither the current nor the legacy format', () => {
    it('should report the count each format expects and the actual count', () => {
      // Arrange
      const saveContent = 'part0@part1';

      // Act
      const errors = verifySectionCount(saveContent);

      // Assert
      expect(errors).toEqual([{code: 'unexpected-section-count', foundSectionCount: 2, expectedSectionCounts: [11, 12]}]);
    });
  });
});
