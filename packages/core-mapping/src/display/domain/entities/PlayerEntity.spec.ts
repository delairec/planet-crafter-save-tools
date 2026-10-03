import {describe, expect, it} from 'bun:test';
import {PlayerEntity, type PlayerEntityInput} from './PlayerEntity';
import {PlayerGaugesValueObject} from '../valueObjects/PlayerGaugesValueObject';

function createPlayerInput(overrides: Partial<PlayerEntityInput> = {}): PlayerEntityInput {
  return {
    id: '76561190000000001',
    name: 'Nikowa',
    inventory: ['Backpack4'],
    equipment: ['OxygenTank5'],
    planetId: 'Toxicity',
    host: true,
    gauges: {oxygen: 280, health: 72.5, thirst: 96},
    ...overrides
  };
}

describe('PlayerEntity', () => {
  it('should expose what it was built from', () => {
    // Arrange
    const input = createPlayerInput();

    // Act
    const player = new PlayerEntity(input);

    // Assert
    expect(player.id).toBe('76561190000000001');
    expect(player.name).toBe('Nikowa');
    expect(player.inventory).toEqual(['Backpack4']);
    expect(player.equipment).toEqual(['OxygenTank5']);
    expect(player.planetId).toBe('Toxicity');
    expect(player.isHost).toBe(true);
    expect<PlayerGaugesValueObject>(player.gauges).toEqual({oxygen: 280, health: 72.5, thirst: 96});
  });

  describe('When its belongings are read', () => {
    it('should hand out copies that cannot alter what it carries', () => {
      // Arrange
      const player = new PlayerEntity(createPlayerInput());

      // Act
      (player.inventory as string[]).push('Rocket1');
      (player.equipment as string[]).push('Rocket1');

      // Assert
      expect(player.inventory).toEqual(['Backpack4']);
      expect(player.equipment).toEqual(['OxygenTank5']);
    });
  });
});
