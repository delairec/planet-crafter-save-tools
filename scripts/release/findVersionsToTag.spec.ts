import {describe, expect, it} from 'bun:test';
import {findVersionsToTag} from './findVersionsToTag.ts';

describe('findVersionsToTag', () => {

  describe('When one consumer declares a version no tag names yet', () => {
    it('should give the tag of that version only', () => {
      // Arrange
      const consumers = [
        {name: 'cli-merge', version: '1.0.1'},
        {name: 'ui-save-manager', version: '1.1.0'}
      ];
      const existingTags = ['before-awawa', 'cli-merge-v1.0.0', 'ui-save-manager-v1.1.0'];

      // Act
      const tags = findVersionsToTag(consumers, existingTags);

      // Assert
      expect(tags).toEqual(['cli-merge-v1.0.1']);
    });
  });

  describe('When every declared version is already tagged', () => {
    it('should give no tag', () => {
      // Arrange
      const consumers = [{name: 'cli-validate', version: '1.0.0'}];
      const existingTags = ['cli-validate-v1.0.0'];

      // Act
      const tags = findVersionsToTag(consumers, existingTags);

      // Assert
      expect<string[]>(tags).toEqual([]);
    });
  });
});
