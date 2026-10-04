import {describe, expect, it, mock} from 'bun:test';
import {UnreadableLine} from "../../save/domain/save/SaveSectionLocation";
import {FakeSaveSectionsMapperServiceWithPrimeTerraformedAndEquipped} from "../testing/FakeSaveSectionsMapperServiceWithPrimeTerraformedAndEquipped";
import {FakeSaveSectionsMapperServiceWithAnOptimizer} from "../testing/FakeSaveSectionsMapperServiceWithAnOptimizer";
import {SAVE_CONTENT, stubSaveSectionsReader} from "../testing/stubSaveSectionsReader";
import {stubGameReleasesReader} from "../../save/testing/stubGameReleasesReader";
import {stubEnergyLevelsReader} from "../testing/stubEnergyLevelsReader";
import {stubOptimizerRangesReader} from "../testing/stubOptimizerRangesReader";
import {PRIME_PLANET_NUMERIC_ID, stubPlanetNamesReader} from "../testing/stubPlanetNamesReader";
import {LoadPlanetPage} from "./LoadPlanetPage";
import {PlanetPagePresenterPort} from "./ports/PlanetPagePresenterPort";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {WorldObjectLabelsReaderPort} from "./ports/WorldObjectLabelsReaderPort";
import {WorldObjectLabelsResponse} from "./responses/WorldObjectLabelsResponse";

const WORLD_OBJECT_LABELS: WorldObjectLabelsResponse = {EnergyGenerator6: 'Nuclear reactor T2', Drill4: 'Drill T5'};

function createPresenter(): PlanetPagePresenterPort {
  return {displayPlanetPage: mock(), displayUnknownPlanet: mock(), displaySaveWithUnreadableLines: mock()};
}

function createUseCase(saveSectionsReader: SaveSectionsReaderPort, presenter: PlanetPagePresenterPort): LoadPlanetPage {
  const worldObjectLabelsReader: WorldObjectLabelsReaderPort = {readWorldObjectLabels: () => WORLD_OBJECT_LABELS};

  return new LoadPlanetPage({
    saveSectionsReader,
    energyLevelsReader: stubEnergyLevelsReader(),
    gameReleasesReader: stubGameReleasesReader(),
    optimizerRangesReader: stubOptimizerRangesReader(),
    planetNamesReader: stubPlanetNamesReader(),
    worldObjectLabelsReader
  }, presenter);
}

describe('LoadPlanetPage', () => {
  it('should present the power and the terraformation of the planet the request names', async () => {
    // Arrange
    const presenter = createPresenter();
    const useCase = createUseCase(stubSaveSectionsReader({saveSections: new FakeSaveSectionsMapperServiceWithPrimeTerraformedAndEquipped()}), presenter);

    // Act
    await useCase.execute({content: SAVE_CONTENT, planetIdentifier: 'Prime'});

    // Assert
    expect(presenter.displayPlanetPage).toHaveBeenCalledWith({
      gameRelease: '2.004',
      gameReleaseIsEarlierThanCurrent: true,
      powerConsumptionModifier: 0.5,
      powerConsumptionIsModified: true,
      planetName: 'Prime',
      energyLevels: {
        planetId: PRIME_PLANET_NUMERIC_ID,
        planetName: 'Prime',
        production: 1_485,
        consumption: 187.75,
        available: 1_297.25,
        balance: 'surplus',
        productionBreakdown: [{name: 'EnergyGenerator6', quantity: 1, unitLevel: 1_485, totalLevel: 1_485, productionRatio: 1}],
        consumptionBreakdown: [{name: 'Drill4', quantity: 1, unitLevel: 187.75, totalLevel: 187.75, productionRatio: 0.12643097643097642}],
        optimizers: []
      },
      terraformation: {
        levels: {
          planetId: 'Prime',
          unitOxygenLevel: 1_000,
          unitHeatLevel: 2_000,
          unitPressureLevel: 3_000,
          unitPlantsLevel: 400,
          unitInsectsLevel: 500,
          unitAnimalsLevel: 600,
          unitPurificationLevel: undefined,
          terraformationIndex: 7_500,
          biomass: 1_500
        },
        systemTerraformationIndex: {index: 7_500, planetCount: 1}
      },
      worldObjectLabels: {EnergyGenerator6: 'Nuclear reactor T2', Drill4: 'Drill T5'}
    });
    expect(presenter.displayUnknownPlanet).not.toHaveBeenCalled();
  });

  describe('When the planet has terraformation levels but no machine placed', () => {
    it('should present its terraformation without energy levels', async () => {
      // Arrange
      const presenter = createPresenter();
      const useCase = createUseCase(stubSaveSectionsReader(), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT, planetIdentifier: 'Toxicity'});

      // Assert
      expect(presenter.displayPlanetPage).toHaveBeenCalledWith({
        gameRelease: '2.004',
        gameReleaseIsEarlierThanCurrent: true,
        powerConsumptionModifier: 0.5,
        powerConsumptionIsModified: true,
        planetName: 'Toxicity',
        terraformation: {
          levels: {
            planetId: 'Toxicity',
            unitOxygenLevel: 100,
            unitHeatLevel: 200,
            unitPressureLevel: 300,
            unitPlantsLevel: 400,
            unitInsectsLevel: 500,
            unitAnimalsLevel: 600,
            unitPurificationLevel: 700,
            terraformationIndex: 2_800,
            biomass: 1_500
          },
          systemTerraformationIndex: {index: 2_800, planetCount: 1}
        },
        worldObjectLabels: {EnergyGenerator6: 'Nuclear reactor T2', Drill4: 'Drill T5'}
      });
    });
  });

  describe('When the planet has no name and machines placed but no terraformation level', () => {
    it('should present its energy levels, found by its numeric identifier written in decimal', async () => {
      // Arrange
      const presenter = createPresenter();
      const useCase = createUseCase(stubSaveSectionsReader(), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT, planetIdentifier: '1'});

      // Assert
      expect(presenter.displayPlanetPage).toHaveBeenCalledWith({
        gameRelease: '2.004',
        gameReleaseIsEarlierThanCurrent: true,
        powerConsumptionModifier: 0.5,
        powerConsumptionIsModified: true,
        energyLevels: {
          planetId: 1,
          planetName: undefined,
          production: 1_485,
          consumption: 187.75,
          available: 1_297.25,
          balance: 'surplus',
          productionBreakdown: [{name: 'EnergyGenerator6', quantity: 1, unitLevel: 1_485, totalLevel: 1_485, productionRatio: 1}],
          consumptionBreakdown: [{name: 'Drill4', quantity: 1, unitLevel: 187.75, totalLevel: 187.75, productionRatio: 0.12643097643097642}],
          optimizers: []
        },
        worldObjectLabels: {EnergyGenerator6: 'Nuclear reactor T2', Drill4: 'Drill T5'}
      });
    });
  });

  describe('When the planet carries an energy optimizer', () => {
    it('should present the optimizer with the machine it boosts and the production it contributes', async () => {
      // Arrange
      const presenter = createPresenter();
      const useCase = createUseCase(stubSaveSectionsReader({saveSections: new FakeSaveSectionsMapperServiceWithAnOptimizer()}), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT, planetIdentifier: '1'});

      // Assert
      expect(presenter.displayPlanetPage).toHaveBeenCalledWith(expect.objectContaining({
        energyLevels: expect.objectContaining({
          optimizers: [{
            name: 'Optimizer1',
            fuseCount: 1,
            fuseSlots: 1,
            boostedMachines: [{name: 'EnergyGenerator1', quantity: 1}],
            contribution: 0.6,
            productionRatio: 0.33333333333333337
          }]
        })
      }));
    });
  });

  describe('When no planet of the save answers to the identifier', () => {
    it('should display that the planet is unknown instead of a planet page', async () => {
      // Arrange
      const presenter = createPresenter();
      const useCase = createUseCase(stubSaveSectionsReader(), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT, planetIdentifier: 'Humble'});

      // Assert
      expect(presenter.displayUnknownPlanet).toHaveBeenCalledTimes(1);
      expect(presenter.displayPlanetPage).not.toHaveBeenCalled();
    });
  });

  describe('When the save has unreadable lines', () => {
    it('should display the unreadable lines instead of the planet page', async () => {
      // Arrange
      const unreadableLines: UnreadableLine[] = [{code: 'invalid-json', section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{not valid json'}];
      const presenter = createPresenter();
      const useCase = createUseCase(stubSaveSectionsReader({unreadableLines}), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT, planetIdentifier: 'Toxicity'});

      // Assert
      expect(presenter.displaySaveWithUnreadableLines).toHaveBeenCalledWith({unreadableLines: [{code: 'invalid-json', section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{not valid json'}]});
      expect(presenter.displayPlanetPage).not.toHaveBeenCalled();
    });
  });
});
