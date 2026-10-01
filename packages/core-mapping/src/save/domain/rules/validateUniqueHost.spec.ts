import {describe, expect, it} from 'bun:test';
import {UniqueHostViolation, validateUniqueHost} from './validateUniqueHost';
import {PlayerEntry} from '../save/PlayerEntry';
import {createPlayerEntry} from '../../testing/createSaveEntries';

describe('validateUniqueHost', () => {

  describe('When there are no players', () => {
    it('should report no violation', () => {
      // Arrange
      const noPlayers: PlayerEntry[] = [];

      // Act
      const violation = validateUniqueHost(noPlayers);

      // Assert
      expect<UniqueHostViolation | null>(violation).toBeNull();
    });
  });

  describe('When exactly one player is host', () => {
    it('should report no violation', () => {
      // Arrange
      const players = [createPlayerEntry({name: 'Nikowa', host: true}), createPlayerEntry({name: 'Sakia', host: false})];

      // Act
      const violation = validateUniqueHost(players);

      // Assert
      expect<UniqueHostViolation | null>(violation).toBeNull();
    });
  });

  describe('When no player is host', () => {
    it('should report a violation counting the hosts found', () => {
      // Arrange
      const players = [createPlayerEntry({name: 'Nikowa', host: false})];

      // Act
      const violation = validateUniqueHost(players);

      // Assert
      expect<UniqueHostViolation | null>(violation).toEqual({hostCount: 0});
    });
  });

  describe('When more than one player is host', () => {
    it('should report a violation counting the hosts found', () => {
      // Arrange
      const players = [createPlayerEntry({name: 'Nikowa', host: true}), createPlayerEntry({name: 'Sakia', host: true})];

      // Act
      const violation = validateUniqueHost(players);

      // Assert
      expect<UniqueHostViolation | null>(violation).toEqual({hostCount: 2});
    });
  });
});
