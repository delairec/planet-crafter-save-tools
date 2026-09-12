import {describe, expect, it} from 'bun:test';
import {decodeIdList, encodeIdList} from './idListCodec';

describe('Id list codec', () => {

  describe('When decoding a list of identifiers', () => {
    it('should read every identifier as a number', () => {
      // Act
      const ids = decodeIdList('79111656,58524136');

      // Assert
      expect<number[]>(ids).toEqual([79111656, 58524136]);
    });

    it('should read a single identifier', () => {
      // Act
      const ids = decodeIdList('79111656');

      // Assert
      expect<number[]>(ids).toEqual([79111656]);
    });

    it('should read an empty field as no identifier', () => {
      // Arrange
      const emptyIdList = '';

      // Act
      const ids = decodeIdList(emptyIdList);

      // Assert
      expect<number[]>(ids).toEqual([]);
    });

    it('should ignore a separator that carries no identifier', () => {
      // Act
      const ids = decodeIdList('79111656,');

      // Assert
      expect<number[]>(ids).toEqual([79111656]);
    });
  });

  describe('When encoding a list of identifiers', () => {
    it('should write the identifiers separated by a comma', () => {
      // Act
      const idList = encodeIdList([79111656, 58524136]);

      // Assert
      expect<string>(idList).toBe('79111656,58524136');
    });

    it('should write no identifier as an empty field', () => {
      // Arrange
      const noIds: number[] = [];

      // Act
      const idList = encodeIdList(noIds);

      // Assert
      expect<string>(idList).toBe('');
    });
  });
});
