import {describe, expect, it} from 'bun:test';
import {MergedFileName, nameMergedFile} from './nameMergedFile';

describe('nameMergedFile', () => {

  describe('When both file names carry a .json extension', () => {
    it('should combine both file names, stripping their extension, and hand over the stem the merged save is named after', () => {
      // Act
      const result = nameMergedFile({fileNameA: 'Standard-1.json', fileNameB: 'Standard-2.json'});

      // Assert
      expect<MergedFileName>(result).toEqual({fileName: 'Standard-1-Standard-2-merged.json', stem: 'Standard-1-Standard-2-merged'});
    });
  });

  describe('When the file names have no .json extension', () => {
    it('should combine both file names as they are', () => {
      // Act
      const result = nameMergedFile({fileNameA: 'Standard-1', fileNameB: 'Standard-2'});

      // Assert
      expect(result.fileName).toBe('Standard-1-Standard-2-merged.json');
    });
  });

  describe('When a file name holds path separators or unsafe characters', () => {
    it('should remove them from the merged file name', () => {
      // Act
      const result = nameMergedFile({fileNameA: '../malicious/<script>', fileNameB: 'safe.JSON'});

      // Assert
      expect(result.fileName).toBe('_malicious__script_-safe-merged.json');
    });
  });
});
