import {describe, expect, it} from 'bun:test';
import {UniqueHostViolation, validateUniqueHost} from './validateUniqueHost';
import {createPlayer} from 'shared-save-processing/testing/createSaveRecords.js';
import {Player} from 'shared-save-processing/gameDefinitions';

describe('validateUniqueHost', () => {

  describe('When there are no players', () => {
    it('should report no violation', () => {
      // Arrange
      const noPlayers: Player[] = [];

      // Act
      const violation = validateUniqueHost(noPlayers);

      // Assert
      expect<UniqueHostViolation | null>(violation).toBeNull();
    });
  });

  describe('When exactly one player is host', () => {
    it('should report no violation', () => {
      // Arrange
      const players = [createPlayer({host: true}), createPlayer({host: false})];

      // Act
      const violation = validateUniqueHost(players);

      // Assert
      expect<UniqueHostViolation | null>(violation).toBeNull();
    });
  });

  describe('When no player is host', () => {
    it('should report a violation counting the hosts found', () => {
      // Arrange
      const players = [createPlayer({host: false})];

      // Act
      const violation = validateUniqueHost(players);

      // Assert
      expect<UniqueHostViolation | null>(violation).toEqual({hostCount: 0});
    });
  });

  describe('When more than one player is host', () => {
    it('should report a violation counting the hosts found', () => {
      // Arrange
      const players = [createPlayer({host: true}), createPlayer({host: true})];

      // Act
      const violation = validateUniqueHost(players);

      // Assert
      expect<UniqueHostViolation | null>(violation).toEqual({hostCount: 2});
    });
  });
});
