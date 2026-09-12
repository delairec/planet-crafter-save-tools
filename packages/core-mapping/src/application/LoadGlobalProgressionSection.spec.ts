import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveParserService} from "../testing/FakeSaveParserService";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {LoadGlobalProgressionSection} from "./LoadGlobalProgressionSection";
import {GlobalProgressionPresenterPort} from "./ports/GlobalProgressionPresenterPort";

describe('LoadGlobalProgressionSection', () => {
  function createPresenter(): GlobalProgressionPresenterPort {
    return {displayGlobalProgression: mock(), displayGlobalProgressionWithoutStatistics: mock()};
  }

  describe('When the save carries a statistics section', () => {
    it('should present global progression and statistics from the parsed save', async () => {
      // Arrange
      const saveParser: SaveSectionsReaderPort = new FakeSaveParserService();
      const presenter = createPresenter();
      const useCase = new LoadGlobalProgressionSection(saveParser, presenter);

      // Act
      await useCase.execute();

      // Assert
      expect(presenter.displayGlobalProgression).toHaveBeenCalledTimes(1);
      expect(presenter.displayGlobalProgression).toHaveBeenCalledWith({allTimeTerraTokens: 1_234_567}, {totalCraftedObjects: 10});
    });
  });

  describe('When the save carries no statistics section', () => {
    it('should present the global progression alone', async () => {
      // Arrange
      const saveParser: SaveSectionsReaderPort = Object.assign(new FakeSaveParserService(), {getStatistics: () => undefined});
      const presenter = createPresenter();
      const useCase = new LoadGlobalProgressionSection(saveParser, presenter);

      // Act
      await useCase.execute();

      // Assert
      expect(presenter.displayGlobalProgressionWithoutStatistics).toHaveBeenCalledWith({allTimeTerraTokens: 1_234_567});
      expect(presenter.displayGlobalProgression).not.toHaveBeenCalled();
    });
  });
});
