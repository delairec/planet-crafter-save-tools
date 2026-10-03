import {describe, expect, it} from 'bun:test';
import {PlayerEntity, type PlayerEntityInput} from './PlayerEntity';
import {PlayerGaugesValueObject} from '../valueObjects/PlayerGaugesValueObject';

function createPlayerInput(overrides: Partial<PlayerEntityInput> = {}): PlayerEntityInput {
  return {
    id: '76561190000000001',
    name: 'Nikowa',
    inventory: ['Backpack4'],
    inventorySize: 12,
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
    expect(player.inventorySize).toBe(12);
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

  describe('When the free slots of the inventory are counted', () => {
    it.each([
      {inventory: ['Iron', 'Iron', 'Cobalt'], inventorySize: 12, freeSlotCount: 9},
      {inventory: ['Iron', 'Iron', 'Cobalt'], inventorySize: 3, freeSlotCount: 0},
      {inventory: ['Iron', 'Iron', 'Cobalt'], inventorySize: 2, freeSlotCount: 0}
    ])('should give $freeSlotCount free slots for $inventory.length items in $inventorySize slots', ({inventory, inventorySize, freeSlotCount}) => {
      // Arrange
      const player = new PlayerEntity(createPlayerInput({inventory, inventorySize}));

      // Act
      const freeInventorySlotCount = player.freeInventorySlotCount;

      // Assert
      expect(freeInventorySlotCount).toBe(freeSlotCount);
    });
  });
});
