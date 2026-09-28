import {describe, expect, it} from 'bun:test';
import {DeclaredReleaseContradiction, detectDeclaredReleaseContradiction} from './detectDeclaredReleaseContradiction';
import {GAME_RELEASES} from '../../testing/gameReleasesFixture';

describe('detectDeclaredReleaseContradiction', () => {
  describe('When the save declares 2.004 or later and carries the format of 1.618', () => {
    it('should name the declared version, its release and the release whose format the save carries', () => {
      // Act
      const contradiction = detectDeclaredReleaseContradiction({declaredVersion: '2.103', carriedRelease: '1.618'}, GAME_RELEASES);

      // Assert
      expect<DeclaredReleaseContradiction | null>(contradiction).toEqual({declaredVersion: '2.103', declaredRelease: '2.102', carriedRelease: '1.618'});
    });
  });

  describe('When the save declares 1.618 or earlier and carries the format of 2.004', () => {
    it('should name the declared version, its release and the release whose format the save carries', () => {
      // Act
      const contradiction = detectDeclaredReleaseContradiction({declaredVersion: '1.0', carriedRelease: '2.004'}, GAME_RELEASES);

      // Assert
      expect<DeclaredReleaseContradiction | null>(contradiction).toEqual({declaredVersion: '1.0', declaredRelease: '1.618', carriedRelease: '2.004'});
    });
  });

  describe('When the release the save declares writes the format it carries', () => {
    it.each([
      ['2.004', '2.004'],
      ['2.103', '2.004'],
      ['1.618', '1.618']
    ])('should find no contradiction for a save declaring %s and carrying the format of %s', (declaredVersion, carriedRelease) => {
      // Act
      const contradiction = detectDeclaredReleaseContradiction({declaredVersion, carriedRelease}, GAME_RELEASES);

      // Assert
      expect(contradiction).toBeNull();
    });
  });

  describe('When the version the save declares resolves to no release', () => {
    it('should find no contradiction', () => {
      // Act
      const contradiction = detectDeclaredReleaseContradiction({declaredVersion: 'unreleased', carriedRelease: '2.004'}, GAME_RELEASES);

      // Assert
      expect(contradiction).toBeNull();
    });
  });

  describe('When the save declares no version', () => {
    it('should find no contradiction', () => {
      // Arrange
      const noDeclaredVersion = undefined;

      // Act
      const contradiction = detectDeclaredReleaseContradiction({declaredVersion: noDeclaredVersion, carriedRelease: '1.618'}, GAME_RELEASES);

      // Assert
      expect(contradiction).toBeNull();
    });
  });

  describe('When the format the save carries is known to no release', () => {
    it('should find no contradiction', () => {
      // Arrange
      const noCarriedRelease = undefined;

      // Act
      const contradiction = detectDeclaredReleaseContradiction({declaredVersion: '2.103', carriedRelease: noCarriedRelease}, GAME_RELEASES);

      // Assert
      expect(contradiction).toBeNull();
    });
  });
});
