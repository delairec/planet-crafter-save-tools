import {describe, expect, it, mock} from "bun:test";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {FakeSaveSectionsReaderService} from "../testing/FakeSaveSectionsReaderService";
import {SaveConfigurationPresenterPort} from "./ports/SaveConfigurationPresenterPort";
import {LoadSaveConfigurationSection} from "./LoadSaveConfigurationSection";

describe('LoadSaveConfigurationSection', () => {
  function createPresenter(): SaveConfigurationPresenterPort {
    return {displaySaveConfiguration: mock(), displayMissingSaveConfigurationSection: mock()};
  }

  describe('When the save carries a configuration section', () => {
    it('should present the save configuration from the parsed save', async () => {
      // Arrange
      const saveSectionsReader: SaveSectionsReaderPort = new FakeSaveSectionsReaderService();
      const presenter = createPresenter();
      const useCase = new LoadSaveConfigurationSection(saveSectionsReader, presenter);

      // Act
      await useCase.execute();

      // Assert
      expect(presenter.displaySaveConfiguration).toHaveBeenCalledTimes(1);
      expect(presenter.displaySaveConfiguration).toHaveBeenCalledWith({
        mode: 'Standard',
        title: 'Fake Save',
        modifiers: {
          terraformationPace: 0.1,
          gaugeDrain: 0.2,
          meteoOccurrence: 0.3,
          multiplayerFactor: 0.4,
          powerConsumption: 0.5
        }
      });
    });
  });

  describe('When the save carries no configuration section', () => {
    it('should present the section as missing', async () => {
      // Arrange
      const saveSectionsReader: SaveSectionsReaderPort = Object.assign(new FakeSaveSectionsReaderService(), {getSaveConfiguration: () => undefined});
      const presenter = createPresenter();
      const useCase = new LoadSaveConfigurationSection(saveSectionsReader, presenter);

      // Act
      await useCase.execute();

      // Assert
      expect(presenter.displayMissingSaveConfigurationSection).toHaveBeenCalledTimes(1);
      expect(presenter.displaySaveConfiguration).not.toHaveBeenCalled();
    });
  });
});
