import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveSectionsReaderService} from "../testing/FakeSaveSectionsReaderService";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {ConfigurationPagePresenterPort} from "./ports/ConfigurationPagePresenterPort";
import {LoadConfigurationPage} from "./LoadConfigurationPage";
import {ConfigurationPageResponse} from "./responses/ConfigurationPageResponse";

function createPresenter(): ConfigurationPagePresenterPort {
  return {displayConfigurationPage: mock()};
}

function createUseCase(saveSectionsReader: SaveSectionsReaderPort, presenter: ConfigurationPagePresenterPort): LoadConfigurationPage {
  return new LoadConfigurationPage(saveSectionsReader, presenter);
}

describe('LoadConfigurationPage', () => {
  it('should present the global progression, the statistics and the assessed save configuration', async () => {
    // Arrange
    const presenter = createPresenter();
    const useCase = createUseCase(new FakeSaveSectionsReaderService(), presenter);

    // Act
    await useCase.execute();

    // Assert
    expect(presenter.displayConfigurationPage).toHaveBeenCalledWith({
      globalProgression: {allTimeTerraTokens: 1_234_567},
      statistics: {totalCraftedObjects: 10},
      assessedSaveConfiguration: {
        saveConfiguration: {
          mode: 'Standard',
          title: 'Fake Save',
          modifiers: {terraformationPace: 0.1, gaugeDrain: 0.2, meteoOccurrence: 0.3, multiplayerFactor: 0.4, powerConsumption: 0.5},
          unlocks: {
            freeCraft: false,
            everythingUnlocked: false,
            spaceTrading: true,
            oreExtractors: true,
            teleporters: false,
            drones: true,
            autocrafter: false,
            randomizedMineables: false
          }
        },
        modifierEffects: {
          terraformationPace: 'helpsThePlayer',
          powerConsumption: 'helpsThePlayer',
          gaugeDrain: 'penalisesThePlayer',
          meteoOccurrence: 'helpsThePlayer',
          multiplayerFactor: 'penalisesThePlayer'
        }
      }
    } satisfies ConfigurationPageResponse);
  });

  describe('When the save has no statistics', () => {
    it('should present the global progression without statistics', async () => {
      // Arrange
      const saveSectionsReader: SaveSectionsReaderPort = new FakeSaveSectionsReaderService();
      saveSectionsReader.getStatistics = () => undefined;
      const presenter = createPresenter();
      const useCase = createUseCase(saveSectionsReader, presenter);

      // Act
      await useCase.execute();

      // Assert
      expect(presenter.displayConfigurationPage).toHaveBeenCalledWith({
        globalProgression: {allTimeTerraTokens: 1_234_567},
        statistics: undefined,
        assessedSaveConfiguration: expect.objectContaining({modifierEffects: expect.any(Object)})
      } satisfies ConfigurationPageResponse);
    });
  });

  describe('When the save has no configuration entry', () => {
    it('should present the progression without a save configuration', async () => {
      // Arrange
      const saveSectionsReader: SaveSectionsReaderPort = new FakeSaveSectionsReaderService();
      saveSectionsReader.getSaveConfiguration = () => undefined;
      const presenter = createPresenter();
      const useCase = createUseCase(saveSectionsReader, presenter);

      // Act
      await useCase.execute();

      // Assert
      expect(presenter.displayConfigurationPage).toHaveBeenCalledWith({
        globalProgression: {allTimeTerraTokens: 1_234_567},
        statistics: {totalCraftedObjects: 10},
        assessedSaveConfiguration: undefined
      } satisfies ConfigurationPageResponse);
    });
  });
});
