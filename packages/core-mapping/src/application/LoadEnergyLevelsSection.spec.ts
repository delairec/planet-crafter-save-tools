import {SaveParseError} from "shared-save-processing/gameDefinitions";
import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveSectionsMapperService} from "../testing/FakeSaveSectionsMapperService";
import {SAVE_CONTENT, stubSaveSectionsReader} from "../testing/stubSaveSectionsReader";
import {LoadEnergyLevelsSection} from "./LoadEnergyLevelsSection";
import {
  createPlanetWorldObjectsValueObject,
  PlanetWorldObjectsValueObject
} from "../domain/valueObjects/PlanetWorldObjectsValueObject";
import {PlacedWorldObjectEntity} from "../domain/entities/PlacedWorldObjectEntity";
import {WorldObjectEntity} from "../domain/entities/WorldObjectEntity";
import {EnergyLevelsPresenterPort} from "./ports/EnergyLevelsPresenterPort";

const CONSUMER = new PlacedWorldObjectEntity({id: '2', name: 'Drill4' as const, position: [10, 0, 0], planetId: 1});

class SaveSectionsWithoutSaveConfiguration extends FakeSaveSectionsMapperService {
  override getPlacedWorldObjectsByPlanet(): PlanetWorldObjectsValueObject[] {
    return [createPlanetWorldObjectsValueObject({planetId: 1, placedWorldObjects: [CONSUMER]})];
  }

  override getWorldObjects(): WorldObjectEntity[] {
    return [CONSUMER];
  }

  override getDeclaredVersion(): string | undefined {
    return undefined;
  }

  override getSaveConfiguration(): undefined {
    return undefined;
  }
}

function createPresenter(): EnergyLevelsPresenterPort {
  return {displayEnergyLevels: mock(), displaySaveWithUnreadableLines: mock()};
}

describe('LoadEnergyLevelsSection', () => {
  it('should present computed energy levels from parsed save', async () => {
    // Arrange
    const presenter = createPresenter();
    const useCase = new LoadEnergyLevelsSection(stubSaveSectionsReader(), presenter);

    // Act
    await useCase.execute({content: SAVE_CONTENT});

    // Assert
    expect(presenter.displayEnergyLevels).toHaveBeenCalledTimes(1);
    expect(presenter.displayEnergyLevels).toHaveBeenCalledWith({
      gameRelease: '2.004',
      powerConsumptionModifier: 0.5,
      planets: [{
        planetId: 1,
        planetName: undefined,
        production: 1_485,
        consumption: 187.75,
        available: 1_297.25,
        productionBreakdown: [{
          name: 'EnergyGenerator6',
          quantity: 1,
          unitLevel: 1_485,
          totalLevel: 1_485,
          productionRatio: 1
        }],
        consumptionBreakdown: [{
          name: 'Drill4',
          quantity: 1,
          unitLevel: 187.75,
          totalLevel: 187.75
        }],
        optimizers: []
      }]
    });
  });

  describe('When the save carries no power consumption modifier', () => {
    it('should charge the base consumption levels, the modifier being 1', async () => {
      // Arrange
      const presenter = createPresenter();
      const useCase = new LoadEnergyLevelsSection(stubSaveSectionsReader({saveSections: new SaveSectionsWithoutSaveConfiguration()}), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT});

      // Assert
      expect(presenter.displayEnergyLevels).toHaveBeenCalledWith(expect.objectContaining({
        powerConsumptionModifier: 1,
        planets: [expect.objectContaining({consumption: 375.5})]
      }));
    });
  });

  describe('When the save has unreadable lines', () => {
    it('should display the unreadable lines instead of the energy levels', async () => {
      // Arrange
      const unreadableLines: SaveParseError[] = [{detail: 'Entry is not valid JSON', section: 3, entryIndex: 2}];
      const presenter = createPresenter();
      const useCase = new LoadEnergyLevelsSection(stubSaveSectionsReader({unreadableLines}), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT});

      // Assert
      expect(presenter.displaySaveWithUnreadableLines).toHaveBeenCalledWith([{detail: 'Entry is not valid JSON', section: 3, entryIndex: 2}]);
      expect(presenter.displayEnergyLevels).not.toHaveBeenCalled();
    });
  });
});
