import {describe, expect, it} from 'bun:test';
import {GlobalMetadataEntry} from '../domain/save/GlobalMetadataEntry';
import {SaveConfigurationEntry} from '../domain/save/SaveConfigurationEntry';
import {StatisticsEntry} from '../domain/save/StatisticsEntry';
import {createGlobalMetadataEntry, createPlayerEntry, createSaveConfigurationEntry, createStatisticsEntry, createTerraformationLevelEntry} from '../testing/createSaveEntries';
import {SaveSectionsMapperService} from './SaveSectionsMapperService';
import {createSaveSections} from '../testing/createSaveSections';
import {SaveSections} from '../domain/save/SaveSections';
import {WorldObjectEntry} from '../domain/save/WorldObjectEntry';
import {PlayerEntity} from '../domain/entities/PlayerEntity';
import {GlobalProgressionValueObject} from '../domain/valueObjects/GlobalProgressionValueObject';
import {TerraformationLevelEntity} from '../domain/entities/TerraformationLevelEntity';
import {StatisticsValueObject} from '../domain/valueObjects/StatisticsValueObject';
import {SaveConfigurationValueObject} from '../domain/valueObjects/SaveConfigurationValueObject';
import {PlanetWorldObjectsValueObject} from '../domain/valueObjects/PlanetWorldObjectsValueObject';
import {WorldObjectEntity} from '../domain/entities/WorldObjectEntity';
import {InventoryEntity} from '../domain/entities/InventoryEntity';
import {PlacedWorldObjectEntity} from '../domain/entities/PlacedWorldObjectEntity';
import {UnreadableSaveEntryValueError} from './errors/UnreadableSaveEntryValueError';


const CARRIED_WORLD_OBJECTS: WorldObjectEntry[] = [
  {id: 79111656, groupId: 'Phytoplankton3'},
  {id: 58524136, groupId: 'MagnetarQuartz'},
  {id: 85274195, groupId: 'Backpack4'},
  {id: 48456321, groupId: 'OxygenTank5'},
  {id: 15974863, groupId: 'Phytoplankton1'},
  {id: 28491667, groupId: 'PulsarQuartz'},
  {id: 39187611, groupId: 'Backpack7'},
  {id: 65514812, groupId: 'OxygenTank4'}
];

function createSectionsWithTwoPlayers(): SaveSections {
  return createSaveSections({
    globalMetadata: [createGlobalMetadataEntry()],
    terraformationLevels: [createTerraformationLevelEntry()],
    players: [
      createPlayerEntry({name: 'Nikowa'}),
      createPlayerEntry({name: 'Chileny', inventoryId: 46, equipmentId: 47, host: false})
    ],
    worldObjects: CARRIED_WORLD_OBJECTS,
    inventories: [
      {id: 44, worldObjectIds: [79111656, 58524136], size: 20},
      {id: 45, worldObjectIds: [85274195, 48456321], size: 10},
      {id: 46, worldObjectIds: [15974863, 28491667], size: 20},
      {id: 47, worldObjectIds: [39187611, 65514812], size: 10}
    ],
    statistics: [createStatisticsEntry()],
    saveConfigurations: [createSaveConfigurationEntry()]
  });
}

describe('SaveSectionsMapperService', () => {

  it('should extract global metadata', () => {
    // Arrange
    const service = new SaveSectionsMapperService(createSectionsWithTwoPlayers());

    // Act
    const metadata = service.getGlobalProgression();

    // Assert
    expect<GlobalProgressionValueObject>(metadata).toEqual({
      allTimeTerraTokens: 200_345
    });
  });

  describe('When the global metadata carries logisticsPaused', () => {
    it('should extract logisticsPaused alongside the terra tokens', () => {
      // Arrange
      const service = new SaveSectionsMapperService(createSaveSections({globalMetadata: [createGlobalMetadataEntry({logisticsPaused: true})]}));

      // Act
      const metadata = service.getGlobalProgression();

      // Assert
      expect<GlobalProgressionValueObject>(metadata).toEqual({
        allTimeTerraTokens: 200_345,
        logisticsPaused: true
      });
    });
  });

  describe('When global metadata are missing', () => {
    it('should use fallback values', () => {
      // Arrange
      const noGlobalMetadata: GlobalMetadataEntry[] = [];
      const service = new SaveSectionsMapperService(createSaveSections({globalMetadata: noGlobalMetadata}));

      // Act
      const metadata = service.getGlobalProgression();

      // Assert
      expect<GlobalProgressionValueObject>(metadata).toEqual({
        allTimeTerraTokens: 0
      });
    });
  });

  it('should extract players section', () => {
    // Arrange
    const service = new SaveSectionsMapperService(createSectionsWithTwoPlayers());

    // Act
    const players = service.getPlayers();

    // Assert
    expect<PlayerEntity[]>(players).toEqual([new PlayerEntity({
      name: 'Nikowa',
      inventory: ['Phytoplankton3', 'MagnetarQuartz'],
      equipment: ['Backpack4', 'OxygenTank5'],
      planetId: 'Toxicity',
      host: true
    }), new PlayerEntity({
      name: 'Chileny',
      inventory: ['Phytoplankton1', 'PulsarQuartz'],
      equipment: ['Backpack7', 'OxygenTank4'],
      planetId: 'Toxicity',
      host: false
    })]);
  });

  it('should extract terraformation levels', () => {
    // Arrange
    const service = new SaveSectionsMapperService(createSectionsWithTwoPlayers());

    // Act
    const levels = service.getTerraformationLevels();

    // Assert
    expect<TerraformationLevelEntity[]>(levels).toEqual([new TerraformationLevelEntity({
      planetId: 'Toxicity',
      unitOxygenLevel: 100,
      unitHeatLevel: 200,
      unitPressureLevel: 300,
      unitPlantsLevel: 400,
      unitInsectsLevel: 500,
      unitAnimalsLevel: 600,
      unitPurificationLevel: 700
    })]);
  });

  it('should extract statistics', () => {
    // Arrange
    const service = new SaveSectionsMapperService(createSectionsWithTwoPlayers());

    // Act
    const statistics = service.getStatistics();

    // Assert
    expect<StatisticsValueObject>(statistics).toEqual({
      totalCraftedObjects: 10
    });
  });

  describe('When statistics are missing', () => {
    it('should return undefined', () => {
      // Arrange
      const noStatistics: StatisticsEntry[] = [];
      const service = new SaveSectionsMapperService(createSaveSections({statistics: noStatistics}));

      // Act
      const statistics = service.getStatistics();

      // Assert
      expect(statistics).toBeUndefined();
    });
  });

  it('should extract save configuration', () => {
    // Arrange
    const service = new SaveSectionsMapperService(createSectionsWithTwoPlayers());

    // Act
    const saveConfiguration = service.getSaveConfiguration();

    // Assert
    expect<SaveConfigurationValueObject>(saveConfiguration).toEqual({
      title: 'Merged Save',
      mode: 'Standard',
      modifiers: {
        terraformationPace: 0.1,
        powerConsumption: 0.2,
        gaugeDrain: 0.3,
        meteoOccurrence: 0.4,
        multiplayerFactor: 0.5
      },
      unlocks: {
        freeCraft: false,
        everythingUnlocked: false,
        spaceTrading: false,
        oreExtractors: false,
        teleporters: false,
        drones: false,
        autocrafter: false,
        randomizedMineables: false
      }
    });
  });

  describe('When save configuration is missing', () => {
    it('should return undefined', () => {
      // Arrange
      const noSaveConfigurations: SaveConfigurationEntry[] = [];
      const service = new SaveSectionsMapperService(createSaveSections({saveConfigurations: noSaveConfigurations}));

      // Act
      const saveConfiguration = service.getSaveConfiguration();

      // Assert
      expect(saveConfiguration).toBeUndefined();
    });
  });

  describe('When reading the world objects', () => {
    it('should keep every world object, placed or carried', () => {
      // Arrange
      const sections = createSaveSections({
        worldObjects: [
          {id: 1, groupId: 'EnergyGenerator1', position: '0,0,0', planet: 1},
          {id: 2, groupId: 'FuseEnergy1'}
        ]
      });
      const service = new SaveSectionsMapperService(sections);

      // Act
      const worldObjects = service.getWorldObjects();

      // Assert
      expect<WorldObjectEntity[]>(worldObjects).toEqual([
        new WorldObjectEntity({id: '1', name: 'EnergyGenerator1'}),
        new WorldObjectEntity({id: '2', name: 'FuseEnergy1'})
      ]);
    });
  });

  describe('When reading the placed world objects by planet', () => {
    it('should place only the world objects with a position and a planet', () => {
      // Arrange
      const sections = createSaveSections({
        worldObjects: [
          {id: 1, groupId: 'EnergyGenerator1', position: '0,0,0', planet: 1},
          {id: 2, groupId: 'FuseEnergy1'},
          {id: 3, groupId: 'EnergyGenerator1', position: '10,0,0'},
          {id: 4, groupId: 'EnergyGenerator1', planet: 1}
        ]
      });
      const service = new SaveSectionsMapperService(sections);

      // Act
      const planets = service.getPlacedWorldObjectsByPlanet();

      // Assert
      expect<PlanetWorldObjectsValueObject[]>(planets).toEqual([{
        planetId: 1,
        planetName: undefined,
        placedWorldObjects: [
          new PlacedWorldObjectEntity({id: '1', name: 'EnergyGenerator1', position: [0, 0, 0], planetId: 1})
        ]
      }]);
    });

    it('should group placed world objects by planet (Rule EN-PLANET-1)', () => {
      // Arrange
      const sections = createSaveSections({
        worldObjects: [
          {id: 1, groupId: 'EnergyGenerator1', position: '0,0,0', planet: 1},
          {id: 2, groupId: 'Drill0', position: '10,0,0', planet: 2},
          {id: 3, groupId: 'Heater1', position: '20,0,0', planet: 1}
        ]
      });
      const service = new SaveSectionsMapperService(sections);

      // Act
      const planets = service.getPlacedWorldObjectsByPlanet();

      // Assert
      expect<PlanetWorldObjectsValueObject[]>(planets).toEqual([
        {
          planetId: 1,
          planetName: undefined,
          placedWorldObjects: [
            new PlacedWorldObjectEntity({id: '1', name: 'EnergyGenerator1', position: [0, 0, 0], planetId: 1}),
            new PlacedWorldObjectEntity({id: '3', name: 'Heater1', position: [20, 0, 0], planetId: 1})
          ]
        },
        {
          planetId: 2,
          planetName: undefined,
          placedWorldObjects: [
            new PlacedWorldObjectEntity({id: '2', name: 'Drill0', position: [10, 0, 0], planetId: 2})
          ]
        }
      ]);
    });

    it('should map the fields of a placed world object onto its entity', () => {
      // Arrange
      const sections = createSaveSections({
        worldObjects: [
          {id: 95585241, groupId: 'Optimizer1', position: '1751.865,-472.58,1106.104', planet: 1, linkedInventoryId: 100}
        ]
      });
      const service = new SaveSectionsMapperService(sections);

      // Act
      const planets = service.getPlacedWorldObjectsByPlanet();

      // Assert
      expect<readonly PlacedWorldObjectEntity[]>(planets[0].placedWorldObjects).toEqual([new PlacedWorldObjectEntity({
        id: '95585241',
        name: 'Optimizer1',
        position: [1751.865, -472.58, 1106.104],
        planetId: 1,
        inventoryId: 100
      })]);
    });
  });

  describe('When a placed world object carries a position that cannot be read', () => {
    it.each([
      {situation: 'a coordinate that is not a number', position: '1751.865,north,1106.104'},
      {situation: 'an empty coordinate', position: '1751.865,,1106.104'},
      {situation: 'two coordinates', position: '1751.865,-472.58'},
      {situation: 'four coordinates', position: '1751.865,-472.58,1106.104,0'}
    ])('should fail with the error naming the unreadable value for $situation', ({position}) => {
      // Arrange
      const service = new SaveSectionsMapperService(createSaveSections({
        worldObjects: [{id: 95585241, groupId: 'Optimizer1', position, planet: 1}]
      }));

      // Act
      const placeWorldObjects = () => service.getPlacedWorldObjectsByPlanet();

      // Assert
      expect(placeWorldObjects).toThrow(UnreadableSaveEntryValueError);
    });
  });

  describe('When reading the inventories', () => {
    it('should hand over the inventory content as a list of world object ids', () => {
      // Arrange
      const noWorldObjectIds: number[] = [];
      const sections = createSaveSections({
        inventories: [
          {id: 100, worldObjectIds: [20, 21], size: 3},
          {id: 101, worldObjectIds: noWorldObjectIds, size: 1}
        ]
      });
      const service = new SaveSectionsMapperService(sections);

      // Act
      const inventories = service.getInventories();

      // Assert
      expect<InventoryEntity[]>(inventories).toEqual([
        new InventoryEntity({id: 100, worldObjectIds: ['20', '21'], size: 3}),
        new InventoryEntity({id: 101, worldObjectIds: [], size: 1})
      ]);
    });
  });
});
