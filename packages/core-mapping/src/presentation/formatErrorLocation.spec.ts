import {describe, expect, it} from 'bun:test';
import {formatErrorLocation} from './formatErrorLocation';

describe('formatErrorLocation', () => {

  describe('When the error was found in a save entry', () => {
    it('should name the section and the entry', () => {
      // Act
      const location = formatErrorLocation({section: {name: 'players', index: 2}, entryIndex: 3});

      // Assert
      expect(location).toBe('Players (section 2), entry 3');
    });
  });

  describe('When the error names a section but no entry', () => {
    it('should name the section alone', () => {
      // Act
      const location = formatErrorLocation({section: {name: 'globalMetadata', index: 0}});

      // Assert
      expect(location).toBe('Global metadata (section 0)');
    });
  });

  describe('When the save format places a section at another index', () => {
    it('should show the index the error carries beside the label', () => {
      // Act
      const location = formatErrorLocation({section: {name: 'worldEvents', index: 10}});

      // Assert
      expect(location).toBe('World events (section 10)');
    });
  });

  describe('When the error was found in the reserved part of the save', () => {
    it('should name that part by its index alone', () => {
      // Act
      const location = formatErrorLocation({section: {name: 'reserved', index: 10}, entryIndex: 1});

      // Assert
      expect(location).toBe('section 10, entry 1');
    });
  });
});
