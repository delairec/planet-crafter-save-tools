import {describe, expect, it} from 'bun:test';
import {createFakeScriptIo} from '../../common/testing/createFakeScriptIo.ts';
import {checkCoreMappingExports} from './check-core-mapping-exports.ts';

const MANIFEST_PATH = 'packages/core-mapping/package.json';
const DISPLAY_COMPOSITION_ROOT_PATH = 'packages/core-mapping/src/display/composition/compositionRoot.ts';
const MERGE_COMPOSITION_ROOT_PATH = 'packages/core-mapping/src/merge/composition/compositionRoot.ts';

const MANIFEST_WITHIN_THE_BOUNDARY = `{
  "name": "core-mapping",
  "exports": {
    "./merge/composition/compositionRoot": "./src/merge/composition/compositionRoot.ts",
    "./display/composition/compositionRoot": "./src/display/composition/compositionRoot.ts",
    "./merge/presentation/viewModels/*": "./src/merge/presentation/viewModels/*.ts",
    "./display/presentation/viewModels/*": "./src/display/presentation/viewModels/*.ts"
  }
}`;

const MERGE_COMPOSITION_ROOT = `import {MergeSaveFilesController} from "../controllers/MergeSaveFilesController";
import {createMergeSaveFiles} from "./useCaseFactories";

export const mergeSaveFilesController = new MergeSaveFilesController(createMergeSaveFiles);
`;

describe('checkCoreMappingExports', () => {

  describe('When core-mapping exports its composition roots and view models, each wiring page and CLI controllers', () => {
    it('should print that the boundary holds and exit with zero', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          [MANIFEST_PATH]: MANIFEST_WITHIN_THE_BOUNDARY,
          [MERGE_COMPOSITION_ROOT_PATH]: MERGE_COMPOSITION_ROOT,
          [DISPLAY_COMPOSITION_ROOT_PATH]: `import {LoadPowerPageController} from "../controllers/LoadPowerPageController";
import {LoadPlanetPageController} from "../controllers/LoadPlanetPageController";
import {createLoadPowerPage, createLoadPlanetPage} from "./useCaseFactories";

export const loadPowerPageController = new LoadPowerPageController(createLoadPowerPage);
export const loadPlanetPageController = new LoadPlanetPageController(createLoadPlanetPage);
`
        }
      });

      // Act
      await checkCoreMappingExports(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: ['check:core-mapping-exports: core-mapping exports the composition root and the view models of each business, and no composition root wires a section controller.'],
        exitCodes: [0]
      });
    });
  });

  describe('When an exported composition root wires a section controller', () => {
    it('should print the line of the export with its reason, then the count, and exit with one', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          [MANIFEST_PATH]: MANIFEST_WITHIN_THE_BOUNDARY,
          [MERGE_COMPOSITION_ROOT_PATH]: MERGE_COMPOSITION_ROOT,
          [DISPLAY_COMPOSITION_ROOT_PATH]: `import {LoadPowerPageController} from "../controllers/LoadPowerPageController";
import {LoadPlayersSectionController} from "../controllers/LoadPlayersSectionController";
import {createLoadPowerPage, createLoadPlayersSection} from "./useCaseFactories";

export const loadPowerPageController = new LoadPowerPageController(createLoadPowerPage);
export const loadPlayersSectionController = new LoadPlayersSectionController(createLoadPlayersSection);
`
        }
      });

      // Act
      await checkCoreMappingExports(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: [
          'packages/core-mapping/src/display/composition/compositionRoot.ts:6\n  a wired controller serves a page or a zone of the save manager, or a CLI; a Load*SectionController serves one section of the save',
          'check:core-mapping-exports: 1 export(s) of core-mapping beyond its boundary.'
        ],
        exitCodes: [1]
      });
    });
  });

  describe('When core-mapping exports a module beyond its composition roots and view models', () => {
    it.each([
      [
        'a controllers folder',
        `{"name": "core-mapping", "exports": {"./display/controllers/*": "./src/display/controllers/*.ts"}}`,
        'packages/core-mapping/package.json "./display/controllers/*": "./src/display/controllers/*.ts"\n  core-mapping exports the composition root of a business, ./<business>/composition/compositionRoot, and its view models, ./<business>/presentation/viewModels/*, each from the same path under ./src'
      ],
      [
        'a use case',
        `{"name": "core-mapping", "exports": {"./display/application/LoadPowerPage": "./src/display/application/LoadPowerPage.ts"}}`,
        'packages/core-mapping/package.json "./display/application/LoadPowerPage": "./src/display/application/LoadPowerPage.ts"\n  core-mapping exports the composition root of a business, ./<business>/composition/compositionRoot, and its view models, ./<business>/presentation/viewModels/*, each from the same path under ./src'
      ],
      [
        'the composition folder by a wildcard',
        `{"name": "core-mapping", "exports": {"./display/composition/*": "./src/display/composition/*.ts"}}`,
        'packages/core-mapping/package.json "./display/composition/*": "./src/display/composition/*.ts"\n  core-mapping exports the composition root of a business, ./<business>/composition/compositionRoot, and its view models, ./<business>/presentation/viewModels/*, each from the same path under ./src'
      ],
      [
        'a controller under the path of a composition root',
        `{"name": "core-mapping", "exports": {"./display/composition/compositionRoot": "./src/display/controllers/LoadPowerPageController.ts"}}`,
        'packages/core-mapping/package.json "./display/composition/compositionRoot": "./src/display/controllers/LoadPowerPageController.ts"\n  core-mapping exports the composition root of a business, ./<business>/composition/compositionRoot, and its view models, ./<business>/presentation/viewModels/*, each from the same path under ./src'
      ]
    ])('should print the export of %s with its reason, then the count, and exit with one', async (_exportedModule, manifest, reportedExport) => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({files: {[MANIFEST_PATH]: manifest}});

      // Act
      await checkCoreMappingExports(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: [
          reportedExport,
          'check:core-mapping-exports: 1 export(s) of core-mapping beyond its boundary.'
        ],
        exitCodes: [1]
      });
    });
  });
});
