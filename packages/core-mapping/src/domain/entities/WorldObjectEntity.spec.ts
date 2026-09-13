import {describe, expect, it} from 'bun:test';
import {WorldObjectEntity} from './WorldObjectEntity';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError';

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
});
