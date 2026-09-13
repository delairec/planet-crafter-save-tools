import {describe, expect, it} from 'bun:test';
import {WorldObjectEntity} from './WorldObjectEntity';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError';
import {WorldObjectName} from '../worldObjectNames';

describe('WorldObjectEntity', () => {
  it('should expose the identity it was built from', () => {
    // Arrange
    const input = {id: '1', name: 'Drill0' as const};

    // Act
    const worldObject = new WorldObjectEntity(input);

    // Assert
    expect(worldObject.id).toBe('1');
    expect(worldObject.name).toBe('Drill0');
  });

  it('should reject an empty id', () => {
    // Arrange
    const input = {id: '', name: 'Drill0' as const};

    // Act & Assert
    expect(() => new WorldObjectEntity(input)).toThrow(InvalidSaveDataError);
  });

  describe('When asked whether it is an energy fuse', () => {
    it('should be an energy fuse when it carries the energy fuse name', () => {
      // Arrange
      const worldObject = new WorldObjectEntity({id: '1', name: 'FuseEnergy1' as WorldObjectName});

      // Act
      const energyFuse = worldObject.isEnergyFuse();

      // Assert
      expect(energyFuse).toBe(true);
    });

    it('should not be an energy fuse when it carries any other name', () => {
      // Arrange
      const worldObject = new WorldObjectEntity({id: '1', name: 'Drill0' as const});

      // Act
      const energyFuse = worldObject.isEnergyFuse();

      // Assert
      expect(energyFuse).toBe(false);
    });
  });
});
