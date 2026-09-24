import {describe, expect, it} from 'bun:test';
import {formatErrorLocation} from './formatErrorLocation';
import {
  GLOBAL_METADATA_SECTION_INDEX,
  INVENTORIES_SECTION_INDEX,
  LEGACY_TERRAIN_LAYERS_SECTION_INDEX,
  LEGACY_WORLD_EVENTS_SECTION_INDEX,
  MAILBOX_MESSAGES_SECTION_INDEX,
  PLAYERS_SECTION_INDEX,
  SAVE_CONFIGURATION_SECTION_INDEX,
  STATISTICS_SECTION_INDEX,
  STORY_EVENTS_SECTION_INDEX,
  TERRAFORMATION_LEVELS_SECTION_INDEX,
  WORLD_EVENTS_SECTION_INDEX,
  WORLD_OBJECTS_SECTION_INDEX
} from 'shared-save-processing/sectionIndexes.js';

describe('formatErrorLocation', () => {

  describe('When the error was found in a save entry', () => {
    it('should name the section and the entry', () => {
      // Act
      const location = formatErrorLocation({section: PLAYERS_SECTION_INDEX, entryIndex: 3, formatRelease: '2.004'});

      // Assert
      expect(location).toBe('Players (section 2), entry 3');
    });
  });

  describe('When the error concerns the whole file', () => {
    it('should report no location at all', () => {
      // Arrange
      const errorWithoutLocation = {};

      // Act
      const location = formatErrorLocation(errorWithoutLocation);

      // Assert
      expect(location).toBeNull();
    });
  });

  describe('When the error names a section but no entry', () => {
    it('should name the section alone', () => {
      // Act
      const location = formatErrorLocation({section: GLOBAL_METADATA_SECTION_INDEX, formatRelease: '2.004'});

      // Assert
      expect(location).toBe('Global metadata (section 0)');
    });
  });

  describe('When the section has no label', () => {
    it('should fall back to the bare section index', () => {
      // Arrange
      const sectionOutsideTheSaveFormat = 42;

      // Act
      const location = formatErrorLocation({section: sectionOutsideTheSaveFormat, entryIndex: 1, formatRelease: '2.004'});

      // Assert
      expect(location).toBe('section 42, entry 1');
    });
  });

  describe('When the save carries a part count no release writes', () => {
    it('should fall back to the bare section index', () => {
      // Act
      const location = formatErrorLocation({section: TERRAFORMATION_LEVELS_SECTION_INDEX, entryIndex: 0});

      // Assert
      expect(location).toBe('section 1, entry 0');
    });
  });

  describe('When the save carries the format of 1.618', () => {
    it.each([
      [LEGACY_TERRAIN_LAYERS_SECTION_INDEX, 'Terrain layers (section 9)'],
      [LEGACY_WORLD_EVENTS_SECTION_INDEX, 'World events (section 10)']
    ])('should name section %p by the label that format gives it', (section, expectedLocation) => {
      // Act
      const location = formatErrorLocation({section, formatRelease: '1.618'});

      // Assert
      expect(location).toBe(expectedLocation);
    });
  });

  describe('When the save carries the format of 2.004', () => {
    it('should name section 9 the world events', () => {
      // Act
      const location = formatErrorLocation({section: WORLD_EVENTS_SECTION_INDEX, formatRelease: '2.004'});

      // Assert
      expect(location).toBe('World events (section 9)');
    });
  });

  describe('When every section of each format is located', () => {
    it.each([
      ['2.004', GLOBAL_METADATA_SECTION_INDEX],
      ['2.004', TERRAFORMATION_LEVELS_SECTION_INDEX],
      ['2.004', PLAYERS_SECTION_INDEX],
      ['2.004', WORLD_OBJECTS_SECTION_INDEX],
      ['2.004', INVENTORIES_SECTION_INDEX],
      ['2.004', STATISTICS_SECTION_INDEX],
      ['2.004', MAILBOX_MESSAGES_SECTION_INDEX],
      ['2.004', STORY_EVENTS_SECTION_INDEX],
      ['2.004', SAVE_CONFIGURATION_SECTION_INDEX],
      ['2.004', WORLD_EVENTS_SECTION_INDEX],
      ['1.618', GLOBAL_METADATA_SECTION_INDEX],
      ['1.618', TERRAFORMATION_LEVELS_SECTION_INDEX],
      ['1.618', PLAYERS_SECTION_INDEX],
      ['1.618', WORLD_OBJECTS_SECTION_INDEX],
      ['1.618', INVENTORIES_SECTION_INDEX],
      ['1.618', STATISTICS_SECTION_INDEX],
      ['1.618', MAILBOX_MESSAGES_SECTION_INDEX],
      ['1.618', STORY_EVENTS_SECTION_INDEX],
      ['1.618', SAVE_CONFIGURATION_SECTION_INDEX],
      ['1.618', LEGACY_TERRAIN_LAYERS_SECTION_INDEX],
      ['1.618', LEGACY_WORLD_EVENTS_SECTION_INDEX]
    ])('should leave no section of the format of %s on the bare index, section %p included', (formatRelease, section) => {
      // Act
      const location = formatErrorLocation({section, formatRelease});

      // Assert
      expect(location).not.toStartWith('section ');
    });
  });
});
