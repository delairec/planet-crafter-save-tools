import {describe, expect, it} from 'bun:test';
import {createFakeScriptIo} from './testing/createFakeScriptIo.ts';
import {checkLayers, findLayerViolations, type LayerViolation} from './check-layers.ts';

const WORKSPACE_PACKAGE_NAMES = new Set(['core-mapping', 'shared-save-processing', 'data-planets']);

const DOMAIN_FILE = 'packages/core-mapping/src/merge/domain/rules/mergeInventories.ts';
const APPLICATION_FILE = 'packages/core-mapping/src/merge/application/MergeSaveFiles.ts';
const INFRASTRUCTURE_FILE = 'packages/core-mapping/src/merge/infrastructure/SaveSectionsSerializerService.ts';
const PRESENTATION_FILE = 'packages/core-mapping/src/merge/presentation/MergeResultPresenter.ts';
const CONTROLLER_FILE = 'packages/core-mapping/src/merge/controllers/MergeSaveFilesController.ts';
const COMPOSITION_FILE = 'packages/core-mapping/src/merge/composition/useCaseFactories.ts';
const LAYERLESS_FILE = 'packages/core-mapping/src/merge/mergeVersion.ts';

const DOMAIN_REASON = 'a domain file imports the domain only: the domain depends on nothing';
const APPLICATION_REASON = 'an application file imports the application and the domain only: never infrastructure, presentation, controllers nor composition';
const INFRASTRUCTURE_REASON = 'an infrastructure file imports the infrastructure, the application and the domain only: never presentation, controllers nor composition';
const PRESENTATION_REASON = 'a presentation file imports the presentation and the application contracts it transforms outcomes with (application/ports, application/requests, application/responses) only: never a use case, controllers nor composition';
const CONTROLLER_REASON = 'a controller imports controllers, the application and the presentation only: never domain, infrastructure nor composition';
const NO_LAYER_REASON = 'a production file of a core- package lies in a layer folder (domain, application, infrastructure, presentation, controllers, composition), where the dependency rule can judge it';
const TEST_SUPPORT_REASON = 'no production file imports a file under testing/: test support is never imported by production runtime code';
const EXTERNAL_REASON = 'outside infrastructure/, a production file imports relative source files only: a runtime module or a package is reached through a port an infrastructure adapter implements';
const JSON_TABLE_REASON = 'outside infrastructure/, no production file imports a JSON table: a value table is a database, read by an infrastructure adapter behind a port';

describe('findLayerViolations', () => {

  describe('When a file imports a layer its own layer may not depend on', () => {
    it.each([
      ['domain importing application', DOMAIN_FILE, "import {MergeSaveFilesRequest} from '../../application/requests/MergeSaveFilesRequest';", '../../application/requests/MergeSaveFilesRequest', DOMAIN_REASON],
      ['domain importing infrastructure', DOMAIN_FILE, "import {sanitizeFileName} from '../../infrastructure/FileNameSanitizerService';", '../../infrastructure/FileNameSanitizerService', DOMAIN_REASON],
      ['domain importing presentation', DOMAIN_FILE, "import type {MergeResultViewModel} from '../../presentation/viewModels/MergeResultViewModel';", '../../presentation/viewModels/MergeResultViewModel', DOMAIN_REASON],
      ['domain importing controllers', DOMAIN_FILE, "import {MergeSaveFilesController} from '../../controllers/MergeSaveFilesController';", '../../controllers/MergeSaveFilesController', DOMAIN_REASON],
      ['domain importing composition', DOMAIN_FILE, "import {createMergeSaveFiles} from '../../composition/useCaseFactories';", '../../composition/useCaseFactories', DOMAIN_REASON],
      ['application importing infrastructure', APPLICATION_FILE, "import {SaveSectionsSerializerService} from '../infrastructure/SaveSectionsSerializerService';", '../infrastructure/SaveSectionsSerializerService', APPLICATION_REASON],
      ['application importing a concrete presenter', APPLICATION_FILE, "import {MergeResultPresenter} from '../presentation/MergeResultPresenter';", '../presentation/MergeResultPresenter', APPLICATION_REASON],
      ['application importing a view model', APPLICATION_FILE, "import type {MergeResultViewModel} from '../presentation/viewModels/MergeResultViewModel';", '../presentation/viewModels/MergeResultViewModel', APPLICATION_REASON],
      ['application importing controllers', APPLICATION_FILE, "import {MergeSaveFilesController} from '../controllers/MergeSaveFilesController';", '../controllers/MergeSaveFilesController', APPLICATION_REASON],
      ['application importing composition', APPLICATION_FILE, "import {createMergeSaveFiles} from '../composition/useCaseFactories';", '../composition/useCaseFactories', APPLICATION_REASON],
      ['infrastructure importing presentation', INFRASTRUCTURE_FILE, "import {MergeResultPresenter} from '../presentation/MergeResultPresenter';", '../presentation/MergeResultPresenter', INFRASTRUCTURE_REASON],
      ['infrastructure importing controllers', INFRASTRUCTURE_FILE, "import {MergeSaveFilesController} from '../controllers/MergeSaveFilesController';", '../controllers/MergeSaveFilesController', INFRASTRUCTURE_REASON],
      ['infrastructure importing composition', INFRASTRUCTURE_FILE, "import {createMergeSaveFiles} from '../composition/useCaseFactories';", '../composition/useCaseFactories', INFRASTRUCTURE_REASON],
      ['presentation importing a use case', PRESENTATION_FILE, "import {MergeSaveFiles} from '../application/MergeSaveFiles';", '../application/MergeSaveFiles', PRESENTATION_REASON],
      ['presentation importing controllers', PRESENTATION_FILE, "import {MergeSaveFilesController} from '../controllers/MergeSaveFilesController';", '../controllers/MergeSaveFilesController', PRESENTATION_REASON],
      ['presentation importing composition', PRESENTATION_FILE, "import {createMergeSaveFiles} from '../composition/useCaseFactories';", '../composition/useCaseFactories', PRESENTATION_REASON],
      ['controllers importing infrastructure', CONTROLLER_FILE, "import {SaveSectionsSerializerService} from '../infrastructure/SaveSectionsSerializerService';", '../infrastructure/SaveSectionsSerializerService', CONTROLLER_REASON],
      ['controllers importing domain', CONTROLLER_FILE, "import {mergeInventories} from '../domain/rules/mergeInventories';", '../domain/rules/mergeInventories', CONTROLLER_REASON],
      ['controllers importing composition', CONTROLLER_FILE, "import {createMergeSaveFiles} from '../composition/useCaseFactories';", '../composition/useCaseFactories', CONTROLLER_REASON]
    ])('should report %s', (_form, filePath, source, specifier, reason) => {
      // Act
      const violations = findLayerViolations(filePath, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect<LayerViolation[]>(violations).toEqual([{line: 1, specifier, reason}]);
    });

    it('should report a layer of another area as it reports one of its own area', () => {
      // Arrange
      const source = "import {SaveSectionsParserService} from '../../save/infrastructure/SaveSectionsParserService';";

      // Act
      const violations = findLayerViolations(APPLICATION_FILE, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect<LayerViolation[]>(violations).toEqual([
        {line: 1, specifier: '../../save/infrastructure/SaveSectionsParserService', reason: APPLICATION_REASON}
      ]);
    });

    it('should report an import written over several lines at the line it starts on', () => {
      // Arrange
      const source = "import {mergeInventories} from './mergeInventories';\nimport {\n  MergeSaveFilesController\n} from '../../controllers/MergeSaveFilesController';";

      // Act
      const violations = findLayerViolations(DOMAIN_FILE, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect<LayerViolation[]>(violations).toEqual([
        {line: 2, specifier: '../../controllers/MergeSaveFilesController', reason: DOMAIN_REASON}
      ]);
    });
  });

  describe('When a file imports a layer its own layer may depend on', () => {
    it.each([
      ['domain importing the domain of the shared area', DOMAIN_FILE, "import {PlayerEntry} from '../../../save/domain/PlayerEntry';"],
      ['application importing domain', APPLICATION_FILE, "import {mergeInventories} from '../domain/rules/mergeInventories';"],
      ['application importing the use-case contract of the shared area', APPLICATION_FILE, "import type {UseCase} from '../../save/application/UseCase';"],
      ['infrastructure importing application', INFRASTRUCTURE_FILE, "import type {SaveSectionsSerializerPort} from '../application/ports/SaveSectionsSerializerPort';"],
      ['infrastructure importing domain', INFRASTRUCTURE_FILE, "import {mergeInventories} from '../domain/rules/mergeInventories';"],
      ['presentation importing a port', PRESENTATION_FILE, "import type {MergeResultPresenterPort} from '../application/ports/MergeResultPresenterPort';"],
      ['presentation importing a request', PRESENTATION_FILE, "import type {MergeSaveFilesRequest} from '../application/requests/MergeSaveFilesRequest';"],
      ['presentation importing a response', PRESENTATION_FILE, "import type {MergeSucceededResponse} from '../application/responses/MergeSucceededResponse';"],
      ['controllers importing a use case', CONTROLLER_FILE, "import type {MergeSaveFiles} from '../application/MergeSaveFiles';"],
      ['controllers importing presentation', CONTROLLER_FILE, "import type {MergeResultViewModel} from '../presentation/viewModels/MergeResultViewModel';"],
      ['composition importing infrastructure', COMPOSITION_FILE, "import {SaveSectionsSerializerService} from '../infrastructure/SaveSectionsSerializerService';"],
      ['composition importing controllers', COMPOSITION_FILE, "import {MergeSaveFilesController} from '../controllers/MergeSaveFilesController';"],
      ['an import of a file under no layer folder', APPLICATION_FILE, "import {VERSION} from '../../version';"]
    ])('should report nothing for %s', (_form, filePath, source) => {
      // Act
      const violations = findLayerViolations(filePath, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect<LayerViolation[]>(violations).toEqual([]);
    });
  });

  describe('When two layer names stand on the path of a file', () => {
    it('should judge the file by the outermost one, so that nesting a folder never leaves a layer', () => {
      // Arrange
      const nestedFile = 'packages/core-mapping/src/merge/domain/infrastructure/readGameReleases.ts';
      const source = "import {readFile} from 'node:fs/promises';";

      // Act
      const violations = findLayerViolations(nestedFile, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect<LayerViolation[]>(violations).toEqual([{line: 1, specifier: 'node:fs/promises', reason: EXTERNAL_REASON}]);
    });

    it('should judge the imported file by the outermost one too', () => {
      // Arrange
      const source = "import {GameRelease} from '../infrastructure/domain/GameRelease';";

      // Act
      const violations = findLayerViolations(APPLICATION_FILE, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect<LayerViolation[]>(violations).toEqual([
        {line: 1, specifier: '../infrastructure/domain/GameRelease', reason: APPLICATION_REASON}
      ]);
    });
  });

  describe('When a production file lies under no layer folder', () => {
    it('should report the file itself', () => {
      // Arrange
      const noImport = 'export const MERGE_VERSION = 1;';

      // Act
      const violations = findLayerViolations(LAYERLESS_FILE, noImport, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect<LayerViolation[]>(violations).toEqual([{reason: NO_LAYER_REASON}]);
    });

    it('should still report its imports of test support and of the outside world', () => {
      // Arrange
      const source = "import {createMergedSections} from './testing/createMergedSections';\nimport {readFile} from 'node:fs/promises';";

      // Act
      const violations = findLayerViolations(LAYERLESS_FILE, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect<LayerViolation[]>(violations).toEqual([
        {reason: NO_LAYER_REASON},
        {line: 1, specifier: './testing/createMergedSections', reason: TEST_SUPPORT_REASON},
        {line: 2, specifier: 'node:fs/promises', reason: EXTERNAL_REASON}
      ]);
    });
  });

  describe('When a production file imports a file under testing/', () => {
    it.each([
      ['a domain file', DOMAIN_FILE, "import {createPlayerEntry} from '../../../save/testing/createPlayerEntry';", '../../../save/testing/createPlayerEntry'],
      ['an infrastructure file', INFRASTRUCTURE_FILE, "import {createMergedSections} from '../testing/createMergedSections';", '../testing/createMergedSections'],
      ['a composition file', COMPOSITION_FILE, "import {enforceTestIsolation} from '../../../../../testing/testIsolation';", '../../../../../testing/testIsolation']
    ])('should report it in %s', (_form, filePath, source, specifier) => {
      // Act
      const violations = findLayerViolations(filePath, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect<LayerViolation[]>(violations).toEqual([{line: 1, specifier, reason: TEST_SUPPORT_REASON}]);
    });
  });

  describe('When a file outside infrastructure/ reaches the outside world', () => {
    it.each([
      ['a domain file importing a runtime module', DOMAIN_FILE, "import {readFile} from 'node:fs/promises';", 'node:fs/promises', EXTERNAL_REASON],
      ['an application file importing a package', APPLICATION_FILE, "import Ajv from 'ajv';", 'ajv', EXTERNAL_REASON],
      ['a composition file importing a package', COMPOSITION_FILE, "import Ajv from 'ajv';", 'ajv', EXTERNAL_REASON],
      ['a domain file importing a JSON table', DOMAIN_FILE, "import releases from './gameReleases.json' with {type: 'json'};", './gameReleases.json', JSON_TABLE_REASON],
      ['a domain file importing a JSON table of the infrastructure', DOMAIN_FILE, "import releases from '../../infrastructure/gameReleases.json';", '../../infrastructure/gameReleases.json', JSON_TABLE_REASON]
    ])('should report %s', (_form, filePath, source, specifier, reason) => {
      // Act
      const violations = findLayerViolations(filePath, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect<LayerViolation[]>(violations).toEqual([{line: 1, specifier, reason}]);
    });

    it.each([
      ['a runtime module', "import {readFile} from 'node:fs/promises';"],
      ['a package', "import Ajv from 'ajv';"],
      ['a JSON table', "import releases from './gameReleases.json';"]
    ])('should report nothing when the infrastructure imports %s', (_form, source) => {
      // Act
      const violations = findLayerViolations(INFRASTRUCTURE_FILE, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect<LayerViolation[]>(violations).toEqual([]);
    });
  });

  describe('When another guard already refuses the import', () => {
    it.each([
      ['presentation importing domain, refused by check:presentation', PRESENTATION_FILE, "import {PlayerEntry} from '../../save/domain/PlayerEntry';"],
      ['presentation importing infrastructure, refused by check:presentation', PRESENTATION_FILE, "import {SaveSectionsSerializerService} from '../infrastructure/SaveSectionsSerializerService';"],
      ['a response importing infrastructure, refused by check:presentation', 'packages/core-mapping/src/merge/application/responses/MergeSucceededResponse.ts', "import type {SerializedSave} from '../../infrastructure/SerializedSave';"],
      ['domain importing a workspace package, refused by check:workspace-imports', DOMAIN_FILE, "import {selectPlanetRows} from 'data-planets/selectPlanetRows';"],
      ['domain importing a JSON table of a workspace package, refused by check:workspace-imports', DOMAIN_FILE, "import planets from 'data-planets/planets.json';"]
    ])('should leave %s', (_form, filePath, source) => {
      // Act
      const violations = findLayerViolations(filePath, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect<LayerViolation[]>(violations).toEqual([]);
    });

    it('should report a side-effect import from presentation to domain, which check:presentation does not read', () => {
      // Arrange
      const source = "import '../../save/domain/PlayerEntry';";

      // Act
      const violations = findLayerViolations(PRESENTATION_FILE, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect<LayerViolation[]>(violations).toEqual([
        {line: 1, specifier: '../../save/domain/PlayerEntry', reason: PRESENTATION_REASON}
      ]);
    });
  });

  describe('When the import or the file falls under a limit the guard keeps', () => {
    it.each([
      ['a production file importing a spec file outside testing/', DOMAIN_FILE, "import {MERGED_INVENTORIES} from './mergeInventories.spec';"],
      ['an area folder named after a layer, read as that layer', 'packages/core-mapping/src/composition/domain/rules/compose.ts', "import {SaveSectionsSerializerService} from '../../infrastructure/SaveSectionsSerializerService';"]
    ])('should report nothing for %s', (_form, filePath, source) => {
      // Act
      const violations = findLayerViolations(filePath, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect<LayerViolation[]>(violations).toEqual([]);
    });
  });

  describe('When the file is not a production source of a core- package', () => {
    it.each([
      ['a spec file', 'packages/core-mapping/src/merge/domain/rules/mergeInventories.spec.ts'],
      ['a test-support file', 'packages/core-mapping/src/merge/testing/createMergedSections.ts'],
      ['a file of a core- package outside src/', 'packages/core-mapping/testSetup.ts'],
      ['a file of a package that is not a core- package', 'packages/cli-merge/src/domain/merge.js']
    ])('should report nothing for %s', (_form, filePath) => {
      // Arrange
      const source = "import {MergeSaveFilesController} from '../../controllers/MergeSaveFilesController';\nimport {readFile} from 'node:fs/promises';";

      // Act
      const violations = findLayerViolations(filePath, source, WORKSPACE_PACKAGE_NAMES);

      // Assert
      expect<LayerViolation[]>(violations).toEqual([]);
    });
  });
});

describe('checkLayers', () => {
  const MANIFESTS = {
    'packages/core-mapping/package.json': '{"name": "core-mapping"}',
    'packages/data-planets/package.json': '{"name": "data-planets"}'
  };

  describe('When a file breaks the dependency rule and another lies in no layer', () => {
    it('should print every violation and exit with 1', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          ...MANIFESTS,
          [DOMAIN_FILE]: "import {selectPlanetRows} from 'data-planets/selectPlanetRows';\nimport {MergeSaveFiles} from '../../application/MergeSaveFiles';",
          [LAYERLESS_FILE]: 'export const MERGE_VERSION = 1;'
        }
      });

      // Act
      await checkLayers(io);

      // Assert
      expect(printed).toEqual([
        `${DOMAIN_FILE}:2: ../../application/MergeSaveFiles\n  ${DOMAIN_REASON}`,
        `${LAYERLESS_FILE}\n  ${NO_LAYER_REASON}`,
        'check:layers: 2 violation(s): a production file of a core- package lies in a layer and imports only the layers the dependency rule allows it, no file under testing/, and outside infrastructure/ no runtime module, package nor JSON table.'
      ]);
      expect(exitCodes).toEqual([1]);
    });
  });

  describe('When every production file imports only what its layer allows', () => {
    it('should report that nothing was found and exit with 0', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          ...MANIFESTS,
          [APPLICATION_FILE]: "import {mergeInventories} from '../domain/rules/mergeInventories';",
          [INFRASTRUCTURE_FILE]: "import planets from 'data-planets/planets.json';"
        }
      });

      // Act
      await checkLayers(io);

      // Assert
      expect(printed).toEqual(['check:layers: every production file of a core- package lies in a layer and imports only the layers the dependency rule allows it, no file under testing/, and outside infrastructure/ relative source files only.']);
      expect(exitCodes).toEqual([0]);
    });
  });
});
