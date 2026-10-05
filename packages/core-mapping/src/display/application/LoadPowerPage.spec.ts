import {UnreadableLine} from "../../save/domain/save/SaveSectionLocation";
import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveSectionsMapperService} from "../testing/FakeSaveSectionsMapperService";
import {FakeSaveSectionsMapperServiceWithAnOptimizer} from "../testing/FakeSaveSectionsMapperServiceWithAnOptimizer";
import {SAVE_CONTENT, stubSaveSectionsReader} from "../testing/stubSaveSectionsReader";
import {stubGameReleasesReader} from "../../save/testing/stubGameReleasesReader";
import {LoadPowerPage} from "./LoadPowerPage";
import {
  createPlanetWorldObjectsValueObject,
  PlanetWorldObjectsValueObject
} from "../domain/valueObjects/PlanetWorldObjectsValueObject";
import {PlacedWorldObjectEntity} from "../domain/entities/PlacedWorldObjectEntity";
import {WorldObjectEntity} from "../domain/entities/WorldObjectEntity";
import {PowerPagePresenterPort} from "./ports/PowerPagePresenterPort";
import {TerraformationLevelEntity} from "../domain/entities/TerraformationLevelEntity";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {WorldObjectLabelsReaderPort} from "./ports/WorldObjectLabelsReaderPort";
import {WorldObjectLabelsResponse} from "./responses/WorldObjectLabelsResponse";
import {stubEnergyLevelsReader} from "../testing/stubEnergyLevelsReader";
import {stubOptimizerRangesReader} from "../testing/stubOptimizerRangesReader";
import {PRIME_PLANET_NUMERIC_ID, stubPlanetNamesReader} from "../testing/stubPlanetNamesReader";

const CONSUMER = new PlacedWorldObjectEntity({id: '2', name: 'Drill4' as const, position: [10, 0, 0], planetId: 1});

class FakeSaveSectionsMapperServiceWithoutSaveConfiguration extends FakeSaveSectionsMapperService {
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

const UNKNOWN_PLANET_NUMERIC_ID = 1;

class FakeSaveSectionsMapperServiceWithPlanetsToName extends FakeSaveSectionsMapperService {
  override getPlacedWorldObjectsByPlanet(): PlanetWorldObjectsValueObject[] {
    return [
      createPlanetWorldObjectsValueObject({
        planetId: PRIME_PLANET_NUMERIC_ID,
        placedWorldObjects: [new PlacedWorldObjectEntity({id: '1', name: 'EnergyGenerator1' as const, position: [0, 0, 0], planetId: PRIME_PLANET_NUMERIC_ID})]
      }),
      createPlanetWorldObjectsValueObject({
        planetId: UNKNOWN_PLANET_NUMERIC_ID,
        placedWorldObjects: [
          new PlacedWorldObjectEntity({id: '2', name: 'Seed7Humble' as const, position: [0, 0, 0], planetId: UNKNOWN_PLANET_NUMERIC_ID}),
          new PlacedWorldObjectEntity({id: '3', name: 'EnergyGenerator1' as const, position: [10, 0, 0], planetId: UNKNOWN_PLANET_NUMERIC_ID})
        ]
      })
    ];
  }

  override getTerraformationLevels(): TerraformationLevelEntity[] {
    return [new TerraformationLevelEntity({
      planetId: 'Humble',
      unitOxygenLevel: 0,
      unitHeatLevel: 0,
      unitPressureLevel: 0,
      unitPlantsLevel: 0,
      unitInsectsLevel: 0,
      unitAnimalsLevel: 0,
      unitPurificationLevel: 0
    })];
  }
}

const WORLD_OBJECT_LABELS: WorldObjectLabelsResponse = {Drill4: 'Drill T5'};

function createPresenter(): PowerPagePresenterPort {
  return {displayPowerPage: mock(), displaySaveWithUnreadableLines: mock()};
}

function createUseCase(saveSectionsReader: SaveSectionsReaderPort, presenter: PowerPagePresenterPort): LoadPowerPage {
  const worldObjectLabelsReader: WorldObjectLabelsReaderPort = {readWorldObjectLabels: () => WORLD_OBJECT_LABELS};

  return new LoadPowerPage({
    saveSectionsReader,
    energyLevelsReader: stubEnergyLevelsReader(),
    gameReleasesReader: stubGameReleasesReader(),
    optimizerRangesReader: stubOptimizerRangesReader(),
    planetNamesReader: stubPlanetNamesReader(),
    worldObjectLabelsReader
  }, presenter);
}

describe('LoadPowerPage', () => {
  it('should present computed energy levels from parsed save', async () => {
    // Arrange
    const presenter = createPresenter();
    const useCase = createUseCase(stubSaveSectionsReader(), presenter);

    // Act
    await useCase.execute({content: SAVE_CONTENT});

    // Assert
    expect(presenter.displayPowerPage).toHaveBeenCalledTimes(1);
    expect(presenter.displayPowerPage).toHaveBeenCalledWith({
      gameRelease: '2.004',
      gameReleaseIsEarlierThanCurrent: true,
      powerConsumptionModifier: 0.5,
      powerConsumptionIsModified: true,
      planets: [{
        planetId: 1,
        planetName: undefined,
        production: 1_485,
        consumption: 187.75,
        available: 1_297.25,
        balance: 'surplus',
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
          totalLevel: 187.75,
          productionRatio: 0.12643097643097642
        }],
        optimizers: []
      }],
      worldObjectLabels: WORLD_OBJECT_LABELS
    });
  });

  describe('When the save carries no power consumption modifier', () => {
    it('should charge the base consumption levels, the modifier being 1', async () => {
      // Arrange
      const presenter = createPresenter();
      const useCase = createUseCase(stubSaveSectionsReader({saveSections: new FakeSaveSectionsMapperServiceWithoutSaveConfiguration()}), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT});

      // Assert
      expect(presenter.displayPowerPage).toHaveBeenCalledWith(expect.objectContaining({
        powerConsumptionModifier: 1,
        powerConsumptionIsModified: false,
        planets: [expect.objectContaining({consumption: 375.5})]
      }));
    });
  });

  describe('When a planet carries an energy optimizer', () => {
    it('should present the optimizer with the machine it boosts and the production it contributes', async () => {
      // Arrange
      const presenter = createPresenter();
      const useCase = createUseCase(stubSaveSectionsReader({saveSections: new FakeSaveSectionsMapperServiceWithAnOptimizer()}), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT});

      // Assert
      expect(presenter.displayPowerPage).toHaveBeenCalledWith(expect.objectContaining({
        planets: [expect.objectContaining({
          optimizers: [{
            name: 'Optimizer1',
            fuseCount: 1,
            fuseSlots: 1,
            boostedMachines: [{name: 'EnergyGenerator1', quantity: 1}],
            contribution: 0.6,
            productionRatio: 0.33333333333333337
          }]
        })]
      }));
    });
  });

  describe('When the save has unreadable lines', () => {
    it('should display the unreadable lines instead of the energy levels', async () => {
      // Arrange
      const unreadableLines: UnreadableLine[] = [{code: 'invalid-json', section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{not valid json'}];
      const presenter = createPresenter();
      const useCase = createUseCase(stubSaveSectionsReader({unreadableLines}), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT});

      // Assert
      expect(presenter.displaySaveWithUnreadableLines).toHaveBeenCalledWith({unreadableLines: [{code: 'invalid-json', section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{not valid json'}]});
      expect(presenter.displayPowerPage).not.toHaveBeenCalled();
    });
  });

  describe('When it names the planets of the save', () => {
    it('should name a planet from its numeric id (Rule EN-PLANET-3)', async () => {
      // Arrange
      const presenter = createPresenter();
      const useCase = createUseCase(stubSaveSectionsReader({saveSections: new FakeSaveSectionsMapperServiceWithPlanetsToName()}), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT});

      // Assert
      expect(presenter.displayPowerPage).toHaveBeenCalledWith(expect.objectContaining({
        planets: [expect.objectContaining({planetId: PRIME_PLANET_NUMERIC_ID, planetName: 'Prime'}), expect.anything()]
      }));
    });

    it('should offer the terraformed planet names as hints when the numeric id is unknown (Rule EN-PLANET-2)', async () => {
      // Arrange
      const presenter = createPresenter();
      const useCase = createUseCase(stubSaveSectionsReader({saveSections: new FakeSaveSectionsMapperServiceWithPlanetsToName()}), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT});

      // Assert
      expect(presenter.displayPowerPage).toHaveBeenCalledWith(expect.objectContaining({
        planets: [expect.anything(), expect.objectContaining({planetId: UNKNOWN_PLANET_NUMERIC_ID, planetName: 'Humble'})]
      }));
    });
  });
});
