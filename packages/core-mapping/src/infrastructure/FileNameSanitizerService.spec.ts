import {describe, expect, it} from 'bun:test';
import {SanitizedFileNameResponse} from '../application/responses/SanitizedFileNameResponse';
import {FileNameSanitizerService} from './FileNameSanitizerService';

describe('FileNameSanitizerService', () => {

  describe('When the source file names carry a .json extension', () => {
    it('should join them without their extension, append the suffix and hand over the stem the file is named after', () => {
      // Act
      const result = new FileNameSanitizerService().sanitize({sourceFileNames: ['Standard-1.json', 'Standard-2.json'], suffix: '-merged'});

      // Assert
      expect<SanitizedFileNameResponse>(result).toEqual({fileName: 'Standard-1-Standard-2-merged.json', stem: 'Standard-1-Standard-2-merged'});
    });
  });

  describe('When the source file names have no .json extension', () => {
    it('should join them as they are', () => {
      // Act
      const result = new FileNameSanitizerService().sanitize({sourceFileNames: ['Standard-1', 'Standard-2'], suffix: '-merged'});

      // Assert
      expect(result.fileName).toBe('Standard-1-Standard-2-merged.json');
    });
  });

  describe('When a source file name holds path separators or unsafe characters', () => {
    it('should remove them from the file name', () => {
      // Act
      const result = new FileNameSanitizerService().sanitize({sourceFileNames: ['../malicious/<script>', 'safe.JSON'], suffix: '-merged'});

      // Assert
      expect(result.fileName).toBe('_malicious__script_-safe-merged.json');
    });
  });

  describe('When the suffix is empty', () => {
    it('should name the file after the source file names alone', () => {
      // Act
      const result = new FileNameSanitizerService().sanitize({sourceFileNames: ['Standard-1.json'], suffix: ''});

      // Assert
      expect<SanitizedFileNameResponse>(result).toEqual({fileName: 'Standard-1.json', stem: 'Standard-1'});
    });
  });
});
