import {describe, expect, it} from 'bun:test';
import {createFakeScriptIo} from './testing/createFakeScriptIo.ts';
import {checkSaveLineReader, findUnadmittedJsonParseCalls, isProductionSourceFile} from './check-save-line-reader.ts';

const PARSER_MODULE = 'packages/shared-save-processing/parseSaveSections.js';

describe('isProductionSourceFile', () => {

  describe('When the file is a source module of a package', () => {
    it.each([
      'packages/shared-save-processing/int64Identifiers.js',
      'packages/core-mapping/src/application/MergeSaveFilesController.ts',
      'packages/ui-save-manager/src/components/structure/FieldsGroup.tsx',
      'packages/shared-save-processing/jsonSourceTextAccess.d.ts'
    ])('should read %s', filePath => {
      // Act
      const isProduction = isProductionSourceFile(filePath);

      // Assert
      expect(isProduction).toBe(true);
    });
  });

  describe('When the file is a spec or a test', () => {
    it.each([
      'packages/shared-save-processing/parseSaveSections.spec.js',
      'packages/core-mapping/src/application/MergeSaveFilesController.spec.ts',
      'packages/ui-save-manager/src/components/FieldsGroup.test.tsx'
    ])('should leave %s alone', filePath => {
      // Act
      const isProduction = isProductionSourceFile(filePath);

      // Assert
      expect(isProduction).toBe(false);
    });
  });

  describe('When the file sits in a directory of test support', () => {
    it.each([
      'packages/ui-save-manager/e2e/fixtures/buildScenario.ts',
      'packages/cli-merge/testing/createSaveFile.js',
      'packages/core-mapping/src/testing/createMergedSections.ts'
    ])('should leave %s alone', filePath => {
      // Act
      const isProduction = isProductionSourceFile(filePath);

      // Assert
      expect(isProduction).toBe(false);
    });
  });

  describe('When the file is generated', () => {
    it.each([
      'packages/ui-save-manager/node_modules/solid-js/dist/solid.js',
      'packages/ui-save-manager/dist/index.js',
      'packages/ui-save-manager/build/index.js',
      'packages/core-mapping/coverage/lcov-report/prettify.js',
      'packages/ui-save-manager/.output/server/index.mjs',
      'packages/ui-save-manager/.vinxi/build/client/entry.js'
    ])('should leave %s alone', filePath => {
      // Act
      const isProduction = isProductionSourceFile(filePath);

      // Assert
      expect(isProduction).toBe(false);
    });
  });

  describe('When the file is not a script', () => {
    it.each([
      'packages/shared-save-processing/schemas/players.schema.json',
      'packages/ui-save-manager/src/app.css',
      'packages/cli-merge/README.md'
    ])('should leave %s alone', filePath => {
      // Act
      const isProduction = isProductionSourceFile(filePath);

      // Assert
      expect(isProduction).toBe(false);
    });
  });

  describe('When the file sits outside the packages', () => {
    it('should leave it alone', () => {
      // Act
      const isProduction = isProductionSourceFile('scripts/validate-tables/validate-tables.ts');

      // Assert
      expect(isProduction).toBe(false);
    });
  });
});

describe('findUnadmittedJsonParseCalls', () => {

  describe('When a package module other than the parser calls JSON.parse', () => {
    it('should report the line of the call', () => {
      // Arrange
      const source = [
        'export function readPlayers(line) {',
        '  const players = JSON.parse(line);',
        '  return players;',
        '}'
      ].join('\n');

      // Act
      const lines = findUnadmittedJsonParseCalls({filePath: 'packages/cli-validate/src/readPlayers.js', source});

      // Assert
      expect(lines).toEqual([2]);
    });

    it('should report a call written after a comment closed on the same line', () => {
      // Arrange
      const source = '/* players */ const players = JSON.parse(line);';

      // Act
      const lines = findUnadmittedJsonParseCalls({filePath: 'packages/cli-validate/src/readPlayers.js', source});

      // Assert
      expect(lines).toEqual([1]);
    });

    it('should report a call written after a string holding a comment marker', () => {
      // Arrange
      const source = "const origin = 'https://example.org'; const players = JSON.parse(line);";

      // Act
      const lines = findUnadmittedJsonParseCalls({filePath: 'packages/cli-validate/src/readPlayers.js', source});

      // Assert
      expect(lines).toEqual([1]);
    });
  });

  describe('When the parser module calls JSON.parse', () => {
    it('should report nothing, the parser being the one admitted reader', () => {
      // Arrange
      const source = 'return JSON.parse(line, keepInt64IdentifierText);';

      // Act
      const lines = findUnadmittedJsonParseCalls({filePath: PARSER_MODULE, source});

      // Assert
      expect(lines).toEqual([]);
    });
  });

  describe('When JSON.parse is only named in a comment', () => {
    it('should report nothing for a line comment', () => {
      // Arrange
      const source = 'const identifier = text; // JSON.parse would round it';

      // Act
      const lines = findUnadmittedJsonParseCalls({filePath: 'packages/shared-save-processing/int64Identifiers.js', source});

      // Assert
      expect(lines).toEqual([]);
    });

    it('should report nothing for a block comment spanning several lines', () => {
      // Arrange
      const source = [
        '/**',
        ' * `JSON.parse` rounds such an identifier to the nearest double;',
        " * the reviver's third parameter keeps its text: JSON.parse(line, reviver)",
        ' */',
        'export const INT64_IDENTIFIER = /^\\d{17,}$/;'
      ].join('\n');

      // Act
      const lines = findUnadmittedJsonParseCalls({filePath: 'packages/shared-save-processing/int64Identifiers.js', source});

      // Assert
      expect(lines).toEqual([]);
    });
  });

  describe('When JSON.parse is only named in a string', () => {
    it('should report nothing, a quoted name not being a call', () => {
      // Arrange
      const source = "const message = 'the line JSON.parse refused';";

      // Act
      const lines = findUnadmittedJsonParseCalls({filePath: 'packages/cli-validate/src/messages.js', source});

      // Assert
      expect(lines).toEqual([]);
    });
  });
});

describe('checkSaveLineReader', () => {

  describe('When only the admitted parser module calls JSON.parse', () => {
    it('should print that nothing was found and exit with zero', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'packages/shared-save-processing/parseSaveSections.js': 'return JSON.parse(line, keepInt64IdentifierText);',
          'packages/cli-validate/src/readPlayers.js': 'const players = parseSaveSections(content);'
        }
      });

      // Act
      await checkSaveLineReader(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: ['check:save-line-reader: no production module calls JSON.parse outside packages/shared-save-processing/parseSaveSections.js.'],
        exitCodes: [0]
      });
    });
  });

  describe('When another production module calls JSON.parse', () => {
    it('should print each offending line with its reason, then the count, and exit with one', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'packages/cli-validate/src/readPlayers.js': 'const players = JSON.parse(line);'
        }
      });

      // Act
      await checkSaveLineReader(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: [
          'packages/cli-validate/src/readPlayers.js:1\n  a save line reaches JSON.parse through packages/shared-save-processing/parseSaveSections.js alone; parse through parseSaveSections instead',
          'check:save-line-reader: 1 JSON.parse call(s) outside packages/shared-save-processing/parseSaveSections.js.'
        ],
        exitCodes: [1]
      });
    });
  });
});
