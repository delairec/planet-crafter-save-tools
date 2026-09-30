import {describe, expect, it} from 'bun:test';
import {locateSaveSection} from './locateSaveSection';
import {SectionOutsideTheSaveFormatError} from './errors/SectionOutsideTheSaveFormatError';
import {SaveSectionLocation} from '../domain/save/SaveSectionLocation';
import {LEGACY_RESERVED_TRAILING_PART, LEGACY_TERRAIN_LAYERS_SECTION, RESERVED_TRAILING_PART, WORLD_EVENTS_SECTION, WORLD_OBJECTS_SECTION} from './testing/saveSectionLocations';

describe('locateSaveSection', () => {

  describe('When the index designates a section of the save format', () => {
    it('should name the section at that index', () => {
      // Act
      const location = locateSaveSection(WORLD_OBJECTS_SECTION.index, '2.004');

      // Assert
      expect<SaveSectionLocation>(location).toEqual(WORLD_OBJECTS_SECTION);
    });
  });

  describe('When the two save formats place different sections at the index', () => {
    it.each<[string, SaveSectionLocation]>([
      ['1.618', LEGACY_TERRAIN_LAYERS_SECTION],
      ['2.004', WORLD_EVENTS_SECTION]
    ])('should name the section the format of %s places there', (formatRelease, expectedLocation) => {
      // Act
      const location = locateSaveSection(expectedLocation.index, formatRelease);

      // Assert
      expect<SaveSectionLocation>(location).toEqual(expectedLocation);
    });
  });

  describe('When the index designates the empty part closing the save', () => {
    it.each<[string, SaveSectionLocation]>([
      ['1.618', LEGACY_RESERVED_TRAILING_PART],
      ['2.004', RESERVED_TRAILING_PART]
    ])('should name the reserved part of the format of %s', (formatRelease, reservedPart) => {
      // Act
      const location = locateSaveSection(reservedPart.index, formatRelease);

      // Assert
      expect<SaveSectionLocation>(location).toEqual(reservedPart);
    });
  });

  describe('When the index lies beyond the parts of the save format', () => {
    it('should fail rather than locate an issue nowhere', () => {
      // Arrange
      const indexBeyondTheFormat = 42;

      // Act
      const locating = () => locateSaveSection(indexBeyondTheFormat, '2.004');

      // Assert
      expect(locating).toThrow(SectionOutsideTheSaveFormatError);
      expect(locating).toThrow('Unexpected save data: the format of 2.004 holds no section 42.');
    });
  });
});
