import {describe, expect, it} from 'bun:test';
import {createFakeScriptIo} from './testing/createFakeScriptIo.ts';
import {checkWorkspaceImports, findWorkspacePackageImports} from './check-workspace-imports.ts';

const WORKSPACE_PACKAGE_NAMES = new Set(['shared-save-processing', 'data-save-format', 'core-mapping']);
const DOMAIN_FILE = 'packages/core-mapping/src/domain/rules/compareGameReleases.ts';
const REASON = 'outside infrastructure/, no file of a core- package imports another workspace package, a type, a spec file and a test-support file included: declare the type in the application or the domain, and let an infrastructure adapter map the other package onto it';

describe('findWorkspacePackageImports', () => {

  describe('When a file of a core- package outside infrastructure/ imports another workspace package', () => {
    it.each([
      ['a named import', "import {findCarriedRelease} from 'shared-save-processing/gameReleases.js';", 'shared-save-processing/gameReleases.js'],
      ['an import type', "import type {SaveWarning} from 'shared-save-processing/gameDefinitions';", 'shared-save-processing/gameDefinitions'],
      ['an inline type modifier', "import {type SaveWarning} from 'shared-save-processing/gameDefinitions';", 'shared-save-processing/gameDefinitions'],
      ['a namespace import', "import * as rows from 'data-save-format/selectGameReleaseRows';", 'data-save-format/selectGameReleaseRows'],
      ['a side-effect import', "import 'shared-save-processing/parseSaveSections.js';", 'shared-save-processing/parseSaveSections.js'],
      ['a re-export', "export {findCarriedRelease} from 'shared-save-processing/gameReleases.js';", 'shared-save-processing/gameReleases.js'],
      ['an export type', "export type {SaveWarning} from 'shared-save-processing/gameDefinitions';", 'shared-save-processing/gameDefinitions'],
      ['a dynamic import', "const module = await import('data-save-format/selectGameReleaseRows');", 'data-save-format/selectGameReleaseRows'],
      ['a JSDoc @import', "/** @import { SaveSectionName } from 'shared-save-processing/gameDefinitions' */", 'shared-save-processing/gameDefinitions'],
      ['a JSDoc type naming an import', "/** @type {import('shared-save-processing/gameDefinitions').SaveWarning} */", 'shared-save-processing/gameDefinitions']
    ])('should report %s', (_form, source, specifier) => {
      // Act
      const findings = findWorkspacePackageImports(DOMAIN_FILE, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect(findings).toEqual([{line: 1, specifier}]);
    });

    it('should report an import written over several lines at the line it starts on', () => {
      // Arrange
      const source = "const a = 1;\nimport {\n  findCarriedRelease,\n  findSplitPartsCount\n} from 'shared-save-processing/gameReleases.js';";

      // Act
      const findings = findWorkspacePackageImports(DOMAIN_FILE, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect(findings).toEqual([{line: 2, specifier: 'shared-save-processing/gameReleases.js'}]);
    });

    it('should report a JSDoc @import at the line it stands on', () => {
      // Arrange
      const source = "/**\n * @import { SaveWarning } from 'shared-save-processing/gameDefinitions'\n */";

      // Act
      const findings = findWorkspacePackageImports(DOMAIN_FILE, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect(findings).toEqual([{line: 2, specifier: 'shared-save-processing/gameDefinitions'}]);
    });

    it.each([
      ['packages/core-mapping/src/application/MergeSaveFiles.spec.ts'],
      ['packages/core-mapping/src/application/responses/SaveValidationResponse.ts'],
      ['packages/core-mapping/src/presentation/LoadSaveFilePresenter.spec.ts'],
      ['packages/core-mapping/src/controllers/MergeSaveFilesController.ts'],
      ['packages/core-mapping/src/composition/useCaseFactories.spec.ts'],
      ['packages/core-mapping/src/testing/saveSectionLocations.ts'],
      ['packages/core-other/domain/rule.js']
    ])('should report it in %s', (filePath) => {
      // Arrange
      const source = "import {PLAYERS_SECTION_INDEX} from 'shared-save-processing/sectionIndexes.js';";

      // Act
      const findings = findWorkspacePackageImports(filePath, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect(findings).toEqual([{line: 1, specifier: 'shared-save-processing/sectionIndexes.js'}]);
    });
  });

  describe('When the import names no other workspace package', () => {
    it.each([
      ['a relative module', "import {compareGameReleases} from '../compareGameReleases';"],
      ['a runtime module', "import {describe, expect, it} from 'bun:test';"],
      ['a commented-out import', "// import {findCarriedRelease} from 'shared-save-processing/gameReleases.js';"]
    ])('should report nothing for %s', (_form, source) => {
      // Act
      const findings = findWorkspacePackageImports(DOMAIN_FILE, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect(findings).toEqual([]);
    });
  });

  describe('When the file lies in infrastructure/ or outside a core- package', () => {
    it.each([
      ['packages/core-mapping/src/infrastructure/GameReleasesReaderService.ts'],
      ['packages/core-mapping/src/infrastructure/testing/saveSectionLocations.ts'],
      ['packages/cli-merge/src/application/merge.ts'],
      ['packages/core-mapping/node_modules/some-package/domain/index.js']
    ])('should report nothing for %s', (filePath) => {
      // Arrange
      const source = "import {selectGameReleaseRows} from 'data-save-format/selectGameReleaseRows';";

      // Act
      const findings = findWorkspacePackageImports(filePath, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect(findings).toEqual([]);
    });
  });
});

describe('checkWorkspaceImports', () => {
  const MANIFESTS = {
    'packages/core-mapping/package.json': '{"name": "core-mapping"}',
    'packages/shared-save-processing/package.json': '{"name": "shared-save-processing"}'
  };

  describe('When a file outside infrastructure/ imports another workspace package', () => {
    it('should print the violation and exit with 1', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {...MANIFESTS, [DOMAIN_FILE]: "import type {SaveWarning} from 'shared-save-processing/gameDefinitions';"}
      });

      // Act
      await checkWorkspaceImports(io);

      // Assert
      expect(printed).toEqual([
        `${DOMAIN_FILE}:1: shared-save-processing/gameDefinitions\n  ${REASON}`,
        'check:workspace-imports: 1 violation(s): outside infrastructure/, a file of a core- package imports no other workspace package, a type, a spec file and a test-support file included.'
      ]);
      expect(exitCodes).toEqual([1]);
    });
  });

  describe('When only the infrastructure imports another workspace package', () => {
    it('should report that nothing was found and exit with 0', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {...MANIFESTS, 'packages/core-mapping/src/infrastructure/locateSaveSection.ts': "import {resolveSectionIndexes} from 'shared-save-processing/sectionIndexes.js';"}
      });

      // Act
      await checkWorkspaceImports(io);

      // Assert
      expect(printed).toEqual(['check:workspace-imports: no file of a core- package outside infrastructure/ imports another workspace package, spec files and testing/ included.']);
      expect(exitCodes).toEqual([0]);
    });
  });
});
