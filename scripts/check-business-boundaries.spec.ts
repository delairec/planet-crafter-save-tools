import {describe, expect, it} from 'bun:test';
import {createFakeScriptIo} from './testing/createFakeScriptIo.ts';
import {checkBusinessBoundaries, findBusinessBoundaryViolations, type BusinessBoundaryViolation} from './check-business-boundaries.ts';

const MERGE_FILE = 'packages/core-mapping/src/merge/application/MergeSaveFiles.ts';
const SAVE_FILE = 'packages/core-mapping/src/save/domain/PlayerEntry.ts';
const DISPLAY_FILE = 'packages/core-mapping/src/display/presentation/PlayersSectionPresenter.ts';
const BUSINESS_PACKAGES = new Map([['packages/core-mapping', 'core-mapping'], ['packages/core-other', 'core-other']]);
const BUSINESS_REASON = 'a file of a business imports no file of another business, a spec file and a test-support file included: move what both businesses need into the shared area save/, or keep it in the business that uses it';
const SHARED_REASON = 'a file of the shared area save/ imports no file of a business, a spec file and a test-support file included: move what the shared area needs into save/, or keep the code that needs the business in that business';
const OUTSIDE_AREAS_REASON = 'a file of an area reaches the files of its package by a relative path to a file of an area under src/ only, never a file directly under src/ nor a path leaving src/ (the package root, node_modules, another package): import the file from the area that holds it';
const SELF_REFERENCE_REASON = 'a file of an area imports no file of its own package by the package name or by an entry of its import map: import it by a relative path inside src/';
const ROOT_FILE_REASON = 'in a core- package laid out by business, every file under src/ lives in an area, so that no file bridges two businesses: move this file into the business that uses it, or into the shared area save/';
const SUMMARY = 'check:business-boundaries: 4 violation(s): in a core- package laid out by business, one holding the shared area src/save/, every file under src/ lives in an area, a business imports no other business and the shared area no business, and a file of the package is imported by a relative path inside src/ only, a spec file and a test-support file included.';

describe('findBusinessBoundaryViolations', () => {

  describe('When a file of a business imports a file of another business', () => {
    it('should report the import with the rule it breaks', () => {
      // Arrange
      const source = "import type {PlayersSectionViewModel} from '../../display/presentation/PlayersSectionViewModel.ts';";

      // Act
      const violations = findBusinessBoundaryViolations(MERGE_FILE, source, BUSINESS_PACKAGES);

      // Assert
      expect<BusinessBoundaryViolation[]>(violations).toEqual([
        {importStatement: {line: 1, specifier: '../../display/presentation/PlayersSectionViewModel.ts'}, reason: BUSINESS_REASON}
      ]);
    });

    it.each([
      ['a spec file', 'packages/core-mapping/src/merge/application/MergeSaveFiles.spec.ts', "import {createPlayersSection} from '../../display/testing/createPlayersSection';", '../../display/testing/createPlayersSection'],
      ['a test-support file', 'packages/core-mapping/src/merge/testing/createMergedSections.ts', "import {createPlayersSection} from '../../display/testing/createPlayersSection';", '../../display/testing/createPlayersSection'],
      ['a JavaScript file of another core- package laid out by business', 'packages/core-other/src/merge/domain/rule.js', "import {formatDate} from '../../display/presentation/formatDate.js';", '../../display/presentation/formatDate.js'],
      ['a JSDoc @import', MERGE_FILE, "/** @import { PlayersSectionViewModel } from '../../display/presentation/PlayersSectionViewModel' */", '../../display/presentation/PlayersSectionViewModel'],
      ['a require', MERGE_FILE, "const presenter = require('../../display/presentation/PlayersSectionPresenter');", '../../display/presentation/PlayersSectionPresenter'],
      ['an import of the business folder itself', MERGE_FILE, "import {display} from '../../display';", '../../display']
    ])('should report %s', (_form, filePath, source, specifier) => {
      // Act
      const violations = findBusinessBoundaryViolations(filePath, source, BUSINESS_PACKAGES);

      // Assert
      expect<BusinessBoundaryViolation[]>(violations).toEqual([{importStatement: {line: 1, specifier}, reason: BUSINESS_REASON}]);
    });
  });

  describe('When a file of the shared area imports a file of a business', () => {
    it('should report the import with the rule it breaks', () => {
      // Arrange
      const source = "import {MergeWarning} from '../../merge/domain/MergeWarning';";

      // Act
      const violations = findBusinessBoundaryViolations(SAVE_FILE, source, BUSINESS_PACKAGES);

      // Assert
      expect<BusinessBoundaryViolation[]>(violations).toEqual([
        {importStatement: {line: 1, specifier: '../../merge/domain/MergeWarning'}, reason: SHARED_REASON}
      ]);
    });
  });

  describe('When a file of an area names its own package', () => {
    it.each([
      ['the package name followed by a path', "import {compositionRoot} from 'core-mapping/display/composition/compositionRoot';", 'core-mapping/display/composition/compositionRoot'],
      ['the package name alone', "import {compositionRoot} from 'core-mapping';", 'core-mapping'],
      ['an entry of the import map of the package', "import {compositionRoot} from '#display/compositionRoot';", '#display/compositionRoot']
    ])('should report %s', (_form, source, specifier) => {
      // Act
      const violations = findBusinessBoundaryViolations(MERGE_FILE, source, BUSINESS_PACKAGES);

      // Assert
      expect<BusinessBoundaryViolation[]>(violations).toEqual([{importStatement: {line: 1, specifier}, reason: SELF_REFERENCE_REASON}]);
    });
  });

  describe('When a file of an area imports a path outside the areas of its package', () => {
    it.each([
      ['a file of the package root', "import {compositionRoot} from '../../../bridge.ts';", '../../../bridge.ts'],
      ['a path through node_modules', "import {compositionRoot} from '../../../../../node_modules/core-mapping/src/display/composition/compositionRoot';", '../../../../../node_modules/core-mapping/src/display/composition/compositionRoot'],
      ['a file of another package', "import {compositionRoot} from '../../../../core-other/src/display/presentation/formatDate.js';", '../../../../core-other/src/display/presentation/formatDate.js'],
      ['the src/ folder itself', "import {compositionRoot} from '../..';", '../..'],
      ['an absolute path', "import {compositionRoot} from '/packages/core-mapping/src/display/composition/compositionRoot';", '/packages/core-mapping/src/display/composition/compositionRoot'],
      ['a file directly under src/ named with its extension', "import {compositionRoot} from '../../bridge.ts';", '../../bridge.ts']
    ])('should report %s', (_form, source, specifier) => {
      // Act
      const violations = findBusinessBoundaryViolations(MERGE_FILE, source, BUSINESS_PACKAGES);

      // Assert
      expect<BusinessBoundaryViolation[]>(violations).toEqual([{importStatement: {line: 1, specifier}, reason: OUTSIDE_AREAS_REASON}]);
    });

    it('should report a file directly under src/ named without its extension as the folder of a business', () => {
      // Arrange
      const source = "import {VERSION} from '../../version';";

      // Act
      const violations = findBusinessBoundaryViolations(MERGE_FILE, source, BUSINESS_PACKAGES);

      // Assert
      expect<BusinessBoundaryViolation[]>(violations).toEqual([{importStatement: {line: 1, specifier: '../../version'}, reason: BUSINESS_REASON}]);
    });
  });

  describe('When the import stays inside what the rule allows', () => {
    it.each([
      ['a business importing the shared area', MERGE_FILE, "import {PlayerEntry} from '../../save/domain/PlayerEntry';"],
      ['a business importing its own files', MERGE_FILE, "import {mergeInventories} from '../domain/mergeInventories.ts';"],
      ['a business importing its own folder', MERGE_FILE, "import {merge} from '..';"],
      ['the shared area importing its own files', SAVE_FILE, "import {InventoryEntry} from './InventoryEntry';"],
      ['a business importing a workspace package', MERGE_FILE, "import type {SaveWarning} from 'shared-save-processing/gameDefinitions';"],
      ['a business importing a package whose name only starts with its own', MERGE_FILE, "import {extra} from 'core-mapping-extra/extra';"],
      ['a business importing a non-relative specifier named like a business', MERGE_FILE, "import {formatDate} from 'display/presentation/formatDate';"]
    ])('should report nothing for %s', (_form, filePath, source) => {
      // Act
      const violations = findBusinessBoundaryViolations(filePath, source, BUSINESS_PACKAGES);

      // Assert
      expect<BusinessBoundaryViolation[]>(violations).toEqual([]);
    });

    it('should allow the shared area named without extension, read as its folder even where a file of that name sits directly under src/, a limit the report of that file covers', () => {
      // Arrange
      const source = "import {save} from '../../save';";

      // Act
      const violations = findBusinessBoundaryViolations(MERGE_FILE, source, BUSINESS_PACKAGES);

      // Assert
      expect<BusinessBoundaryViolation[]>(violations).toEqual([]);
    });
  });

  describe('When a file sits directly under the src/ of a package laid out by business', () => {
    it('should report the file itself', () => {
      // Arrange
      const source = "export * from './merge/composition/compositionRoot';";

      // Act
      const violations = findBusinessBoundaryViolations('packages/core-mapping/src/bridge.ts', source, BUSINESS_PACKAGES);

      // Assert
      expect<BusinessBoundaryViolation[]>(violations).toEqual([{reason: ROOT_FILE_REASON}]);
    });
  });

  describe('When the file lies outside the src/ of a package laid out by business', () => {
    it.each([
      ['a file of a core- package laid out by layers', 'packages/core-layered/src/application/LoadSave.ts', "import {SaveRule} from '../domain/SaveRule';"],
      ['a file directly under the src/ of a core- package laid out by layers', 'packages/core-layered/src/index.ts', "export * from './application/LoadSave';"],
      ['a file of a core- package laid out by business outside src/', 'packages/core-mapping/testSetup.ts', "import {mergeSaves} from './src/merge/application/mergeSaves';"],
      ['a file of a package that is not a core- package', 'packages/cli-merge/src/merge/initMergeCli.js', "import {formatDate} from '../display/formatDate.js';"]
    ])('should report nothing for %s', (_form, filePath, source) => {
      // Act
      const violations = findBusinessBoundaryViolations(filePath, source, BUSINESS_PACKAGES);

      // Assert
      expect<BusinessBoundaryViolation[]>(violations).toEqual([]);
    });
  });
});

describe('checkBusinessBoundaries', () => {
  const MAPPING_MANIFEST = {'packages/core-mapping/package.json': '{"name": "core-mapping"}'};

  describe('When the files of a package laid out by business break the rule', () => {
    it('should print every violation and exit with 1', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          ...MAPPING_MANIFEST,
          [MERGE_FILE]: "import {PlayerEntry} from '../../save/domain/PlayerEntry';\nimport {formatDate} from '../../display/presentation/formatDate';",
          [SAVE_FILE]: "import {MergeWarning} from '../../merge/domain/MergeWarning';",
          [DISPLAY_FILE]: "import {compositionRoot} from 'core-mapping/merge/composition/compositionRoot';",
          'packages/core-mapping/src/bridge.ts': "export * from './merge/composition/compositionRoot';"
        }
      });

      // Act
      await checkBusinessBoundaries(io);

      // Assert
      expect(printed).toEqual([
        `${MERGE_FILE}:2: ../../display/presentation/formatDate\n  ${BUSINESS_REASON}`,
        `${SAVE_FILE}:1: ../../merge/domain/MergeWarning\n  ${SHARED_REASON}`,
        `${DISPLAY_FILE}:1: core-mapping/merge/composition/compositionRoot\n  ${SELF_REFERENCE_REASON}`,
        `packages/core-mapping/src/bridge.ts\n  ${ROOT_FILE_REASON}`,
        SUMMARY
      ]);
      expect(exitCodes).toEqual([1]);
    });
  });

  describe('When a source of a package laid out by business carries a less common extension', () => {
    it.each([
      ['packages/core-mapping/src/merge/application/mergeSaves.mts'],
      ['packages/core-mapping/src/merge/application/mergeSaves.cts'],
      ['packages/core-mapping/src/merge/application/mergeSaves.mjs'],
      ['packages/core-mapping/src/merge/application/mergeSaves.cjs'],
      ['packages/core-mapping/src/merge/application/mergeSaves.jsx']
    ])('should judge %s', async (filePath) => {
      // Arrange
      const {io, printed} = createFakeScriptIo({
        files: {...MAPPING_MANIFEST, [SAVE_FILE]: '', [filePath]: "import {formatDate} from '../../display/presentation/formatDate';"}
      });

      // Act
      await checkBusinessBoundaries(io);

      // Assert
      expect(printed).toEqual([
        `${filePath}:1: ../../display/presentation/formatDate\n  ${BUSINESS_REASON}`,
        'check:business-boundaries: 1 violation(s): in a core- package laid out by business, one holding the shared area src/save/, every file under src/ lives in an area, a business imports no other business and the shared area no business, and a file of the package is imported by a relative path inside src/ only, a spec file and a test-support file included.'
      ]);
    });
  });

  describe('When a core- package holds no shared area src/save/', () => {
    it('should judge none of its files', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'packages/core-layered/package.json': '{"name": "core-layered"}',
          'packages/core-layered/src/application/LoadSave.ts': "import {SaveRule} from '../domain/SaveRule';",
          'packages/core-layered/src/index.ts': "export * from './application/LoadSave';"
        }
      });

      // Act
      await checkBusinessBoundaries(io);

      // Assert
      expect(printed).toEqual(['check:business-boundaries: in every core- package laid out by business, one holding the shared area src/save/, every file under src/ lives in an area, no business imports another business nor the shared area a business, and every import of a file of the package is a relative path inside src/, spec files and testing/ included.']);
      expect(exitCodes).toEqual([0]);
    });
  });

  describe('When every business imports only itself and the shared area', () => {
    it('should report that nothing was found and exit with 0', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          ...MAPPING_MANIFEST,
          [SAVE_FILE]: "import {InventoryEntry} from './InventoryEntry';",
          [MERGE_FILE]: "import {PlayerEntry} from '../../save/domain/PlayerEntry';",
          [DISPLAY_FILE]: "import {PlayerEntry} from '../../save/domain/PlayerEntry';"
        }
      });

      // Act
      await checkBusinessBoundaries(io);

      // Assert
      expect(printed).toEqual(['check:business-boundaries: in every core- package laid out by business, one holding the shared area src/save/, every file under src/ lives in an area, no business imports another business nor the shared area a business, and every import of a file of the package is a relative path inside src/, spec files and testing/ included.']);
      expect(exitCodes).toEqual([0]);
    });
  });
});
