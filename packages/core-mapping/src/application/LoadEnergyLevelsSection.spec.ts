import {UnreadableLine} from "../domain/save/SaveSectionLocation";
import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveSectionsMapperService} from "../testing/FakeSaveSectionsMapperService";
import {SAVE_CONTENT, stubSaveSectionsReader} from "../testing/stubSaveSectionsReader";
import {stubGameReleasesReader} from "../testing/stubGameReleasesReader";
import {LoadEnergyLevelsSection} from "./LoadEnergyLevelsSection";
import {
  createPlanetWorldObjectsValueObject,
  PlanetWorldObjectsValueObject
} from "../domain/valueObjects/PlanetWorldObjectsValueObject";
import {PlacedWorldObjectEntity} from "../domain/entities/PlacedWorldObjectEntity";
import {WorldObjectEntity} from "../domain/entities/WorldObjectEntity";
import {EnergyLevelsPresenterPort} from "./ports/EnergyLevelsPresenterPort";
import {TerraformationLevelEntity} from "../domain/entities/TerraformationLevelEntity";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {WorldObjectLabelsReaderPort} from "./ports/WorldObjectLabelsReaderPort";
import {EnergyLevelsReaderPort} from "./ports/EnergyLevelsReaderPort";
import {OptimizerRangesReaderPort} from "./ports/OptimizerRangesReaderPort";
import {PlanetNamesReaderPort} from "./ports/PlanetNamesReaderPort";
import {WorldObjectLabelsResponse} from "./responses/WorldObjectLabelsResponse";
import {EnergyLevelValueObject} from "../domain/valueObjects/EnergyLevelValueObject";

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

const PRIME_PLANET_NUMERIC_ID = -1140328421;
const UNKNOWN_PLANET_NUMERIC_ID = 1;

class SaveSectionsWithPlanetsToName extends FakeSaveSectionsMapperService {
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

const ENERGY_LEVELS: readonly EnergyLevelValueObject[] = [
  {worldObjectName: 'EnergyGenerator1', role: 'production', kilowatts: 1.2},
  {worldObjectName: 'EnergyGenerator6', role: 'production', kilowatts: 1_485},
  {worldObjectName: 'Drill4', role: 'consumption', kilowatts: 375.5}
];

const PLANET_NAMES_BY_NUMERIC_ID: Readonly<Record<number, string>> = {[PRIME_PLANET_NUMERIC_ID]: 'Prime'};

const WORLD_OBJECT_LABELS: WorldObjectLabelsResponse = {Drill4: 'Drill T5'};

function createPresenter(): EnergyLevelsPresenterPort {
  return {displayEnergyLevels: mock(), displaySaveWithUnreadableLines: mock()};
}

function createUseCase(saveSectionsReader: SaveSectionsReaderPort, presenter: EnergyLevelsPresenterPort): LoadEnergyLevelsSection {
  const energyLevelsReader: EnergyLevelsReaderPort = {readEnergyLevels: () => ENERGY_LEVELS, readDivergingEnergyLevelsByRelease: () => ({})};
  const optimizerRangesReader: OptimizerRangesReaderPort = {readOptimizerRanges: () => ({})};
  const planetNamesReader: PlanetNamesReaderPort = {findPlanetNameOfNumericId: (numericId) => PLANET_NAMES_BY_NUMERIC_ID[numericId]};
  const worldObjectLabelsReader: WorldObjectLabelsReaderPort = {readWorldObjectLabels: () => WORLD_OBJECT_LABELS};

  return new LoadEnergyLevelsSection({saveSectionsReader, energyLevelsReader, gameReleasesReader: stubGameReleasesReader(), optimizerRangesReader, planetNamesReader, worldObjectLabelsReader}, presenter);
}

describe('LoadEnergyLevelsSection', () => {
  it('should present computed energy levels from parsed save', async () => {
    // Arrange
    const presenter = createPresenter();
    const useCase = createUseCase(stubSaveSectionsReader(), presenter);

    // Act
    await useCase.execute({content: SAVE_CONTENT});

    // Assert
    expect(presenter.displayEnergyLevels).toHaveBeenCalledTimes(1);
    expect(presenter.displayEnergyLevels).toHaveBeenCalledWith({
      gameRelease: '2.004',
      gameReleaseIsEarlierThanCurrent: true,
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
      }],
      worldObjectLabels: WORLD_OBJECT_LABELS
    });
  });

  describe('When the save carries no power consumption modifier', () => {
    it('should charge the base consumption levels, the modifier being 1', async () => {
      // Arrange
      const presenter = createPresenter();
      const useCase = createUseCase(stubSaveSectionsReader({saveSections: new SaveSectionsWithoutSaveConfiguration()}), presenter);

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
      const unreadableLines: UnreadableLine[] = [{section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{not valid json'}];
      const presenter = createPresenter();
      const useCase = createUseCase(stubSaveSectionsReader({unreadableLines}), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT});

      // Assert
      expect(presenter.displaySaveWithUnreadableLines).toHaveBeenCalledWith({unreadableLines: [{section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{not valid json'}]});
      expect(presenter.displayEnergyLevels).not.toHaveBeenCalled();
    });
  });

  describe('When it names the planets of the save', () => {
    it('should name a planet from its numeric id (Rule EN-PLANET-3)', async () => {
      // Arrange
      const presenter = createPresenter();
      const useCase = createUseCase(stubSaveSectionsReader({saveSections: new SaveSectionsWithPlanetsToName()}), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT});

      // Assert
      expect(presenter.displayEnergyLevels).toHaveBeenCalledWith(expect.objectContaining({
        planets: [expect.objectContaining({planetId: PRIME_PLANET_NUMERIC_ID, planetName: 'Prime'}), expect.anything()]
      }));
    });

    it('should offer the terraformed planet names as hints when the numeric id is unknown (Rule EN-PLANET-2)', async () => {
      // Arrange
      const presenter = createPresenter();
      const useCase = createUseCase(stubSaveSectionsReader({saveSections: new SaveSectionsWithPlanetsToName()}), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT});

      // Assert
      expect(presenter.displayEnergyLevels).toHaveBeenCalledWith(expect.objectContaining({
        planets: [expect.anything(), expect.objectContaining({planetId: UNKNOWN_PLANET_NUMERIC_ID, planetName: 'Humble'})]
      }));
    });
  });
});
