import {describe, expect, it} from 'bun:test';
import {createIdSequence} from './createIdSequence';
import {InventoryEntry} from '../../../save/domain/save/InventoryEntry';
import {WorldObjectEntry} from '../../../save/domain/save/WorldObjectEntry';

describe('Create id sequence', () => {

  describe('When the highest identifier of the merged save belongs to an inventory', () => {
    it('should start above that inventory id', () => {
      // Arrange
      const inventories: InventoryEntry[] = [{id: 10, worldObjectIds: [], size: 20}, {id: 42, worldObjectIds: [], size: 20}];
      const worldObjects: WorldObjectEntry[] = [{id: 7, groupId: 'Iron'}];
      const idSequence = createIdSequence(inventories, worldObjects);

      // Act
      const generatedId = idSequence.next();

      // Assert
      expect(generatedId).toBe(43);
    });
  });

  describe('When the highest identifier of the merged save belongs to a world object', () => {
    it('should start above that world object id', () => {
      // Arrange
      const inventories: InventoryEntry[] = [{id: 42, worldObjectIds: [], size: 20}];
      const worldObjects: WorldObjectEntry[] = [{id: 500, groupId: 'Iron'}, {id: 7, groupId: 'Cobalt'}];
      const idSequence = createIdSequence(inventories, worldObjects);

      // Act
      const generatedId = idSequence.next();

      // Assert
      expect(generatedId).toBe(501);
    });
  });

  describe('When the merged save has neither inventory nor world object', () => {
    it('should start at the first id', () => {
      // Arrange
      const noInventories: never[] = [];
      const noWorldObjects: never[] = [];
      const idSequence = createIdSequence(noInventories, noWorldObjects);

      // Act
      const generatedId = idSequence.next();

      // Assert
      expect(generatedId).toBe(1);
    });
  });

  describe('When several identifiers are asked for', () => {
    it('should hand out increasing ids', () => {
      // Arrange
      const inventories: InventoryEntry[] = [{id: 42, worldObjectIds: [], size: 20}];
      const noWorldObjects: never[] = [];
      const idSequence = createIdSequence(inventories, noWorldObjects);

      // Act
      const generatedIds = [idSequence.next(), idSequence.next(), idSequence.next()];

      // Assert
      expect(generatedIds).toEqual([43, 44, 45]);
    });
  });
});
