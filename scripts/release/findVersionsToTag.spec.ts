import {describe, expect, it} from 'bun:test';
import {type ConsumerVersion, findSinceTag, findVersionsToTag} from './findVersionsToTag.ts';

describe('findVersionsToTag', () => {

  describe('When one consumer declares a version no tag names yet', () => {
    it('should give that consumer only', () => {
      // Arrange
      const consumers = [
        {name: 'cli-merge', version: '1.0.1'},
        {name: 'ui-save-manager', version: '1.1.0'}
      ];
      const existingTags = ['before-awawa', 'cli-merge-v1.0.0', 'ui-save-manager-v1.1.0'];

      // Act
      const untaggedConsumers = findVersionsToTag(consumers, existingTags);

      // Assert
      expect(untaggedConsumers).toEqual([{name: 'cli-merge', version: '1.0.1'}]);
    });
  });

  describe('When every declared version is already tagged', () => {
    it('should give no consumer', () => {
      // Arrange
      const consumers = [{name: 'cli-validate', version: '1.0.0'}];
      const existingTags = ['cli-validate-v1.0.0'];

      // Act
      const untaggedConsumers = findVersionsToTag(consumers, existingTags);

      // Assert
      expect<ConsumerVersion[]>(untaggedConsumers).toEqual([]);
    });
  });
});

describe('findSinceTag', () => {

  describe('When the declared version is tagged', () => {
    it('should give the tag of that version', () => {
      // Arrange
      const consumer = {name: 'cli-merge', version: '0.2.0'};
      const existingTags = ['cli-merge-v0.1.0', 'cli-merge-v0.2.0'];

      // Act
      const sinceTag = findSinceTag(consumer, existingTags);

      // Assert
      expect(sinceTag).toBe('cli-merge-v0.2.0');
    });
  });

  describe('When the initial version carries no tag', () => {
    it('should give no tag, so the whole history is read', () => {
      // Arrange
      const consumer = {name: 'cli-merge', version: '0.0.0'};

      // Act
      const sinceTag = findSinceTag(consumer, ['before-awawa']);

      // Assert
      expect(sinceTag).toBeUndefined();
    });
  });

  describe('When a later version carries no tag', () => {
    it('should refuse, naming the missing tag', () => {
      // Arrange
      const consumer = {name: 'ui-save-manager', version: '0.1.0'};

      // Act
      const readSinceTag = () => findSinceTag(consumer, ['before-awawa']);

      // Assert
      expect(readSinceTag).toThrow('no tag ui-save-manager-v0.1.0 exists');
    });
  });
});
