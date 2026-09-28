import {describe, expect, it} from 'bun:test';
import {resolveIdConflicts} from './resolveIdConflicts';
import {MergedSaveSections} from './MergedSaveSections';
import {PlayerEntry} from '../../save/PlayerEntry';
import {TerrainLayerEntry} from '../../save/TerrainLayerEntry';
import {EntriesByOrigin} from './EntriesByOrigin';
import {createGlobalMetadataEntry, createPlayerEntry, createSaveConfigurationEntry, createStatisticsEntry, createTerrainLayerEntry} from '../../../testing/createSaveEntries';
import {InventoryEntry} from '../../save/InventoryEntry';
import {WorldObjectEntry} from '../../save/WorldObjectEntry';

describe('Resolve id conflicts', () => {
  function createMergedSections(overrides: {
    players?: EntriesByOrigin<PlayerEntry>,
    inventories?: EntriesByOrigin<InventoryEntry>,
    worldObjects?: EntriesByOrigin<WorldObjectEntry>,
    formatRelease?: string,
    terrainLayers?: TerrainLayerEntry[]
  }): MergedSaveSections {
    return {
      formatRelease: '2.004',
      globalMetadata: createGlobalMetadataEntry(),
      terraformationLevels: [],
      players: {fromSaveA: [], fromSaveB: []},
      worldObjects: {fromSaveA: [], fromSaveB: []},
      inventories: {fromSaveA: [], fromSaveB: []},
      statistics: undefined,
      mailboxes: [],
      storyEvents: [],
      saveConfiguration: undefined,
      terrainLayers: undefined,
      worldEvents: [],
      ...overrides
    };
  }

  describe('When no identifier is shared between the two saves', () => {
    it('should return the sections unchanged', () => {
      // Arrange
      const playerFromSaveA = createPlayerEntry({id: '1', inventoryId: 10, equipmentId: 11});
      const playerFromSaveB = createPlayerEntry({id: '2', inventoryId: 20, equipmentId: 21});
      const sections = createMergedSections({
        players: {fromSaveA: [playerFromSaveA], fromSaveB: [playerFromSaveB]},
        inventories: {
          fromSaveA: [{id: 10, worldObjectIds: [100], size: 20}, {id: 11, worldObjectIds: [], size: 10}],
          fromSaveB: [{id: 20, worldObjectIds: [], size: 20}, {id: 21, worldObjectIds: [], size: 10}]
        },
        worldObjects: {fromSaveA: [{id: 100, groupId: 'SomeObject'}], fromSaveB: [{id: 200, groupId: 'OtherObject'}]}
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.players).toEqual([playerFromSaveA, playerFromSaveB]);
      expect(result.inventories).toEqual([
        {id: 10, worldObjectIds: [100], size: 20}, {id: 11, worldObjectIds: [], size: 10},
        {id: 20, worldObjectIds: [], size: 20}, {id: 21, worldObjectIds: [], size: 10}
      ]);
      expect(result.worldObjects).toEqual([{id: 100, groupId: 'SomeObject'}, {id: 200, groupId: 'OtherObject'}]);
    });
  });

  describe('When both saves use the same identifiers', () => {
    it('should renumber the save B entries and keep every entry of both saves', () => {
      // Arrange
      const playerFromSaveA = createPlayerEntry({id: '1', inventoryId: 10, equipmentId: 11});
      const playerFromSaveB = createPlayerEntry({id: '1', name: 'Chileny', inventoryId: 10, equipmentId: 11});
      const sections = createMergedSections({
        players: {fromSaveA: [playerFromSaveA], fromSaveB: [playerFromSaveB]},
        inventories: {
          fromSaveA: [{id: 10, worldObjectIds: [], size: 20}, {id: 11, worldObjectIds: [], size: 10}],
          fromSaveB: [{id: 10, worldObjectIds: [], size: 35}, {id: 11, worldObjectIds: [], size: 5}]
        },
        worldObjects: {fromSaveA: [{id: 100, groupId: 'SomeObject'}], fromSaveB: [{id: 100, groupId: 'OtherObject'}]}
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.players).toEqual([playerFromSaveA, {...playerFromSaveB, inventoryId: 101, equipmentId: 102}]);
      expect(result.inventories).toEqual([
        {id: 10, worldObjectIds: [], size: 20}, {id: 11, worldObjectIds: [], size: 10},
        {id: 101, worldObjectIds: [], size: 35}, {id: 102, worldObjectIds: [], size: 5}
      ]);
      expect(result.worldObjects).toEqual([{id: 100, groupId: 'SomeObject'}, {id: 103, groupId: 'OtherObject'}]);
    });

    it('should point the save B player at its own renumbered inventory and equipment', () => {
      // Arrange
      const playerFromSaveB = createPlayerEntry({id: '2', name: 'Chileny', inventoryId: 10, equipmentId: 11});
      const playerFromSaveA = createPlayerEntry({id: '1', inventoryId: 10, equipmentId: 11});
      const sections = createMergedSections({
        players: {fromSaveA: [playerFromSaveA], fromSaveB: [playerFromSaveB]},
        inventories: {
          fromSaveA: [{id: 10, worldObjectIds: [], size: 20}, {id: 11, worldObjectIds: [], size: 10}],
          fromSaveB: [{id: 10, worldObjectIds: [], size: 35}, {id: 11, worldObjectIds: [], size: 5}]
        }
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.players).toEqual([playerFromSaveA, {...playerFromSaveB, inventoryId: 12, equipmentId: 13}]);
    });
  });

  describe('When a save B player carries the identifier of a save A player', () => {
    it('should leave that identifier untouched', () => {
      // Arrange
      const playerFromSaveA = createPlayerEntry({id: '1', inventoryId: 10, equipmentId: 11});
      const playerFromSaveB = createPlayerEntry({id: '1', name: 'Chileny', inventoryId: 20, equipmentId: 21});
      const sections = createMergedSections({
        players: {fromSaveA: [playerFromSaveA], fromSaveB: [playerFromSaveB]},
        inventories: {
          fromSaveA: [{id: 10, worldObjectIds: [], size: 20}, {id: 11, worldObjectIds: [], size: 10}],
          fromSaveB: [{id: 20, worldObjectIds: [], size: 35}, {id: 21, worldObjectIds: [], size: 5}]
        }
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.players).toEqual([playerFromSaveA, playerFromSaveB]);
    });
  });

  describe('When a save B player owns an inventory that no save A player owns', () => {
    it('should point that player at its own renumbered inventory rather than at the save A one', () => {
      // Arrange
      const playerFromSaveB = createPlayerEntry({id: '2', name: 'Chileny', inventoryId: 44, equipmentId: 45});
      const playerFromSaveA = createPlayerEntry({id: '1', inventoryId: 3, equipmentId: 4});
      const sections = createMergedSections({
        players: {fromSaveA: [playerFromSaveA], fromSaveB: [playerFromSaveB]},
        inventories: {
          fromSaveA: [{id: 3, worldObjectIds: [], size: 20}, {id: 4, worldObjectIds: [], size: 10}, {id: 44, worldObjectIds: [], size: 35}, {id: 45, worldObjectIds: [], size: 35}],
          fromSaveB: [{id: 44, worldObjectIds: [], size: 20}, {id: 45, worldObjectIds: [], size: 10}]
        }
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.players).toEqual([playerFromSaveA, {...playerFromSaveB, inventoryId: 46, equipmentId: 47}]);
      expect(result.inventories).toEqual([
        {id: 3, worldObjectIds: [], size: 20}, {id: 4, worldObjectIds: [], size: 10}, {id: 44, worldObjectIds: [], size: 35}, {id: 45, worldObjectIds: [], size: 35},
        {id: 46, worldObjectIds: [], size: 20}, {id: 47, worldObjectIds: [], size: 10}
      ]);
    });
  });

  describe('When both saves have a world object linked to the same inventory id', () => {
    it('should send the save B world object to the renumbered inventory and leave the save A one on the shared id', () => {
      // Arrange
      const sections = createMergedSections({
        players: {fromSaveA: [createPlayerEntry({id: '1', inventoryId: 10, equipmentId: 11})], fromSaveB: []},
        inventories: {
          fromSaveA: [{id: 10, worldObjectIds: [], size: 20}, {id: 11, worldObjectIds: [], size: 10}, {id: 50, worldObjectIds: [100], size: 35}],
          fromSaveB: [{id: 50, worldObjectIds: [200], size: 12}]
        },
        worldObjects: {
          fromSaveA: [{id: 100, groupId: 'Container2', linkedInventoryId: 50}],
          fromSaveB: [{id: 200, groupId: 'Container2', linkedInventoryId: 50}]
        }
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.worldObjects).toEqual([{id: 100, groupId: 'Container2', linkedInventoryId: 50}, {id: 200, groupId: 'Container2', linkedInventoryId: 201}]);
      expect(result.inventories).toEqual([
        {id: 10, worldObjectIds: [], size: 20}, {id: 11, worldObjectIds: [], size: 10}, {id: 50, worldObjectIds: [100], size: 35},
        {id: 201, worldObjectIds: [200], size: 12}
      ]);
    });
  });

  describe('When a save B inventory holds a renumbered world object', () => {
    it('should update the contents of that inventory and leave the save A one untouched', () => {
      // Arrange
      const sections = createMergedSections({
        inventories: {
          fromSaveA: [{id: 30, worldObjectIds: [100], size: 50}],
          fromSaveB: [{id: 31, worldObjectIds: [100], size: 50}]
        },
        worldObjects: {
          fromSaveA: [{id: 100, groupId: 'Iron'}],
          fromSaveB: [{id: 100, groupId: 'Cobalt'}]
        }
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.inventories).toEqual([{id: 30, worldObjectIds: [100], size: 50}, {id: 31, worldObjectIds: [101], size: 50}]);
      expect(result.worldObjects).toEqual([{id: 100, groupId: 'Iron'}, {id: 101, groupId: 'Cobalt'}]);
    });
  });

  describe('When a world object already holds the identifier that follows the highest inventory identifier', () => {
    it('should renumber the save B inventory above that world object', () => {
      // Arrange
      const sections = createMergedSections({
        inventories: {
          fromSaveA: [{id: 10, worldObjectIds: [], size: 20}],
          fromSaveB: [{id: 10, worldObjectIds: [], size: 35}]
        },
        worldObjects: {fromSaveA: [{id: 11, groupId: 'Iron'}], fromSaveB: []}
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.inventories).toEqual([{id: 10, worldObjectIds: [], size: 20}, {id: 12, worldObjectIds: [], size: 35}]);
      expect(result.worldObjects).toEqual([{id: 11, groupId: 'Iron'}]);
    });
  });

  describe('When a save B world object is linked to a renumbered save B world object', () => {
    it('should point it at the new world object id', () => {
      // Arrange
      const sections = createMergedSections({
        worldObjects: {
          fromSaveA: [{id: 100, groupId: 'Lake1'}],
          fromSaveB: [{id: 100, groupId: 'Lake2'}, {id: 201, groupId: 'WaterGenerator', linkedWorldObjectId: 100}]
        }
      });

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.worldObjects).toEqual([
        {id: 100, groupId: 'Lake1'},
        {id: 202, groupId: 'Lake2'},
        {id: 201, groupId: 'WaterGenerator', linkedWorldObjectId: 202}
      ]);
    });
  });

  describe('When the merged sections carry statistics and a save configuration', () => {
    it('should yield a save whose single-entry sections hold that entry', () => {
      // Arrange
      const globalMetadata = createGlobalMetadataEntry({terraTokens: 42});
      const statistics = createStatisticsEntry({craftedObjects: 7});
      const saveConfiguration = createSaveConfigurationEntry({saveDisplayName: 'Our merged world'});
      const sections = {...createMergedSections({}), globalMetadata, statistics, saveConfiguration};

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.globalMetadata).toEqual([globalMetadata]);
      expect(result.statistics).toEqual([statistics]);
      expect(result.saveConfigurations).toEqual([saveConfiguration]);
    });
  });

  describe('When the merged sections carry neither statistics nor a save configuration', () => {
    it('should yield a save whose single-entry sections are empty', () => {
      // Arrange
      const sections = createMergedSections({});

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.statistics).toEqual([]);
      expect(result.saveConfigurations).toEqual([]);
    });
  });

  describe('When the merged save is written in the format of 1.618', () => {
    it('should carry that format and its Terrain Layers section', () => {
      // Arrange
      const terrainLayer = createTerrainLayerEntry({layerId: 'PC-Toxicity-Layer1'});
      const sections = createMergedSections({formatRelease: '1.618', terrainLayers: [terrainLayer]});

      // Act
      const result = resolveIdConflicts(sections);

      // Assert
      expect(result.formatRelease).toBe('1.618');
      expect(result.terrainLayers).toEqual([terrainLayer]);
    });
  });
});
