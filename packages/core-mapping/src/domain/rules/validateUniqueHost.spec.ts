import {describe, expect, it} from 'bun:test';
import {UniqueHostViolation, validateUniqueHost} from './validateUniqueHost';
import {PlayerEntity} from '../entities/PlayerEntity';

function createPlayer(name: string, host: boolean): PlayerEntity {
  return new PlayerEntity({name, inventory: [], equipment: [], planetId: 'Prime', host});
}

describe('validateUniqueHost', () => {

  describe('When there are no players', () => {
    it('should report no violation', () => {
      // Arrange
      const noPlayers: PlayerEntity[] = [];

      // Act
      const violation = validateUniqueHost(noPlayers);

      // Assert
      expect<UniqueHostViolation | null>(violation).toBeNull();
    });
  });

  describe('When exactly one player is host', () => {
    it('should report no violation', () => {
      // Arrange
      const players = [createPlayer('Nikowa', true), createPlayer('Sakia', false)];

      // Act
      const violation = validateUniqueHost(players);

      // Assert
      expect<UniqueHostViolation | null>(violation).toBeNull();
    });
  });

  describe('When no player is host', () => {
    it('should report a violation counting the hosts found', () => {
      // Arrange
      const players = [createPlayer('Nikowa', false)];

      // Act
      const violation = validateUniqueHost(players);

      // Assert
      expect<UniqueHostViolation | null>(violation).toEqual({hostCount: 0});
    });
  });

  describe('When more than one player is host', () => {
    it('should report a violation counting the hosts found', () => {
      // Arrange
      const players = [createPlayer('Nikowa', true), createPlayer('Sakia', true)];

      // Act
      const violation = validateUniqueHost(players);

      // Assert
      expect<UniqueHostViolation | null>(violation).toEqual({hostCount: 2});
    });
  });
});
