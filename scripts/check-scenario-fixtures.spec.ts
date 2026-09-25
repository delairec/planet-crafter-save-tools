import {describe, expect, it} from 'bun:test';
import {InputDirectoryReference, findInputDirectoryReferences} from './check-scenario-fixtures.ts';

describe('findInputDirectoryReferences', () => {

  describe('When a scenario reads a file of the input directory', () => {
    it('should report the line and its text', () => {
      // Arrange
      const source = 'const savePath = new URL(\'../../../input/Test/save.json\', import.meta.url).pathname;';

      // Act
      const references = findInputDirectoryReferences(source);

      // Assert
      expect<InputDirectoryReference[]>(references).toEqual([{
        line: 1,
        text: 'const savePath = new URL(\'../../../input/Test/save.json\', import.meta.url).pathname;'
      }]);
    });
  });

  describe('When a scenario names the input directory at the repository root', () => {
    it('should report the line', () => {
      // Arrange
      const source = 'const savePath = \'input/Test/save.json\';';

      // Act
      const references = findInputDirectoryReferences(source);

      // Assert
      expect(references.map(reference => reference.line)).toEqual([1]);
    });
  });

  describe('When a scenario names the input directory behind a path separator', () => {
    it('should report the line, a separator opening a fresh path segment', () => {
      // Arrange
      const source = 'const savePath = `${process.cwd()}/input/Test/save.json`;';

      // Act
      const references = findInputDirectoryReferences(source);

      // Assert
      expect(references.map(reference => reference.line)).toEqual([1]);
    });
  });

  describe('When a scenario reads its own fixtures directory', () => {
    it('should report nothing', () => {
      // Arrange
      const source = 'const savePath = new URL(\'./fixtures/baseline_valid.json\', import.meta.url).pathname;';

      // Act
      const references = findInputDirectoryReferences(source);

      // Assert
      expect(references).toEqual([]);
    });
  });

  describe('When a scenario calls a Playwright method whose name ends with the directory name', () => {
    it('should report nothing, the name carrying no path separator', () => {
      // Arrange
      const source = 'await page.getByLabel(\'Save file:\').setInputFiles(savePath);';

      // Act
      const references = findInputDirectoryReferences(source);

      // Assert
      expect(references).toEqual([]);
    });
  });

  describe('When a scenario names a path whose last segment merely ends with the directory name', () => {
    it('should report nothing', () => {
      // Arrange
      const source = 'const savePath = \'./user-input/Test/save.json\';';

      // Act
      const references = findInputDirectoryReferences(source);

      // Assert
      expect(references).toEqual([]);
    });
  });

  describe('When several lines of a scenario reach into the input directory', () => {
    it('should report each of them in file order', () => {
      // Arrange
      const source = [
        'const saveA = \'../../../input/Test/save.json\';',
        'const saveB = \'./fixtures/other-player_valid.json\';',
        'const saveC = \'../../../input/Test2/save.json\';'
      ].join('\n');

      // Act
      const references = findInputDirectoryReferences(source);

      // Assert
      expect(references.map(reference => reference.line)).toEqual([1, 3]);
    });
  });
});
