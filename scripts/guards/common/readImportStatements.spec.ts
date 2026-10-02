import {describe, expect, it} from 'bun:test';
import {readImportStatements, type ImportStatement} from './readImportStatements.ts';

describe('readImportStatements', () => {

  describe('When the source imports a module', () => {
    it.each([
      ['a named import', "import {mergeSaves} from '../merge/mergeSaves.ts';", '../merge/mergeSaves.ts'],
      ['an import type', "import type {SaveWarning} from './SaveWarning';", './SaveWarning'],
      ['a namespace import', "import * as rows from 'data-save-format/selectGameReleaseRows';", 'data-save-format/selectGameReleaseRows'],
      ['a side-effect import', "import './registerSections.js';", './registerSections.js'],
      ['a re-export', "export {mergeSaves} from '../merge/mergeSaves.ts';", '../merge/mergeSaves.ts'],
      ['an export type', "export type {SaveWarning} from './SaveWarning';", './SaveWarning'],
      ['a dynamic import', "const module = await import('../display/loadSave');", '../display/loadSave'],
      ['a dynamic import of a template literal without substitution', 'const module = await import(`../display/loadSave`);', '../display/loadSave'],
      ['a require', "const module = require('../display/loadSave');", '../display/loadSave'],
      ['a require of a template literal without substitution', 'const module = require(`../display/loadSave`);', '../display/loadSave'],
      ['a TypeScript import assignment', "import loadSave = require('../display/loadSave');", '../display/loadSave'],
      ['an import written after another statement on its line', "const ready = true; import {mergeSaves} from '../merge/mergeSaves.ts';", '../merge/mergeSaves.ts'],
      ['a side-effect import written after another statement on its line', "const ready = true; import './registerSections.js';", './registerSections.js'],
      ['an import written after a closing brace on its line', "function prepare() {} import {mergeSaves} from '../merge/mergeSaves.ts';", '../merge/mergeSaves.ts'],
      ['an import following a string literal holding a line comment marker', "const url = 'https://example.org'; import {mergeSaves} from '../merge/mergeSaves.ts';", '../merge/mergeSaves.ts'],
      ['an import following a regular expression holding quotes', "const quotes = /['\"]/g; import {mergeSaves} from '../merge/mergeSaves.ts';", '../merge/mergeSaves.ts'],
      ['an import following a regular expression holding an escaped slash and a quote', "const pattern = /\\/'/; import {mergeSaves} from '../merge/mergeSaves.ts';", '../merge/mergeSaves.ts'],
      ['an import between two divisions on its line', "const half = total / 2; import {mergeSaves} from '../merge/mergeSaves.ts'; const third = total / 3;", '../merge/mergeSaves.ts'],
      ['an import inside the substitution of a template literal', "const label = `${await import('../display/loadSave')}`;", '../display/loadSave'],
      ['a JSDoc @import', "/** @import { SaveSectionName } from '../save/SaveSectionName' */", '../save/SaveSectionName'],
      ['a JSDoc type naming an import', "/** @type {import('../save/SaveWarning').SaveWarning} */", '../save/SaveWarning']
    ])('should read %s', (_form, source, specifier) => {
      // Act
      const statements = readImportStatements(source);

      // Assert
      expect<ImportStatement[]>(statements).toEqual([{line: 1, specifier}]);
    });

    it('should place an import written over several lines at the line it starts on', () => {
      // Arrange
      const source = "const a = 1;\nimport {\n  mergeSaves,\n  nameMergedFile\n} from '../merge/mergeSaves.ts';";

      // Act
      const statements = readImportStatements(source);

      // Assert
      expect<ImportStatement[]>(statements).toEqual([{line: 2, specifier: '../merge/mergeSaves.ts'}]);
    });

    it('should place a JSDoc @import at the line it stands on', () => {
      // Arrange
      const source = "/**\n * @import { SaveWarning } from '../save/SaveWarning'\n */";

      // Act
      const statements = readImportStatements(source);

      // Assert
      expect<ImportStatement[]>(statements).toEqual([{line: 2, specifier: '../save/SaveWarning'}]);
    });

    it('should list the imports of every form in the order the source writes them', () => {
      // Arrange
      const source = "/** @import { SaveWarning } from '../save/SaveWarning' */\nconst loader = () => import('../display/loadSave');\nimport './registerSections.js';\nexport {mergeSaves} from '../merge/mergeSaves.ts';";

      // Act
      const statements = readImportStatements(source);

      // Assert
      expect<ImportStatement[]>(statements).toEqual([
        {line: 1, specifier: '../save/SaveWarning'},
        {line: 2, specifier: '../display/loadSave'},
        {line: 3, specifier: './registerSections.js'},
        {line: 4, specifier: '../merge/mergeSaves.ts'}
      ]);
    });

    it('should read an import that follows a string literal holding the opening of a block comment', () => {
      // Arrange
      const source = "const opening = '/*';\nimport {mergeSaves} from '../merge/mergeSaves.ts';\n/* closing */";

      // Act
      const statements = readImportStatements(source);

      // Assert
      expect<ImportStatement[]>(statements).toEqual([{line: 2, specifier: '../merge/mergeSaves.ts'}]);
    });

    it('should confine to its line the misreading of a regular expression following the condition of an if, a limit of the reading', () => {
      // Arrange
      const source = "if (ready) /'/.test(text);\nimport {mergeSaves} from '../merge/mergeSaves.ts';";

      // Act
      const statements = readImportStatements(source);

      // Assert
      expect<ImportStatement[]>(statements).toEqual([{line: 2, specifier: '../merge/mergeSaves.ts'}]);
    });

    it('should read as a division a slash whose line holds no closing slash, as in a closing JSX tag', () => {
      // Arrange
      const source = "const link = <a></a>;\nimport {mergeSaves} from '../merge/mergeSaves.ts';";

      // Act
      const statements = readImportStatements(source);

      // Assert
      expect<ImportStatement[]>(statements).toEqual([{line: 2, specifier: '../merge/mergeSaves.ts'}]);
    });

    it('should read the import that follows a line whose string literal is left unterminated', () => {
      // Arrange
      const source = "const label = 'unterminated;\nimport {mergeSaves} from '../merge/mergeSaves.ts';";

      // Act
      const statements = readImportStatements(source);

      // Assert
      expect<ImportStatement[]>(statements).toEqual([{line: 2, specifier: '../merge/mergeSaves.ts'}]);
    });
  });

  describe('When the source holds no import statement', () => {
    it.each([
      ['a commented-out import', "// import {mergeSaves} from '../merge/mergeSaves.ts';"],
      ['an import inside a block comment', "/*\nimport {mergeSaves} from '../merge/mergeSaves.ts';\n*/"],
      ['an import written inside a string literal', "const example = \"import {mergeSaves} from '../merge/mergeSaves.ts';\";"],
      ['an import written on its own line inside a template literal', "const example = `\nimport {mergeSaves} from '../merge/mergeSaves.ts';\n`;"],
      ['a require written inside a regular expression', "const pattern = /require('x')/;"],
      ['an import written after a template literal left unterminated', "const label = `unterminated;\nimport {mergeSaves} from '../merge/mergeSaves.ts';"],
      ['code without any import', 'export const SHARED_AREA = 1;']
    ])('should read nothing from %s', (_form, source) => {
      // Act
      const statements = readImportStatements(source);

      // Assert
      expect<ImportStatement[]>(statements).toEqual([]);
    });
  });

  describe('When the specifier is only known at run time, a limit of the reading', () => {
    it.each([
      ['a dynamic import of a template literal with a substitution', 'const module = await import(`../${business}/loadSave`);'],
      ['a require of a template literal with a substitution', 'const module = require(`../${business}/loadSave`);'],
      ['a dynamic import of a variable', 'const module = await import(modulePath);'],
      ['a require of a concatenation', "const module = require('../' + business + '/loadSave');"]
    ])('should read nothing from %s', (_form, source) => {
      // Act
      const statements = readImportStatements(source);

      // Assert
      expect<ImportStatement[]>(statements).toEqual([]);
    });
  });
});
