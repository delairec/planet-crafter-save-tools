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

    // Act
    const buildPlayer = () => new PlayerEntity(input);

    // Assert
    expect(buildPlayer).toThrow(InvalidSaveDataError);
  });

  describe('When its belongings are read', () => {
    it('should hand out copies that cannot alter what it carries', () => {
      // Arrange
      const player = new PlayerEntity({name: 'Nikowa', inventory: ['Backpack4'], equipment: ['OxygenTank5']});

      // Act
      (player.inventory as string[]).push('Rocket1');
      (player.equipment as string[]).push('Rocket1');

      // Assert
      expect(player.inventory).toEqual(['Backpack4']);
      expect(player.equipment).toEqual(['OxygenTank5']);
    });
  });
});
