import {describe, expect, it} from 'bun:test';
import {createFakeScriptIo} from './testing/createFakeScriptIo.ts';
import {checkCoreRuntimeImports, findRuntimeImports} from './check-core-runtime-imports.ts';

const WORKSPACE_PACKAGE_NAMES = new Set(['shared-save-processing', 'data-save-format', 'core-mapping']);
const DOMAIN_FILE = 'packages/core-mapping/src/domain/rules/compareGameReleases.ts';

describe('findRuntimeImports', () => {

  describe('When a file under domain/ or application/ of a core- package imports runtime code of another workspace package', () => {
    it.each([
      ['a named import', "import {findCarriedRelease} from 'shared-save-processing/gameReleases.js';", 'shared-save-processing/gameReleases.js'],
      ['an inline type modifier, which keeps the import at runtime', "import {type SaveWarning} from 'shared-save-processing/gameDefinitions';", 'shared-save-processing/gameDefinitions'],
      ['a namespace import', "import * as rows from 'data-save-format/selectGameReleaseRows';", 'data-save-format/selectGameReleaseRows'],
      ['a side-effect import', "import 'shared-save-processing/parseSaveSections.js';", 'shared-save-processing/parseSaveSections.js'],
      ['a re-export', "export {findCarriedRelease} from 'shared-save-processing/gameReleases.js';", 'shared-save-processing/gameReleases.js'],
      ['a dynamic import', "const module = await import('data-save-format/selectGameReleaseRows');", 'data-save-format/selectGameReleaseRows']
    ])('should report %s', (_form, source, specifier) => {
      // Act
      const findings = findRuntimeImports(DOMAIN_FILE, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect(findings).toEqual([{line: 1, specifier}]);
    });

    it('should report an import written over several lines at the line it starts on', () => {
      // Arrange
      const source = "const a = 1;\nimport {\n  findCarriedRelease,\n  findSplitPartsCount\n} from 'shared-save-processing/gameReleases.js';";

      // Act
      const findings = findRuntimeImports(DOMAIN_FILE, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect(findings).toEqual([{line: 2, specifier: 'shared-save-processing/gameReleases.js'}]);
    });

    it.each([
      ['packages/core-mapping/src/application/MergeSaveFiles.spec.ts'],
      ['packages/core-mapping/src/application/responses/SaveValidationResponse.ts'],
      ['packages/core-other/domain/rule.js']
    ])('should report it in %s', (filePath) => {
      // Arrange
      const source = "import {findCarriedRelease} from 'shared-save-processing/gameReleases.js';";

      // Act
      const findings = findRuntimeImports(filePath, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect(findings).toEqual([{line: 1, specifier: 'shared-save-processing/gameReleases.js'}]);
    });
  });

  describe('When the import lets only types cross', () => {
    it.each([
      ['an import type', "import type {SaveWarning} from 'shared-save-processing/gameDefinitions';"],
      ['an export type', "export type {SaveWarning} from 'shared-save-processing/gameDefinitions';"],
      ['a JSDoc @import', "/**\n * @import { SaveWarning } from 'shared-save-processing/gameDefinitions'\n */"],
      ['a commented-out import', "// import {findCarriedRelease} from 'shared-save-processing/gameReleases.js';"]
    ])('should report nothing for %s', (_form, source) => {
      // Act
      const findings = findRuntimeImports(DOMAIN_FILE, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect(findings).toEqual([]);
    });
  });

  describe('When the import names no other workspace package', () => {
    it.each([
      ['a relative module', "import {compareGameReleases} from '../compareGameReleases';"],
      ['a runtime module', "import {describe, expect, it} from 'bun:test';"]
    ])('should report nothing for %s', (_form, source) => {
      // Act
      const findings = findRuntimeImports(DOMAIN_FILE, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect(findings).toEqual([]);
    });
  });

  describe('When the file lies outside domain/ and application/ of a core- package', () => {
    it.each([
      ['packages/core-mapping/src/infrastructure/GameReleasesReaderService.ts'],
      ['packages/core-mapping/src/presentation/EnergyLevelsPresenter.ts'],
      ['packages/cli-merge/src/application/merge.ts'],
      ['packages/core-mapping/node_modules/some-package/domain/index.js']
    ])('should report nothing for %s', (filePath) => {
      // Arrange
      const source = "import {selectGameReleaseRows} from 'data-save-format/selectGameReleaseRows';";

      // Act
      const findings = findRuntimeImports(filePath, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect(findings).toEqual([]);
    });
  });
});

describe('checkCoreRuntimeImports', () => {
  const MANIFESTS = {
    'packages/core-mapping/package.json': '{"name": "core-mapping"}',
    'packages/shared-save-processing/package.json': '{"name": "shared-save-processing"}'
  };

  describe('When a domain file imports runtime code of another workspace package', () => {
    it('should print the violation and exit with 1', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {...MANIFESTS, [DOMAIN_FILE]: "import {findCarriedRelease} from 'shared-save-processing/gameReleases.js';"}
      });

      // Act
      await checkCoreRuntimeImports(io);

      // Assert
      expect(printed).toEqual([
        `${DOMAIN_FILE}:1: shared-save-processing/gameReleases.js\n  domain/ and application/ of a core- package take only types from another workspace package: write import type, or reach the capability through a port`,
        'check:runtime-imports: 1 violation(s): only import type crosses from another workspace package into domain/ or application/ of a core- package.'
      ]);
      expect(exitCodes).toEqual([1]);
    });
  });

  describe('When every import of the inner layers is a type import', () => {
    it('should report that nothing was found and exit with 0', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {...MANIFESTS, [DOMAIN_FILE]: "import type {SaveWarning} from 'shared-save-processing/gameDefinitions';"}
      });

      // Act
      await checkCoreRuntimeImports(io);

      // Assert
      expect(printed).toEqual(['check:runtime-imports: no file under domain/ or application/ of a core- package imports runtime code of another workspace package.']);
      expect(exitCodes).toEqual([0]);
    });
  });
});
