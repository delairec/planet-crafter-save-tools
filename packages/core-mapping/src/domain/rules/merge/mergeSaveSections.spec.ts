import {describe, expect, it} from 'bun:test';
import {mergeSaveSections} from './mergeSaveSections';
import {createPlayer, createSaveConfiguration, createTerrainLayer} from 'shared-save-processing/testing/createSaveRecords.js';
import {createSaveSections} from '../../../testing/createSaveSections';
import {InventoryEntry} from '../../save/InventoryEntry';
import {WorldObjectEntry} from '../../save/WorldObjectEntry';

describe('Merge saves', () => {
  const mergeOptions = {saveDisplayName: 'SAVE_NAME', preferLegacyFormat: false};

  describe('When both saves carry entries in the sections holding identifiers', () => {
    it('should keep the origin of players, inventories and world objects', () => {
      // Arrange
      const playerFromSaveA = createPlayer({host: false, id: '1', name: 'PlayerA', inventoryId: 10, equipmentId: 11});
      const playerFromSaveB = createPlayer({host: false, id: '2', name: 'PlayerB', inventoryId: 20, equipmentId: 21});
      const inventoryFromSaveA: InventoryEntry = {id: 10, woIds: [], size: 20};
      const inventoryFromSaveB: InventoryEntry = {id: 20, woIds: [], size: 20};
      const worldObjectFromSaveA: WorldObjectEntry = {id: 100, gId: 'Container2', pos: '1,0,1'};
      const worldObjectFromSaveB: WorldObjectEntry = {id: 200, gId: 'VegetubeOutside1', pos: '5,0,5'};

      const sectionsA = createSaveSections({
        players: [playerFromSaveA],
        inventories: [inventoryFromSaveA],
        worldObjects: [worldObjectFromSaveA]
      });
      const sectionsB = createSaveSections({
        players: [playerFromSaveB],
        inventories: [inventoryFromSaveB],
        worldObjects: [worldObjectFromSaveB]
      });

      // Act
      const result = mergeSaveSections(sectionsA, sectionsB, mergeOptions);

      // Assert
      expect(result.players).toEqual({fromSaveA: [playerFromSaveA], fromSaveB: [playerFromSaveB]});
      expect(result.inventories).toEqual({fromSaveA: [inventoryFromSaveA], fromSaveB: [inventoryFromSaveB]});
      expect(result.worldObjects).toEqual({fromSaveA: [worldObjectFromSaveA], fromSaveB: [worldObjectFromSaveB]});
    });
  });

  describe('When the two saves carry different formats', () => {
    it('should carry the format written, its Terrain Layers section and the version of the save whose format it is', () => {
      // Arrange
      const layerOfSaveA = createTerrainLayer({layerId: 'PC-Toxicity-Layer1'});
      const sectionsA = createSaveSections({
        formatRelease: '1.618', terrainLayers: [layerOfSaveA], saveConfigurations: [createSaveConfiguration({version: '1.618'})]
      });
      const sectionsB = createSaveSections({formatRelease: '2.004', saveConfigurations: [createSaveConfiguration({version: '2.103'})]});

      // Act
      const result = mergeSaveSections(sectionsA, sectionsB, mergeOptions);

      // Assert
      expect(result.formatRelease).toBe('2.004');
      expect(result.terrainLayers).toBeUndefined();
      expect(result.saveConfiguration?.version).toBe('2.103');
    });
  });
});
