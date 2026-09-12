import {describe, expect, it} from 'bun:test';
import {parseIdList, serializeIdList} from './idList.js';

describe('Id list', () => {

  describe('When parsing a list of identifiers', () => {
    it('should read every identifier as a number', () => {
      // Act
      const ids = parseIdList('79111656,58524136');

      // Assert
      expect(ids).toEqual([79111656, 58524136]);
    });

    it('should read a single identifier', () => {
      // Act
      const ids = parseIdList('79111656');

      // Assert
      expect(ids).toEqual([79111656]);
    });

    it('should read an empty field as no identifier', () => {
      // Arrange
      const emptyIdList = '';

      // Act
      const ids = parseIdList(emptyIdList);

      // Assert
      expect(ids).toEqual([]);
    });

    it('should ignore a separator that carries no identifier', () => {
      // Act
      const ids = parseIdList('79111656,');

      // Assert
      expect(ids).toEqual([79111656]);
    });
  });

  describe('When serializing a list of identifiers', () => {
    it('should write the identifiers separated by a comma', () => {
      // Act
      const idList = serializeIdList([79111656, 58524136]);

      // Assert
      expect(idList).toBe('79111656,58524136');
    });

    it('should write no identifier as an empty field', () => {
      // Arrange
      const noIds = [];

      // Act
      const idList = serializeIdList(noIds);

      // Assert
      expect(idList).toBe('');
    });
  });
});
