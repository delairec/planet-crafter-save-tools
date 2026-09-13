import {describe, expect, it} from 'bun:test';
import {PlacedWorldObjectEntity} from './PlacedWorldObjectEntity';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError';

describe('PlacedWorldObjectEntity', () => {
  it('should expose the placement it was built from', () => {
    // Arrange
    const input = {
      id: '1',
      name: 'Drill0' as const,
      position: [1, 2, 3] as [number, number, number],
      planetId: 1,
      inventoryId: 5
    };

    // Act
    const placedWorldObject = new PlacedWorldObjectEntity(input);

    // Assert
    expect(placedWorldObject.id).toBe('1');
    expect(placedWorldObject.name).toBe('Drill0');
    expect(placedWorldObject.position).toEqual([1, 2, 3]);
    expect(placedWorldObject.planetId).toBe(1);
    expect(placedWorldObject.inventoryId).toBe(5);
  });

  it('should reject a position containing NaN', () => {
    // Arrange
    const input = {id: '1', name: 'Drill0' as const, position: [NaN, 2, 3] as [number, number, number], planetId: 1};

    // Act & Assert
    expect(() => new PlacedWorldObjectEntity(input)).toThrow(InvalidSaveDataError);
  });

  describe('When measured against another placed world object', () => {
    const origin = new PlacedWorldObjectEntity({
      id: 'origin', name: 'Drill0' as const, position: [0, 0, 0], planetId: 1
    });

    it('should report the euclidean distance between the two positions', () => {
      // Arrange
      const target = new PlacedWorldObjectEntity({
        id: 'target', name: 'Drill0' as const, position: [3, 4, 0], planetId: 1
      });

      // Act
      const distance = origin.distanceTo(target);

      // Assert
      expect(distance).toBe(5);
    });

    it('should be within a radius reaching the other position', () => {
      // Arrange
      const target = new PlacedWorldObjectEntity({
        id: 'target', name: 'Drill0' as const, position: [3, 4, 0], planetId: 1
      });

      // Act
      const reached = origin.isWithinRadius(target, 5);

      // Assert
      expect(reached).toBe(true);
    });

    it('should be outside a radius falling short of the other position', () => {
      // Arrange
      const target = new PlacedWorldObjectEntity({
        id: 'target', name: 'Drill0' as const, position: [3, 4, 0], planetId: 1
      });

      // Act
      const reached = origin.isWithinRadius(target, 4.99);

      // Assert
      expect(reached).toBe(false);
    });
  });

  describe('When its position is read', () => {
    it('should hand out a copy that cannot move it', () => {
      // Arrange
      const worldObject = new PlacedWorldObjectEntity({
        id: 'wo-1', name: 'Drill0' as const, position: [1, 2, 3], planetId: 1
      });

      // Act
      (worldObject.position as unknown as number[])[0] = 99;

      // Assert
      expect(worldObject.position).toEqual([1, 2, 3]);
    });
  });
});
