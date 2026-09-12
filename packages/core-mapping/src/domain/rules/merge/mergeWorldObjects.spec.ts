import {describe, it, expect} from 'bun:test';
import {mergeWorldObjects} from './mergeWorldObjects';
import {WorldObjectEntry} from './WorldObjectEntry';

describe('Merge world objects', () => {
  const noOrphanWorldObjectIds = new Set<number>();
  const worldObjectFromSaveA: WorldObjectEntry = {id: 101, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 110910047};
  const worldObjectFromSaveB: WorldObjectEntry = {id: 201, gId: 'OtherObject', pos: '400,500,600', rot: '0,0,0,1', planet: 110910047};
  const sharedWorldObject: WorldObjectEntry = {id: 301, gId: 'SharedObject', pos: '700,800,900', rot: '0,0,0,1', planet: 110910047};

  describe('When world objects are unique', () => {
    it('should keep the world objects of each save under their own origin', () => {
      // Act
      const result = mergeWorldObjects(
        [worldObjectFromSaveA],
        [worldObjectFromSaveB],
        noOrphanWorldObjectIds
      );

      // Assert
      expect(result).toEqual({
        fromSaveA: [{id: 101, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 110910047}],
        fromSaveB: [{id: 201, gId: 'OtherObject', pos: '400,500,600', rot: '0,0,0,1', planet: 110910047}]
      });
    });
  });

  describe('When save B contains world objects from an ejected player inventory', () => {
    it('should drop the world objects that were in the orphan inventories', () => {
      // Arrange
      const noWorldObjectsFromSaveA: never[] = [];
      const orphanWorldObjectIds = new Set([901, 902, 903]);
      const worldObjectsFromSaveB: WorldObjectEntry[] = [
        {id: 901, gId: 'Iron'},
        {id: 902, gId: 'Cobalt'},
        {id: 903, gId: 'AirFilter1'}
      ];

      // Act
      const result = mergeWorldObjects(
        noWorldObjectsFromSaveA,
        worldObjectsFromSaveB,
        orphanWorldObjectIds
      );

      // Assert
      expect(result).toEqual({fromSaveA: [], fromSaveB: []});
    });
  });

  describe('When a world object appears in both saves with the same pos', () => {
    it('should deduplicate by pos and keep only the one from save A', () => {
      // Arrange
      const worldObjectInSaveA: WorldObjectEntry = {...sharedWorldObject, id: 301};
      const worldObjectInSaveB: WorldObjectEntry = {...sharedWorldObject, id: 999};

      // Act
      const result = mergeWorldObjects(
        [worldObjectInSaveA],
        [worldObjectInSaveB],
        noOrphanWorldObjectIds
      );

      // Assert
      expect(result).toEqual({
        fromSaveA: [{id: 301, gId: 'SharedObject', pos: '700,800,900', rot: '0,0,0,1', planet: 110910047}],
        fromSaveB: []
      });
    });
  });

  describe('When two world objects share the same pos but are on different planets', () => {
    it('should keep both world objects as they are distinct objects', () => {
      // Arrange
      const worldObjectOnPlanetA: WorldObjectEntry = {id: 101, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 111111111};
      const worldObjectOnPlanetB: WorldObjectEntry = {id: 201, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 222222222};

      // Act
      const result = mergeWorldObjects(
        [worldObjectOnPlanetA],
        [worldObjectOnPlanetB],
        noOrphanWorldObjectIds
      );

      // Assert
      expect(result).toEqual({
        fromSaveA: [{id: 101, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 111111111}],
        fromSaveB: [{id: 201, gId: 'SomeObject', pos: '100,200,300', rot: '0,0,0,1', planet: 222222222}]
      });
    });
  });
});
