import {describe, expect, it} from 'bun:test';
import {InventoryEntity} from './InventoryEntity';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError';

describe('InventoryEntity', () => {
  it('should expose the contents it was built from', () => {
    // Arrange
    const input = {id: 42, worldObjectIds: ['1', '2'], size: 10};

    // Act
    const inventory = new InventoryEntity(input);

    // Assert
    expect(inventory.id).toBe(42);
    expect(inventory.worldObjectIds).toEqual(['1', '2']);
    expect(inventory.size).toBe(10);
  });

  it('should reject a non-finite size', () => {
    // Arrange
    const input = {id: 42, worldObjectIds: ['1', '2'], size: NaN};

    // Act & Assert
    expect(() => new InventoryEntity(input)).toThrow(InvalidSaveDataError);
  });

  describe('When asked whether it holds a world object', () => {
    it('should hold a world object whose id it carries', () => {
      // Arrange
      const inventory = new InventoryEntity({id: 42, worldObjectIds: ['1', '2'], size: 10});

      // Act
      const holdsTheWorldObject = inventory.contains('2');

      // Assert
      expect(holdsTheWorldObject).toBe(true);
    });

    it('should not hold a world object whose id it does not carry', () => {
      // Arrange
      const inventory = new InventoryEntity({id: 42, worldObjectIds: ['1', '2'], size: 10});

      // Act
      const holdsTheWorldObject = inventory.contains('3');

      // Assert
      expect(holdsTheWorldObject).toBe(false);
    });
  });

  describe('When its world object ids are read', () => {
    it('should hand out a copy that cannot alter what it holds', () => {
      // Arrange
      const inventory = new InventoryEntity({id: 42, worldObjectIds: ['1', '2'], size: 10});

      // Act
      (inventory.worldObjectIds as string[]).push('3');

      // Assert
      expect(inventory.worldObjectIds).toEqual(['1', '2']);
      expect(inventory.contains('3')).toBe(false);
    });
  });
});
