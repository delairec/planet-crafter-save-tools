import {describe, expect, it} from 'bun:test';
import {resolveSectionIndexes} from './sectionIndexes.js';
import {UnknownFormatReleaseError} from './gameReleases.js';

describe('resolveSectionIndexes', () => {

  describe('When the save carries the format of 1.618', () => {
    it('should give the Terrain Layers section index 9 and the world events index 10', () => {
      // Act
      const sectionIndexes = resolveSectionIndexes('1.618');

      // Assert
      expect(sectionIndexes).toEqual({
        globalMetadata: 0,
        terraformationLevels: 1,
        players: 2,
        worldObjects: 3,
        inventories: 4,
        statistics: 5,
        mailboxMessages: 6,
        storyEvents: 7,
        saveConfiguration: 8,
        terrainLayers: 9,
        worldEvents: 10
      });
    });
  });

  describe('When the save carries the format of 2.004', () => {
    it.each(['2.004', '2.102'])('should give the world events index 9 and no Terrain Layers section to a save of %s', (formatRelease) => {
      // Act
      const sectionIndexes = resolveSectionIndexes(formatRelease);

      // Assert
      expect(sectionIndexes).toEqual({
        globalMetadata: 0,
        terraformationLevels: 1,
        players: 2,
        worldObjects: 3,
        inventories: 4,
        statistics: 5,
        mailboxMessages: 6,
        storyEvents: 7,
        saveConfiguration: 8,
        worldEvents: 9
      });
    });
  });

  describe('When no release of the table writes the format asked for', () => {
    it.each([undefined, '0.9'])('should fail with an UnknownFormatReleaseError for %p', (formatRelease) => {
      // Act
      const resolving = () => resolveSectionIndexes(formatRelease);

      // Assert
      expect(resolving).toThrow(UnknownFormatReleaseError);
    });
  });
});
