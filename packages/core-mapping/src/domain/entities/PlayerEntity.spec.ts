import {describe, expect, it} from 'bun:test';
import {PlayerEntity} from './PlayerEntity';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError';

describe('PlayerEntity', () => {
  it('should expose the belongings it was built from', () => {
    // Arrange
    const input = {name: 'Nikowa', inventory: ['Backpack4'], equipment: ['OxygenTank5']};

    // Act
    const player = new PlayerEntity(input);

    // Assert
    expect(player.name).toBe('Nikowa');
    expect(player.inventory).toEqual(['Backpack4']);
    expect(player.equipment).toEqual(['OxygenTank5']);
  });

  it('should reject an empty name', () => {
    // Arrange
    const input = {name: '', inventory: [], equipment: []};

    // Act & Assert
    expect(() => new PlayerEntity(input)).toThrow(InvalidSaveDataError);
  });
});
