import {describe, expect, it} from 'bun:test';
import {createFakeScriptIo} from './testing/createFakeScriptIo.ts';
import {checkScenarioFixtures, InputDirectoryReference, findInputDirectoryReferences} from './check-scenario-fixtures.ts';

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

describe('checkScenarioFixtures', () => {

  describe('When every scenario reads the fixtures its generator writes', () => {
    it('should print that nothing was found and exit with zero', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'packages/ui-save-manager/e2e/merge.e2e.ts': "const savePath = new URL('./fixtures/baseline_valid.json', import.meta.url).pathname;"
        }
      });

      // Act
      await checkScenarioFixtures(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: ['check:scenario-fixtures: no scenario reads the input directory.'],
        exitCodes: [0]
      });
    });
  });

  describe('When a scenario reads a save of the input directory', () => {
    it('should print each offending line with its reason, then the count, and exit with one', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'packages/ui-save-manager/e2e/merge.e2e.ts': "const savePath = 'input/Test/save.json';"
        }
      });

      // Act
      await checkScenarioFixtures(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: [
          "packages/ui-save-manager/e2e/merge.e2e.ts:1: const savePath = 'input/Test/save.json';\n  a scenario reads only the fixtures its generator writes: the input directory is unversioned and absent from a machine without the private repository",
          'check:scenario-fixtures: 1 input directory reference(s) to settle.'
        ],
        exitCodes: [1]
      });
    });
  });
});
