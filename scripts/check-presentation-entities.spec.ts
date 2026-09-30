import {describe, expect, it} from 'bun:test';
import {createFakeScriptIo} from './testing/createFakeScriptIo.ts';
import {checkPresentationFiles, findRefusedImports} from './check-presentation-entities.ts';

const RESPONSE_OUTPUT_BOUNDARY_REASON = 'the output boundary hands over responses, value objects or primitives, never a domain entity nor an infrastructure type';
const PRESENTATION_DOMAIN_REASON = 'a presentation file reads application responses and primitives, nothing from domain/ nor infrastructure/';
const CONTROLLER_PRESENTER_REASON = 'a controller knows the view model type only: the composition root creates the presenter and hands it over with the use case';
const PRESENTER_PORT_REASON = 'a presenter port takes application responses or primitives, nothing from domain/';

describe('findRefusedImports', () => {

  describe('When a presentation file imports a module under domain/ or infrastructure/', () => {
    it.each([
      ['a presenter, an entity', 'packages/core-mapping/src/presentation/PlayersPresenter.ts', "import {PlayerEntity} from '../domain/entities/PlayerEntity';", '../domain/entities/PlayerEntity'],
      ['a presenter, a value object', 'packages/core-mapping/src/presentation/PlayersPresenter.ts', "import {PlayerSummaryValueObject} from '../domain/valueObjects/PlayerSummaryValueObject';", '../domain/valueObjects/PlayerSummaryValueObject'],
      ['a presenter spec, a value object', 'packages/core-mapping/src/presentation/PlayersPresenter.spec.ts', "import {PlayerSummaryValueObject} from '../domain/valueObjects/PlayerSummaryValueObject';", '../domain/valueObjects/PlayerSummaryValueObject'],
      ['a presenter spec, a save location', 'packages/core-mapping/src/presentation/PlayersPresenter.spec.ts', "import {UnreadableLine} from '../domain/save/SaveSectionLocation';", '../domain/save/SaveSectionLocation'],
      ['a view model, by a type-only import', 'packages/core-mapping/src/presentation/viewModels/PlayersViewModel.ts', "import type {PlayerEntity} from '../../domain/entities/PlayerEntity';", '../../domain/entities/PlayerEntity'],
      ['a presenter, by a dynamic import', 'packages/core-mapping/src/presentation/PlayersPresenter.ts', "const entity = await import('../domain/entities/WorldObjectEntity');", '../domain/entities/WorldObjectEntity'],
      ['a presenter, from infrastructure', 'packages/core-mapping/src/presentation/PlayersPresenter.ts', 'import {SaveSectionsReaderService} from "../infrastructure/SaveSectionsReaderService";', '../infrastructure/SaveSectionsReaderService']
    ])('should report %s', (_file, filePath, source, specifier) => {
      // Act
      const refusedImports = findRefusedImports(filePath, source);

      // Assert
      expect(refusedImports).toEqual([{line: 1, specifier, reason: PRESENTATION_DOMAIN_REASON}]);
    });

    it('should report the line of the import', () => {
      // Arrange
      const source = [
        "import {PlayersViewModel} from './viewModels/PlayersViewModel';",
        "import {PlayerEntity} from '../domain/entities/PlayerEntity';"
      ].join('\n');

      // Act
      const refusedImports = findRefusedImports('packages/core-mapping/src/presentation/PlayersPresenter.ts', source);

      // Assert
      expect(refusedImports).toEqual([{line: 2, specifier: '../domain/entities/PlayerEntity', reason: PRESENTATION_DOMAIN_REASON}]);
    });
  });

  describe('When a presentation file imports something else', () => {
    it.each([
      ['an application response', "import type {MergeResponse} from '../application/responses/MergeResponse';"],
      ['a view model', "import type {PlayersViewModel} from './viewModels/PlayersViewModel';"],
      ['a module of the same directory whose name starts with domain', "import {domainLabels} from './domainLabels';"]
    ])('should leave %s alone', (_import, source) => {
      // Act
      const refusedImports = findRefusedImports('packages/core-mapping/src/presentation/MergeResultPresenter.ts', source);

      // Assert
      expect(refusedImports).toEqual([]);
    });
  });

  describe('When an application response imports a domain entity or an infrastructure module', () => {
    it.each([
      ['an entity', "import type {WorldObjectEntity} from '../../domain/entities/WorldObjectEntity';", '../../domain/entities/WorldObjectEntity'],
      ['an infrastructure type', "import type {SaveFileDto} from '../../infrastructure/dto/SaveFileDto';", '../../infrastructure/dto/SaveFileDto']
    ])('should report %s', (_import, source, specifier) => {
      // Act
      const refusedImports = findRefusedImports('packages/core-mapping/src/application/responses/MergeResponse.ts', source);

      // Assert
      expect(refusedImports).toEqual([{line: 1, specifier, reason: RESPONSE_OUTPUT_BOUNDARY_REASON}]);
    });
  });

  describe('When an application response imports something else', () => {
    it.each([
      ['a value object', "import {PlayerSummaryValueObject} from '../../domain/valueObjects/PlayerSummaryValueObject';"],
      ['a module whose name merely starts with entity', "import {EntityLabels} from '../../domain/entityLabels';"],
      ['another response', "import type {PlayerSummaryResponse} from './PlayerSummaryResponse';"]
    ])('should leave %s alone', (_import, source) => {
      // Act
      const refusedImports = findRefusedImports('packages/core-mapping/src/application/responses/MergeResponse.ts', source);

      // Assert
      expect(refusedImports).toEqual([]);
    });
  });

  describe('When a presenter port imports a module under domain/', () => {
    it.each([
      ['a value object', "import {PlayerSummaryValueObject} from '../../domain/valueObjects/PlayerSummaryValueObject';", '../../domain/valueObjects/PlayerSummaryValueObject'],
      ['a value object, by a type-only import', "import type {SaveIdentityValueObject} from '../../domain/valueObjects/SaveIdentityValueObject';", '../../domain/valueObjects/SaveIdentityValueObject'],
      ['an entity', "import type {PlayerEntity} from '../../domain/entities/PlayerEntity';", '../../domain/entities/PlayerEntity']
    ])('should report %s', (_import, source, specifier) => {
      // Act
      const refusedImports = findRefusedImports('packages/core-mapping/src/application/ports/PlayersPresenterPort.ts', source);

      // Assert
      expect(refusedImports).toEqual([{line: 1, specifier, reason: PRESENTER_PORT_REASON}]);
    });
  });

  describe('When a port that is not a presenter port imports a module under domain/', () => {
    it('should leave it alone', () => {
      // Arrange
      const source = "import type {PlayerEntity} from '../../domain/entities/PlayerEntity';";

      // Act
      const refusedImports = findRefusedImports('packages/core-mapping/src/application/ports/SaveSectionsReaderPort.ts', source);

      // Assert
      expect(refusedImports).toEqual([]);
    });
  });

  describe('When the file sits outside the output boundary of a core- package', () => {
    it.each([
      ['a use case', 'packages/core-mapping/src/application/LoadPlayersSection.ts'],
      ['a presentation directory of a ui- package', 'packages/ui-save-manager/src/presentation/PlayersView.ts'],
      ['an installed dependency', 'packages/core-mapping/node_modules/x/presentation/Thing.ts'],
      ['a build output', 'packages/core-mapping/dist/presentation/PlayersPresenter.js']
    ])('should leave %s alone', (_file, filePath) => {
      // Arrange
      const source = "import {PlayerEntity} from '../domain/entities/PlayerEntity';";

      // Act
      const refusedImports = findRefusedImports(filePath, source);

      // Assert
      expect(refusedImports).toEqual([]);
    });
  });
});

describe('findRefusedImports, for a controller', () => {

  describe('When a controller imports a presenter', () => {
    it.each([
      ['a controller', 'packages/core-mapping/src/controllers/PlayersController.ts'],
      ['a controller spec', 'packages/core-mapping/src/controllers/PlayersController.spec.ts']
    ])('should report the import of a presenter from %s', (_file, filePath) => {
      // Arrange
      const source = "import {PlayersPresenter} from '../presentation/PlayersPresenter';";

      // Act
      const refusedImports = findRefusedImports(filePath, source);

      // Assert
      expect(refusedImports).toEqual([{line: 1, specifier: '../presentation/PlayersPresenter', reason: CONTROLLER_PRESENTER_REASON}]);
    });
  });

  describe('When a controller imports a view model or a request', () => {
    it.each([
      ['a view model', "import {PlayersViewModel} from '../presentation/viewModels/PlayersViewModel';"],
      ['a request', "import {LoadSaveSectionsRequest} from '../application/requests/LoadSaveSectionsRequest';"]
    ])('should leave %s alone', (_import, source) => {
      // Act
      const refusedImports = findRefusedImports('packages/core-mapping/src/controllers/PlayersController.ts', source);

      // Assert
      expect(refusedImports).toEqual([]);
    });
  });

  describe('When the composition root imports a presenter', () => {
    it('should leave it alone', () => {
      // Arrange
      const source = "import {PlayersPresenter} from '../presentation/PlayersPresenter';";

      // Act
      const refusedImports = findRefusedImports('packages/core-mapping/src/composition/useCaseFactories.ts', source);

      // Assert
      expect(refusedImports).toEqual([]);
    });
  });
});

describe('checkPresentationFiles', () => {

  describe('When no file breaks a refusal', () => {
    it('should print that nothing was found, naming the four refusals, and exit with zero', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'packages/core-mapping/src/presentation/PlayersPresenter.ts': "import type {PlayerSummaryResponse} from '../application/responses/PlayerSummaryResponse';",
          'packages/core-mapping/src/application/ports/PlayersPresenterPort.ts': "import type {PlayerSummaryResponse} from '../responses/PlayerSummaryResponse';"
        }
      });

      // Act
      await checkPresentationFiles(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: ['check:presentation: no presentation file imports domain/ nor infrastructure/, no application response imports a domain entity nor infrastructure/, no presenter port imports domain/, and no controller imports a concrete presenter.'],
        exitCodes: [0]
      });
    });
  });

  describe('When files break the refusals', () => {
    it('should print each offending line with its reason, then the count naming the four refusals, and exit with one', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'packages/core-mapping/src/presentation/PlayersPresenter.ts': "import type {PlayerSummaryValueObject} from '../domain/valueObjects/PlayerSummaryValueObject';",
          'packages/core-mapping/src/application/ports/SaveIdentityPresenterPort.ts': "import {SaveIdentityValueObject} from '../../domain/valueObjects/SaveIdentityValueObject';"
        }
      });

      // Act
      await checkPresentationFiles(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: [
          `packages/core-mapping/src/presentation/PlayersPresenter.ts:1: ../domain/valueObjects/PlayerSummaryValueObject\n  ${PRESENTATION_DOMAIN_REASON}`,
          `packages/core-mapping/src/application/ports/SaveIdentityPresenterPort.ts:1: ../../domain/valueObjects/SaveIdentityValueObject\n  ${PRESENTER_PORT_REASON}`,
          'check:presentation: 2 violation(s): a presentation file imports nothing from domain/ nor infrastructure/, an application response imports nothing from domain/entities nor infrastructure/, a presenter port imports nothing from domain/, and a controller imports no concrete presenter.'
        ],
        exitCodes: [1]
      });
    });
  });
});
