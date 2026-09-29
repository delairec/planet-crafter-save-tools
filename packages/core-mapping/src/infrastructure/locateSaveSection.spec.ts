import {describe, expect, it} from 'bun:test';
import {locateSaveSection} from './locateSaveSection';
import {SectionOutsideTheSaveFormatError} from './errors/SectionOutsideTheSaveFormatError';
import {SaveSectionLocation} from '../application/ports/SaveSectionLocation';

describe('locateSaveSection', () => {

  describe('When the index designates a section of the save format', () => {
    it('should name the section at that index', () => {
      // Act
      const location = locateSaveSection(3, '2.004');

      // Assert
      expect<SaveSectionLocation>(location).toEqual({name: 'worldObjects', index: 3});
    });
  });

  describe('When the two save formats place different sections at the index', () => {
    it.each<[string, SaveSectionLocation]>([
      ['1.618', {name: 'terrainLayers', index: 9}],
      ['2.004', {name: 'worldEvents', index: 9}]
    ])('should name the section the format of %s places there', (formatRelease, expectedLocation) => {
      // Act
      const location = locateSaveSection(9, formatRelease);

      // Assert
      expect<SaveSectionLocation>(location).toEqual(expectedLocation);
    });
  });

  describe('When the index designates the empty part closing the save', () => {
    it.each<[string, number]>([
      ['1.618', 11],
      ['2.004', 10]
    ])('should name the reserved part of the format of %s at index %p', (formatRelease, reservedIndex) => {
      // Act
      const location = locateSaveSection(reservedIndex, formatRelease);

      // Assert
      expect<SaveSectionLocation>(location).toEqual({name: 'reserved', index: reservedIndex});
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
