import {describe, expect, it} from 'bun:test';
import {PlayerEntity, type PlayerEntityInput} from './PlayerEntity';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError';

function createPlayerInput(overrides: Partial<PlayerEntityInput> = {}): PlayerEntityInput {
  return {
    name: 'Nikowa',
    inventory: ['Backpack4'],
    equipment: ['OxygenTank5'],
    planetId: 'Toxicity',
    host: true,
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
    expect(player.name).toBe('Nikowa');
    expect(player.inventory).toEqual(['Backpack4']);
    expect(player.equipment).toEqual(['OxygenTank5']);
    expect(player.planetId).toBe('Toxicity');
    expect(player.isHost).toBe(true);
  });

  it('should reject an empty name', () => {
    // Arrange
    const input = createPlayerInput({name: ''});

    // Act
    const buildPlayer = () => new PlayerEntity(input);

    // Assert
    expect(buildPlayer).toThrow(InvalidSaveDataError);
  });

  describe('When the planet it stands on is asked', () => {
    it.each([
      {situation: 'an ordinary save', planetId: 'Toxicity', isLegacySave: false, expected: 'Toxicity'},
      {situation: 'an empty planet', planetId: '', isLegacySave: false, expected: undefined},
      {situation: 'a legacy save', planetId: 'Toxicity', isLegacySave: true, expected: undefined}
    ])('should answer $expected for $situation', ({planetId, isLegacySave, expected}) => {
      // Arrange
      const player = new PlayerEntity(createPlayerInput({planetId}));

      // Act
      const planet = player.findPlanetStoodOn(isLegacySave);

      // Assert
      expect(planet).toBe(expected);
    });
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
