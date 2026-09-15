import {describe, expect, it} from 'bun:test';
import {
  FixtureDivergence,
  InputDirectoryReference,
  findFixtureDivergence,
  findInputDirectoryReferences
} from './check-scenario-fixtures.ts';

const DIVERGED_FIXTURE_REASON = 'regenerating it does not reproduce the versioned file: run bun run generate:scenario-fixtures and commit what it writes';
const MISSING_FIXTURE_REASON = 'the generator declares it and the repository does not carry it: run bun run generate:scenario-fixtures and commit what it writes';

describe('findFixtureDivergence', () => {

  describe('When the generator reproduces the versioned fixture', () => {
    it('should report nothing', () => {
      // Arrange
      const sameContent = '{"saveDisplayName":"Merged Save"}';

      // Act
      const divergence = findFixtureDivergence({
        fileName: 'baseline_valid.json',
        regeneratedContent: sameContent,
        versionedContent: sameContent
      });

      // Assert
      expect(divergence).toBeNull();
    });
  });

  describe('When the versioned fixture differs from what the generator writes', () => {
    it('should report the fixture and the command that settles the difference', () => {
      // Act
      const divergence = findFixtureDivergence({
        fileName: 'baseline_valid.json',
        regeneratedContent: '{"saveDisplayName":"Merged Save"}',
        versionedContent: '{"saveDisplayName":"Edited By Hand"}'
      });

      // Assert
      expect<FixtureDivergence | null>(divergence).toEqual({
        fileName: 'baseline_valid.json',
        reason: DIVERGED_FIXTURE_REASON
      });
    });
  });

  describe('When the versioned fixture differs by a single trailing character', () => {
    it('should report it, the comparison being made byte for byte', () => {
      // Act
      const divergence = findFixtureDivergence({
        fileName: 'legacy-format_valid.json',
        regeneratedContent: '{"saveDisplayName":"Merged Save"}',
        versionedContent: '{"saveDisplayName":"Merged Save"}\n'
      });

      // Assert
      expect(divergence?.reason).toBe(DIVERGED_FIXTURE_REASON);
    });
  });

  describe('When the repository carries no file for a declared fixture', () => {
    it('should report the fixture as missing', () => {
      // Arrange
      const noVersionedFile = null;

      // Act
      const divergence = findFixtureDivergence({
        fileName: 'other-player_valid.json',
        regeneratedContent: '{"saveDisplayName":"Companion Save"}',
        versionedContent: noVersionedFile
      });

      // Assert
      expect<FixtureDivergence | null>(divergence).toEqual({
        fileName: 'other-player_valid.json',
        reason: MISSING_FIXTURE_REASON
      });
    });
  });
});

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
