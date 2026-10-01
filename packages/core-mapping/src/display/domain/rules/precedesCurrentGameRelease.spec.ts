import {describe, expect, it} from 'bun:test';
import {precedesCurrentGameRelease} from './precedesCurrentGameRelease';
import {GAME_RELEASES} from '../../../save/testing/gameReleasesFixture';

describe('precedesCurrentGameRelease', () => {
  describe('When the release is earlier than the last of the releases table', () => {
    it.each([['1.618'], ['2.004'], ['2.100']])('should tell that %s precedes the current game release', (release) => {
      // Act
      const precedes = precedesCurrentGameRelease(release, GAME_RELEASES);

      // Assert
      expect(precedes).toBe(true);
    });
  });

  describe('When the release is the last of the releases table', () => {
    it('should tell that it does not precede the current game release', () => {
      // Act
      const precedes = precedesCurrentGameRelease('2.102', GAME_RELEASES);

      // Assert
      expect(precedes).toBe(false);
    });
  });
});
