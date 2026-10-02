import {describe, expect, it} from 'bun:test';
import {SaveSectionsSerializerService} from './SaveSectionsSerializerService';
import {parseSaveSections} from '../../save/infrastructure/wireFormat/parseSaveSections.js';
import {INVENTORIES_SECTION_INDEX, LEGACY_TERRAIN_LAYERS_SECTION_INDEX, LEGACY_WORLD_EVENTS_SECTION_INDEX, PLAYERS_SECTION_INDEX, SAVE_CONFIGURATION_SECTION_INDEX, WORLD_OBJECTS_SECTION_INDEX} from '../../save/infrastructure/wireFormat/sectionIndexes.js';
import {createPlayerEntry, createSaveConfigurationEntry, createTerrainLayerEntry, createWorldEventEntry} from '../../save/testing/createSaveEntries';
import {createSaveSections} from '../../save/testing/createSaveSections';

describe('SaveSectionsSerializerService', () => {

  describe('When serializing a save', () => {
    it('should write the inventories and world objects in the save format, their identifier lists as text', () => {
      // Arrange
      const service = new SaveSectionsSerializerService();
      const sections = createSaveSections({
        inventories: [{id: 10, worldObjectIds: [100, 101], size: 20}, {id: 11, worldObjectIds: [], size: 10}],
        worldObjects: [
          {id: 100, groupId: 'Farm1', subInventoryIds: [10, 11], heldWorldObjectIds: [200]},
          {id: 200, groupId: 'Container2', linkedInventoryId: 10}
        ]
      });

      // Act
      const content = service.serialize(sections);

      // Assert
      const {sections: written} = parseSaveSections(content);
      expect(written[INVENTORIES_SECTION_INDEX]).toEqual([
        {id: 10, woIds: '100,101', size: 20},
        {id: 11, woIds: '', size: 10}
      ]);
      expect([...written[WORLD_OBJECTS_SECTION_INDEX]()]).toEqual([
        {id: 100, gId: 'Farm1', siIds: '10,11', woIds: '200'},
        {id: 200, gId: 'Container2', liId: 10}
      ]);
    });

    it('should write the other sections as the save carries them', () => {
      // Arrange
      const service = new SaveSectionsSerializerService();
      const player = createPlayerEntry({id: '76561190000000001', name: 'Nikowa'});
      const saveConfiguration = createSaveConfigurationEntry({saveDisplayName: 'Our merged world'});
      const sections = createSaveSections({players: [player], saveConfigurations: [saveConfiguration]});

      // Act
      const content = service.serialize(sections);

      // Assert
      const {sections: written} = parseSaveSections(content);
      expect(written[PLAYERS_SECTION_INDEX]).toEqual([{
        id: '76561190000000001', name: 'Nikowa', inventoryId: 44, equipmentId: 45,
        playerPosition: '1751.865,472.58,-1106.104', playerRotation: '0,0.5740051,0,-0.8188518',
        playerGaugeOxygen: 280.0, playerGaugeThirst: 96.3858642578125, playerGaugeHealth: 72.67363739013672,
        playerGaugeToxic: 0.0, host: true, planetId: 'Toxicity',
        cameraView: 0, totalCraftedObjects: 1820, totalTerraTokenEarned: 9000
      }]);
      expect(written[SAVE_CONFIGURATION_SECTION_INDEX]).toEqual([{
        saveDisplayName: 'Our merged world', planetId: 'Toxicity',
        unlockedSpaceTrading: false, unlockedOreExtrators: false, unlockedTeleporters: false, unlockedDrones: false,
        unlockedAutocrafter: false, unlockedEverything: false, freeCraft: false, preInterplanetarySave: false, randomizeMineables: false,
        modifierTerraformationPace: 0.1, modifierPowerConsumption: 0.2, modifierGaugeDrain: 0.3, modifierMeteoOccurence: 0.4,
        modifierMultiplayerTerraformationFactor: 0.5, modded: false, version: '2.004', mode: 'Standard',
        dyingConsequencesLabel: 'DropSomeItems', startLocationLabel: 'Standard', worldSeed: 42, hasPlayedIntro: true,
        gameStartLocation: 'Standard'
      }]);
    });
  });

  describe('When serializing a save in the format of 1.618', () => {
    it('should write its Terrain Layers section before its world events', () => {
      // Arrange
      const service = new SaveSectionsSerializerService();
      const terrainLayer = createTerrainLayerEntry({layerId: 'PC-Toxicity-Layer1'});
      const worldEvent = createWorldEventEntry({seed: 7});
      const sections = createSaveSections({formatRelease: '1.618', terrainLayers: [terrainLayer], worldEvents: [worldEvent]});

      // Act
      const content = service.serialize(sections);

      // Assert
      const {formatRelease, sections: written} = parseSaveSections(content);
      expect(formatRelease).toBe('1.618');
      expect(written[LEGACY_TERRAIN_LAYERS_SECTION_INDEX]).toEqual([{
        layerId: 'PC-Toxicity-Layer1', planet: 110910045, colorBase: '0.5-0.5-0.5-1', colorCustom: '1-1-1-1', colorBaseLerp: 100, colorCustomLerp: 0
      }]);
      expect(written[LEGACY_WORLD_EVENTS_SECTION_INDEX]).toEqual([{planet: 110910045, seed: 7, pos: '0,0,0'}]);
    });
  });
});
