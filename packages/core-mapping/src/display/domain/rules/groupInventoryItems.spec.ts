import {describe, expect, it} from 'bun:test';
import {groupInventoryItems, InventoryItemGroup} from './groupInventoryItems';

describe('groupInventoryItems', () => {
  it('should count the items of each world object, in the order they first appear', () => {
    // Act
    const groups = groupInventoryItems(['Iron', 'Cobalt', 'Iron', 'Backpack4', 'Iron']);

    // Assert
    expect<InventoryItemGroup[]>(groups).toEqual([
      {worldObjectName: 'Iron', count: 3},
      {worldObjectName: 'Cobalt', count: 1},
      {worldObjectName: 'Backpack4', count: 1}
    ]);
  });

  describe('When the inventory is empty', () => {
    it('should give no group', () => {
      // Arrange
      const emptyInventory: string[] = [];

      // Act
      const groups = groupInventoryItems(emptyInventory);

      // Assert
      expect<InventoryItemGroup[]>(groups).toEqual([]);
    });
  });
});
