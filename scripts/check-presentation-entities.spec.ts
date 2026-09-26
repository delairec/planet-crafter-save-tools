import {describe, expect, it} from 'bun:test';
import {createFakeScriptIo} from './testing/createFakeScriptIo.ts';
import {checkPresentationFiles, findEntityImports, isPresentationFile} from './check-presentation-entities.ts';

describe('isPresentationFile', () => {

  describe('When the file lives under a presentation directory', () => {
    it('should recognise it wherever that directory sits', () => {
      // Act
      const isPresenter = isPresentationFile('packages/core-mapping/src/presentation/PlayersPresenter.ts');
      const isViewModel = isPresentationFile('packages/core-mapping/src/presentation/viewModels/PlayersViewModel.ts');

      // Assert
      expect(isPresenter).toBe(true);
      expect(isViewModel).toBe(true);
    });
  });

  describe('When the file lives outside a presentation directory', () => {
    it('should leave it alone', () => {
      // Act
      const isUseCase = isPresentationFile('packages/core-mapping/src/application/LoadPlayersSection.ts');
      const isInfrastructureService = isPresentationFile('packages/core-mapping/src/infrastructure/SaveSectionsReaderService.ts');

      // Assert
      expect(isUseCase).toBe(false);
      expect(isInfrastructureService).toBe(false);
    });
  });

  describe('When the file is generated', () => {
    it('should leave it alone even under a presentation directory', () => {
      // Act
      const isInstalledDependency = isPresentationFile('packages/ui-save-manager/node_modules/x/presentation/Thing.ts');
      const isBuildOutput = isPresentationFile('packages/core-mapping/dist/presentation/PlayersPresenter.js');

      // Assert
      expect(isInstalledDependency).toBe(false);
      expect(isBuildOutput).toBe(false);
    });
  });
});

describe('findEntityImports', () => {

  describe('When a file imports a domain entity', () => {
    it('should report the line and the specifier', () => {
      // Arrange
      const source = [
        "import {PlayersViewModel} from './viewModels/PlayersViewModel';",
        'import {PlayerEntity} from "../domain/entities/PlayerEntity";'
      ].join('\n');

      // Act
      const entityImports = findEntityImports(source);

      // Assert
      expect(entityImports).toEqual([{line: 2, specifier: '../domain/entities/PlayerEntity'}]);
    });

    it('should report a type-only import', () => {
      // Arrange
      const source = "import type {PlayerEntity} from '../../domain/entities/PlayerEntity';";

      // Act
      const entityImports = findEntityImports(source);

      // Assert
      expect(entityImports).toEqual([{line: 1, specifier: '../../domain/entities/PlayerEntity'}]);
    });

    it('should report a dynamic import', () => {
      // Arrange
      const source = "const entity = await import('../domain/entities/WorldObjectEntity');";

      // Act
      const entityImports = findEntityImports(source);

      // Assert
      expect(entityImports).toEqual([{line: 1, specifier: '../domain/entities/WorldObjectEntity'}]);
    });
  });

  describe('When a file imports something else of the domain', () => {
    it('should leave a value object import alone', () => {
      // Arrange
      const source = "import {PlayerSummaryValueObject} from '../domain/valueObjects/PlayerSummaryValueObject';";

      // Act
      const entityImports = findEntityImports(source);

      // Assert
      expect(entityImports).toEqual([]);
    });

    it('should leave a name that merely ends in Entity alone', () => {
      // Arrange
      const source = "import {EntityLabels} from '../domain/entityLabels';";

      // Act
      const entityImports = findEntityImports(source);

      // Assert
      expect(entityImports).toEqual([]);
    });
  });
});

describe('checkPresentationFiles', () => {

  describe('When every presentation layer imports value objects only', () => {
    it('should print that nothing was found and exit with zero', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'packages/core-mapping/src/presentation/PlayersPresenter.ts': "import {PlayerSummaryValueObject} from '../domain/valueObjects/PlayerSummaryValueObject';"
        }
      });

      // Act
      await checkPresentationFiles(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: ['check:presentation: no domain entity reaches a presentation layer.'],
        exitCodes: [0]
      });
    });
  });

  describe('When a presentation layer imports a domain entity', () => {
    it('should print each offending line with its reason, then the count, and exit with one', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'packages/core-mapping/src/presentation/PlayersPresenter.ts': "import type {PlayerEntity} from '../domain/entities/PlayerEntity';"
        }
      });

      // Act
      await checkPresentationFiles(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: [
          'packages/core-mapping/src/presentation/PlayersPresenter.ts:1: ../domain/entities/PlayerEntity\n  a presenter takes a value object, never a domain entity',
          'check:presentation: 1 domain entity import(s) in a presentation layer.'
        ],
        exitCodes: [1]
      });
    });
  });
});
