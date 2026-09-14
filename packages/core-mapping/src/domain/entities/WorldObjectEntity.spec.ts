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

    // Act
    const buildWorldObject = () => new WorldObjectEntity(input);

    // Assert
    expect(buildWorldObject).toThrow(InvalidSaveDataError);
  });

  describe('When it carries the energy fuse name', () => {
    it('should be an energy fuse', () => {
      // Arrange
      const worldObject = new WorldObjectEntity({id: '1', name: 'FuseEnergy1' as WorldObjectName});

      // Act
      const energyFuse = worldObject.isEnergyFuse();

      // Assert
      expect(energyFuse).toBe(true);
    });
  });

  describe('When it carries any other name', () => {
    it('should not be an energy fuse', () => {
      // Arrange
      const worldObject = new WorldObjectEntity({id: '1', name: 'Drill0' as const});

      // Act
      const energyFuse = worldObject.isEnergyFuse();

      // Assert
      expect(energyFuse).toBe(false);
    });
  });
});
