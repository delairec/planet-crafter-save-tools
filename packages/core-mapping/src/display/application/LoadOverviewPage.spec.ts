import {UnreadableLine} from "../../save/domain/save/SaveSectionLocation";
import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveSectionsMapperService} from "../testing/FakeSaveSectionsMapperService";
import {SAVE_CONTENT, stubSaveSectionsReader} from "../testing/stubSaveSectionsReader";
import {stubGameReleasesReader} from "../../save/testing/stubGameReleasesReader";
import {WORLD_OBJECTS_SECTION} from "../../save/testing/saveSectionLocations";
import {OPTIMIZER_RANGES} from "../testing/energyLevelTablesFixture";
import {createGlobalProgressionValueObject} from "../domain/valueObjects/GlobalProgressionValueObject";
import {
  createPlanetWorldObjectsValueObject,
  PlanetWorldObjectsValueObject
} from "../domain/valueObjects/PlanetWorldObjectsValueObject";
import {EnergyLevelValueObject} from "../domain/valueObjects/EnergyLevelValueObject";
import {PlacedWorldObjectEntity} from "../domain/entities/PlacedWorldObjectEntity";
import {WorldObjectEntity} from "../domain/entities/WorldObjectEntity";
import {TerraformationLevelEntity} from "../domain/entities/TerraformationLevelEntity";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {EnergyLevelsReaderPort} from "./ports/EnergyLevelsReaderPort";
import {OptimizerRangesReaderPort} from "./ports/OptimizerRangesReaderPort";
import {PlanetNamesReaderPort} from "./ports/PlanetNamesReaderPort";
import {OverviewPagePresenterPort} from "./ports/OverviewPagePresenterPort";
import {LoadOverviewPage} from "./LoadOverviewPage";

const PRIME_PLANET_NUMERIC_ID = -1140328421;
const UNNAMED_PLANET_NUMERIC_ID = 1;

const PRIME_TERRAFORMATION_LEVEL = new TerraformationLevelEntity({
  planetId: 'Prime',
  unitOxygenLevel: 1_000,
  unitHeatLevel: 2_000,
  unitPressureLevel: 3_000,
  unitPlantsLevel: 400,
  unitInsectsLevel: 500,
  unitAnimalsLevel: 600,
  unitPurificationLevel: undefined
});

const PRIME_GENERATOR = new PlacedWorldObjectEntity({id: '1', name: 'EnergyGenerator6' as const, position: [0, 0, 0], planetId: PRIME_PLANET_NUMERIC_ID});
const PRIME_DRILL = new PlacedWorldObjectEntity({id: '2', name: 'Drill4' as const, position: [10, 0, 0], planetId: PRIME_PLANET_NUMERIC_ID});
const UNNAMED_PLANET_GENERATOR = new PlacedWorldObjectEntity({id: '3', name: 'EnergyGenerator1' as const, position: [0, 0, 0], planetId: UNNAMED_PLANET_NUMERIC_ID});

class SaveSectionsWithPrimeTerraformedAndEquipped extends FakeSaveSectionsMapperService {
  override getTerraformationLevels(): TerraformationLevelEntity[] {
    return [PRIME_TERRAFORMATION_LEVEL];
  }

  override getPlacedWorldObjectsByPlanet(): PlanetWorldObjectsValueObject[] {
    return [createPlanetWorldObjectsValueObject({planetId: PRIME_PLANET_NUMERIC_ID, placedWorldObjects: [PRIME_GENERATOR, PRIME_DRILL]})];
  }

  override getWorldObjects(): WorldObjectEntity[] {
    return [PRIME_GENERATOR, PRIME_DRILL];
  }
}

class SaveSectionsWithPrimeTerraformedWithoutMachines extends FakeSaveSectionsMapperService {
  override getTerraformationLevels(): TerraformationLevelEntity[] {
    return [PRIME_TERRAFORMATION_LEVEL];
  }

  override getPlacedWorldObjectsByPlanet(): PlanetWorldObjectsValueObject[] {
    return [];
  }

  override getWorldObjects(): WorldObjectEntity[] {
    return [];
  }
}

class SaveSectionsWithAnUnnamedPlanetEquippedBeforePrime extends FakeSaveSectionsMapperService {
  override getTerraformationLevels(): TerraformationLevelEntity[] {
    return [PRIME_TERRAFORMATION_LEVEL];
  }

  override getPlacedWorldObjectsByPlanet(): PlanetWorldObjectsValueObject[] {
    return [
      createPlanetWorldObjectsValueObject({planetId: UNNAMED_PLANET_NUMERIC_ID, placedWorldObjects: [UNNAMED_PLANET_GENERATOR]}),
      createPlanetWorldObjectsValueObject({planetId: PRIME_PLANET_NUMERIC_ID, placedWorldObjects: [PRIME_GENERATOR, PRIME_DRILL]})
    ];
  }

  override getWorldObjects(): WorldObjectEntity[] {
    return [UNNAMED_PLANET_GENERATOR, PRIME_GENERATOR, PRIME_DRILL];
  }
}

const ENERGY_LEVELS: readonly EnergyLevelValueObject[] = [
  {worldObjectName: 'EnergyGenerator1', role: 'production', kilowatts: 1.2},
  {worldObjectName: 'EnergyGenerator6', role: 'production', kilowatts: 1_485},
  {worldObjectName: 'Drill4', role: 'consumption', kilowatts: 375.5}
];

const PLANET_NAMES_BY_NUMERIC_ID: Readonly<Record<number, string>> = {[PRIME_PLANET_NUMERIC_ID]: 'Prime'};

function createPresenter(): OverviewPagePresenterPort {
  return {displayOverviewPage: mock(), displaySaveWithUnreadableLines: mock()};
}

function createUseCase(presenter: OverviewPagePresenterPort, saveSectionsReader: SaveSectionsReaderPort = stubSaveSectionsReader()): LoadOverviewPage {
  const energyLevelsReader: EnergyLevelsReaderPort = {readEnergyLevels: () => ENERGY_LEVELS, readDivergingEnergyLevelsByRelease: () => ({})};
  const optimizerRangesReader: OptimizerRangesReaderPort = {readOptimizerRanges: () => OPTIMIZER_RANGES};
  const planetNamesReader: PlanetNamesReaderPort = {findPlanetNameOfNumericId: (numericId) => PLANET_NAMES_BY_NUMERIC_ID[numericId]};

  return new LoadOverviewPage({saveSectionsReader, gameReleasesReader: stubGameReleasesReader(), energyLevelsReader, optimizerRangesReader, planetNamesReader}, presenter);
}

const SAVE_FILE_SIZE = 2_540;

describe('LoadOverviewPage', () => {
  it('should present the identity of the save file and its progression', async () => {
    // Arrange
    const presenter = createPresenter();

    // Act
    await createUseCase(presenter).execute({content: SAVE_CONTENT, fileName: 'Standard-1.json', fileSize: SAVE_FILE_SIZE});

    // Assert
    expect(presenter.displayOverviewPage).toHaveBeenCalledWith(expect.objectContaining({
      saveFile: {name: 'Standard-1.json', size: 2_540},
      saveConfiguration: {displayName: 'Fake Save', mode: 'Standard', gameRelease: '2.004'},
      progression: {allTimeTerraTokens: 1_234_567, totalCraftedObjects: 10, droneLogistics: undefined}
    }));
  });

  describe('When the save says whether the drone logistics are paused', () => {
    it('should present the drone logistics with their effect on the player', async () => {
      // Arrange
      const saveSections = new FakeSaveSectionsMapperService();
      saveSections.getGlobalProgression = () => createGlobalProgressionValueObject({allTimeTerraTokens: 1_234_567, logisticsPaused: true});
      const presenter = createPresenter();

      // Act
      await createUseCase(presenter, stubSaveSectionsReader({saveSections})).execute({content: SAVE_CONTENT, fileName: 'Standard-1.json', fileSize: SAVE_FILE_SIZE});

      // Assert
      expect(presenter.displayOverviewPage).toHaveBeenCalledWith(expect.objectContaining({
        saveFile: {name: 'Standard-1.json', size: 2_540},
        saveConfiguration: {displayName: 'Fake Save', mode: 'Standard', gameRelease: '2.004'},
        progression: {allTimeTerraTokens: 1_234_567, totalCraftedObjects: 10, droneLogistics: {paused: true, effect: 'penalisesThePlayer'}}
      }));
    });
  });

  describe('When the save has no statistics', () => {
    it('should present the progression without a count of crafted objects', async () => {
      // Arrange
      const saveSections = new FakeSaveSectionsMapperService();
      saveSections.getStatistics = () => undefined;
      const presenter = createPresenter();

      // Act
      await createUseCase(presenter, stubSaveSectionsReader({saveSections})).execute({content: SAVE_CONTENT, fileName: 'Standard-1.json', fileSize: SAVE_FILE_SIZE});

      // Assert
      expect(presenter.displayOverviewPage).toHaveBeenCalledWith(expect.objectContaining({
        saveFile: {name: 'Standard-1.json', size: 2_540},
        saveConfiguration: {displayName: 'Fake Save', mode: 'Standard', gameRelease: '2.004'},
        progression: {allTimeTerraTokens: 1_234_567, totalCraftedObjects: undefined, droneLogistics: undefined}
      }));
    });
  });

  describe('When the save has no configuration entry', () => {
    it('should present the save file without a configuration', async () => {
      // Arrange
      const saveSections = new FakeSaveSectionsMapperService();
      saveSections.getSaveConfiguration = () => undefined;
      const presenter = createPresenter();

      // Act
      await createUseCase(presenter, stubSaveSectionsReader({saveSections})).execute({content: SAVE_CONTENT, fileName: 'Standard-1.json', fileSize: SAVE_FILE_SIZE});

      // Assert
      expect(presenter.displayOverviewPage).toHaveBeenCalledWith(expect.objectContaining({
        saveFile: {name: 'Standard-1.json', size: 2_540},
        saveConfiguration: undefined,
        progression: {allTimeTerraTokens: 1_234_567, totalCraftedObjects: 10, droneLogistics: undefined}
      }));
    });

    it('should present the energy settings at the base power consumption, the modifier being 1', async () => {
      // Arrange
      const saveSections = new FakeSaveSectionsMapperService();
      saveSections.getSaveConfiguration = () => undefined;
      const presenter = createPresenter();

      // Act
      await createUseCase(presenter, stubSaveSectionsReader({saveSections})).execute({content: SAVE_CONTENT, fileName: 'Standard-1.json', fileSize: SAVE_FILE_SIZE});

      // Assert
      expect(presenter.displayOverviewPage).toHaveBeenCalledWith(expect.objectContaining({
        energySettings: {gameRelease: '2.004', gameReleaseIsEarlierThanCurrent: true, powerConsumptionModifier: 1, powerConsumptionIsModified: false}
      }));
    });
  });

  describe('When the save takes the energy values of an earlier game release and modifies the power consumption', () => {
    it('should present the energy settings the power figures depend on', async () => {
      // Arrange
      const presenter = createPresenter();

      // Act
      await createUseCase(presenter).execute({content: SAVE_CONTENT, fileName: 'Standard-1.json', fileSize: SAVE_FILE_SIZE});

      // Assert
      expect(presenter.displayOverviewPage).toHaveBeenCalledWith(expect.objectContaining({
        energySettings: {gameRelease: '2.004', gameReleaseIsEarlierThanCurrent: true, powerConsumptionModifier: 0.5, powerConsumptionIsModified: true}
      }));
    });
  });

  describe('When a planet has terraformation levels and machines placed', () => {
    it('should join its terraformation levels and its energy into one planet', async () => {
      // Arrange
      const presenter = createPresenter();

      // Act
      await createUseCase(presenter, stubSaveSectionsReader({saveSections: new SaveSectionsWithPrimeTerraformedAndEquipped()})).execute({content: SAVE_CONTENT, fileName: 'Standard-1.json', fileSize: SAVE_FILE_SIZE});

      // Assert
      expect(presenter.displayOverviewPage).toHaveBeenCalledWith(expect.objectContaining({
        planets: [{
          planetName: 'Prime',
          terraformation: {
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
          energy: {numericPlanetId: PRIME_PLANET_NUMERIC_ID, production: 1_485, consumption: 187.75, available: 1_297.25}
        }]
      }));
    });
  });

  describe('When a planet has terraformation levels but no machine placed', () => {
    it('should present its terraformation levels without energy', async () => {
      // Arrange
      const presenter = createPresenter();

      // Act
      await createUseCase(presenter, stubSaveSectionsReader({saveSections: new SaveSectionsWithPrimeTerraformedWithoutMachines()})).execute({content: SAVE_CONTENT, fileName: 'Standard-1.json', fileSize: SAVE_FILE_SIZE});

      // Assert
      expect(presenter.displayOverviewPage).toHaveBeenCalledWith(expect.objectContaining({
        planets: [{
          planetName: 'Prime',
          terraformation: {
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
          }
        }]
      }));
    });
  });

  describe('When a planet has machines placed but no terraformation level', () => {
    it('should present it after the terraformed planets, with its energy alone', async () => {
      // Arrange
      const presenter = createPresenter();

      // Act
      await createUseCase(presenter, stubSaveSectionsReader({saveSections: new SaveSectionsWithAnUnnamedPlanetEquippedBeforePrime()})).execute({content: SAVE_CONTENT, fileName: 'Standard-1.json', fileSize: SAVE_FILE_SIZE});

      // Assert
      expect(presenter.displayOverviewPage).toHaveBeenCalledWith(expect.objectContaining({
        planets: [
          {
            planetName: 'Prime',
            terraformation: {
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
            energy: {numericPlanetId: PRIME_PLANET_NUMERIC_ID, production: 1_485, consumption: 187.75, available: 1_297.25}
          },
          {
            energy: {numericPlanetId: UNNAMED_PLANET_NUMERIC_ID, production: 1.2, consumption: 0, available: 1.2}
          }
        ]
      }));
    });
  });

  describe('When the save has unreadable lines', () => {
    it('should display the unreadable lines instead of the overview', async () => {
      // Arrange
      const unreadableLines: UnreadableLine[] = [{code: 'invalid-json', section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{not valid json'}];
      const presenter = createPresenter();

      // Act
      await createUseCase(presenter, stubSaveSectionsReader({unreadableLines})).execute({content: SAVE_CONTENT, fileName: 'Standard-1.json', fileSize: SAVE_FILE_SIZE});

      // Assert
      expect(presenter.displaySaveWithUnreadableLines).toHaveBeenCalledWith({unreadableLines: [{code: 'invalid-json', section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{not valid json'}]});
      expect(presenter.displayOverviewPage).not.toHaveBeenCalled();
    });
  });
});
