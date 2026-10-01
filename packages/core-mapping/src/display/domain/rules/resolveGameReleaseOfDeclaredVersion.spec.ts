import {describe, expect, it} from 'bun:test';
import {resolveGameReleaseOfDeclaredVersion} from './resolveGameReleaseOfDeclaredVersion';
import {GAME_RELEASES} from '../../../save/testing/gameReleasesFixture';

describe('resolveGameReleaseOfDeclaredVersion', () => {
  it.each([
    ['2.004', '2.004'],
    ['2.008', '2.004'],
    ['2.103', '2.102'],
    ['1.618', '1.618']
  ])('should resolve the declared version %s to the release %s', (declaredVersion, expectedRelease) => {
    // Act
    const release = resolveGameReleaseOfDeclaredVersion(declaredVersion, GAME_RELEASES);

    // Assert
    expect(release).toBe(expectedRelease);
  });

  describe('When the save declares no version', () => {
    it('should resolve to the current game release', () => {
      // Arrange
      const noDeclaredVersion = undefined;

      // Act
      const release = resolveGameReleaseOfDeclaredVersion(noDeclaredVersion, GAME_RELEASES);

      // Assert
      expect(release).toBe('2.102');
    });
  });

  describe('When the declared version is not a release number', () => {
    it('should resolve to the current game release', () => {
      // Act
      const release = resolveGameReleaseOfDeclaredVersion('beta', GAME_RELEASES);

      // Assert
      expect(release).toBe('2.102');
    });
  });
});
