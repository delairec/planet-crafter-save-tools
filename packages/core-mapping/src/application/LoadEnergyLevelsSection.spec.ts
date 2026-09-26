import {describe, expect, it, mock} from 'bun:test';
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {FakeSaveSectionsReaderService} from "../testing/FakeSaveSectionsReaderService";
import {LoadEnergyLevelsSection} from "./LoadEnergyLevelsSection";
import {
  createEnergyLevelsRawDataValueObject,
  createPlanetWorldObjectsValueObject,
  EnergyLevelsRawDataValueObject
} from "../domain/valueObjects/EnergyLevelsRawDataValueObject";
import {PlacedWorldObjectEntity} from "../domain/entities/PlacedWorldObjectEntity";

class SaveSectionsReaderWithoutSaveConfiguration extends FakeSaveSectionsReaderService {
  override getEnergyLevelsRawData(): EnergyLevelsRawDataValueObject {
    const consumer = new PlacedWorldObjectEntity({id: '2', name: 'Drill4' as const, position: [10, 0, 0], planetId: 1});

    return createEnergyLevelsRawDataValueObject({
      allWorldObjects: [consumer],
      inventories: [],
      planets: [createPlanetWorldObjectsValueObject({planetId: 1, placedWorldObjects: [consumer]})]
    });
  }
}

describe('LoadEnergyLevelsSection', () => {
  it('should present computed energy levels from parsed save', async () => {
    // Arrange
    const saveSectionsReader: SaveSectionsReaderPort = new FakeSaveSectionsReaderService();
    const presenter = {displayEnergyLevels: mock()};
    const useCase = new LoadEnergyLevelsSection(saveSectionsReader, presenter);

    // Act
    await useCase.execute();

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
      const presenter = {displayEnergyLevels: mock()};
      const useCase = new LoadEnergyLevelsSection(new SaveSectionsReaderWithoutSaveConfiguration(), presenter);

      // Act
      await useCase.execute();

      // Assert
      expect(presenter.displayEnergyLevels).toHaveBeenCalledWith(expect.objectContaining({
        powerConsumptionModifier: 1,
        planets: [expect.objectContaining({consumption: 375.5})]
      }));
    });
  });
});
