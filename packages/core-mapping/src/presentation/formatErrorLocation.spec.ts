import {describe, expect, it} from 'bun:test';
import {formatErrorLocation} from './formatErrorLocation';
import {GLOBAL_METADATA_SECTION, LEGACY_WORLD_EVENTS_SECTION, PLAYERS_SECTION, RESERVED_TRAILING_PART} from '../testing/saveSectionLocations';

describe('formatErrorLocation', () => {

  describe('When the error was found in a save entry', () => {
    it('should name the section and the entry', () => {
      // Act
      const location = formatErrorLocation({section: PLAYERS_SECTION, entryIndex: 3});

      // Assert
      expect(location).toBe(`Players (section ${PLAYERS_SECTION.index}), entry 3`);
    });
  });

  describe('When the error names a section but no entry', () => {
    it('should name the section alone', () => {
      // Act
      const location = formatErrorLocation({section: GLOBAL_METADATA_SECTION});

      // Assert
      expect(location).toBe(`Global metadata (section ${GLOBAL_METADATA_SECTION.index})`);
    });
  });

  describe('When the save format places a section at another index', () => {
    it('should show the index the error carries beside the label', () => {
      // Act
      const location = formatErrorLocation({section: LEGACY_WORLD_EVENTS_SECTION});

      // Assert
      expect(location).toBe(`World events (section ${LEGACY_WORLD_EVENTS_SECTION.index})`);
    });
  });

  describe('When the error was found in the reserved part of the save', () => {
    it('should name that part by its index alone', () => {
      // Act
      const location = formatErrorLocation({section: RESERVED_TRAILING_PART, entryIndex: 1});

      // Assert
      expect(location).toBe(`section ${RESERVED_TRAILING_PART.index}, entry 1`);
    });
  });
});
