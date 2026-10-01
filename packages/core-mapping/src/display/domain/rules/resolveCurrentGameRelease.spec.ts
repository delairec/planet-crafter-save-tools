import {describe, expect, it} from 'bun:test';
import {resolveCurrentGameRelease} from './resolveCurrentGameRelease';
import {GAME_RELEASES} from '../../../save/testing/gameReleasesFixture';

describe('resolveCurrentGameRelease', () => {
  it('should name the last release of the releases table, not the first release writing its format', () => {
    // Act
    const currentGameRelease = resolveCurrentGameRelease(GAME_RELEASES);

    // Assert
    expect(currentGameRelease).toBe('2.102');
  });
});
