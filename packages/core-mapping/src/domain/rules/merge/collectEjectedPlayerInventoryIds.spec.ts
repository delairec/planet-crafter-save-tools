import {describe, expect, it} from 'bun:test';
import {PlayerEntry} from '../../save/PlayerEntry';
import {collectEjectedPlayerInventoryIds} from './collectEjectedPlayerInventoryIds';
import {InventoryEntry} from '../../save/InventoryEntry';
import {createPlayerEntry} from '../../../testing/createSaveEntries';

describe('collectEjectedPlayerInventoryIds', () => {
  describe('When no player in save B shares a name with a player in save A', () => {
    it('should return empty inventory and world object id sets', () => {
      // Arrange
      const playersA: PlayerEntry[] = [createPlayerEntry({name: 'Nikowa'})];
      const playersB: PlayerEntry[] = [createPlayerEntry({name: 'Chileny', inventoryId: 50, equipmentId: 51})];
      const inventoriesB: InventoryEntry[] = [{id: 50, worldObjectIds: [900, 901], size: 20}];

      // Act
      const result = collectEjectedPlayerInventoryIds(playersA, playersB, inventoriesB);

      // Assert
      expect(result.orphanInventoryIds).toEqual(new Set());
      expect(result.orphanWorldObjectIds).toEqual(new Set());
    });
  });

  describe('When a player in save B shares a name with a player in save A', () => {
    it('should collect the inventory and equipment ids of the ejected player from save B', () => {
      // Arrange
      const playersA: PlayerEntry[] = [createPlayerEntry({name: 'Nikowa'})];
      const playersB: PlayerEntry[] = [createPlayerEntry({name: 'Nikowa', inventoryId: 50, equipmentId: 51})];
      const inventoriesB: InventoryEntry[] = [];

      // Act
      const result = collectEjectedPlayerInventoryIds(playersA, playersB, inventoriesB);

      // Assert
      expect(result.orphanInventoryIds).toEqual(new Set([50, 51]));
    });

    it('should collect the world object ids held in the ejected player inventory and equipment from save B', () => {
      // Arrange
      const playersA: PlayerEntry[] = [createPlayerEntry({name: 'Nikowa'})];
      const playersB: PlayerEntry[] = [createPlayerEntry({name: 'Nikowa', inventoryId: 50, equipmentId: 51})];
      const inventoriesB: InventoryEntry[] = [
        {id: 50, worldObjectIds: [900, 901], size: 20},
        {id: 51, worldObjectIds: [902], size: 10}
      ];

      // Act
      const result = collectEjectedPlayerInventoryIds(playersA, playersB, inventoriesB);

      // Assert
      expect(result.orphanWorldObjectIds).toEqual(new Set([900, 901, 902]));
    });

    it('should not collect world object ids from an inventory that does not belong to an ejected player', () => {
      // Arrange
      const playersA: PlayerEntry[] = [createPlayerEntry({name: 'Nikowa'})];
      const playersB: PlayerEntry[] = [
        createPlayerEntry({name: 'Nikowa', inventoryId: 50, equipmentId: 51}),
        createPlayerEntry({id: '999', name: 'Chileny', inventoryId: 60, equipmentId: 61})
      ];
      const inventoriesB: InventoryEntry[] = [
        {id: 50, worldObjectIds: [900], size: 20},
        {id: 60, worldObjectIds: [901], size: 20}
      ];

      // Act
      const result = collectEjectedPlayerInventoryIds(playersA, playersB, inventoriesB);

      // Assert
      expect(result.orphanWorldObjectIds).toEqual(new Set([900]));
    });
  });

  describe('When an ejected player inventory has no world objects', () => {
    it('should not add any world object id for that inventory', () => {
      // Arrange
      const playersA: PlayerEntry[] = [createPlayerEntry({name: 'Nikowa'})];
      const playersB: PlayerEntry[] = [createPlayerEntry({name: 'Nikowa', inventoryId: 50, equipmentId: 51})];
      const inventoriesB: InventoryEntry[] = [{id: 50, worldObjectIds: [], size: 20}];

      // Act
      const result = collectEjectedPlayerInventoryIds(playersA, playersB, inventoriesB);

      // Assert
      expect(result.orphanWorldObjectIds).toEqual(new Set());
    });
  });
});
