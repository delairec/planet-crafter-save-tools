import {describe, expect, it} from 'bun:test';
import {formatSaveWarning} from './formatSaveWarning';
import {SaveWarning, SaveWarningCode} from 'shared-save-processing/gameDefinitions';
import {SaveValidationMessageViewModel} from './viewModels/SaveFileValidationViewModel';

describe('formatSaveWarning', () => {

  describe('When the save format is the legacy one', () => {
    it('should state that the save was written by 1.618 or earlier, without a location', () => {
      // Act
      const warning = formatSaveWarning({code: 'legacy-save-format'});

      // Assert
      expect<SaveValidationMessageViewModel>(warning).toEqual({
        message: 'This save was written by version 1.618 of the game or earlier, in the format that still carries the Terrain Layers section.',
        location: null
      });
    });
  });

  describe('When the save contradicts the game release its version declares', () => {
    it('should name the declared version, its release and the release whose format the save carries', () => {
      // Arrange
      const contradiction: SaveWarning = {
        code: 'declared-release-contradicts-content',
        declaredVersion: '2.103',
        declaredRelease: '2.102',
        carriedRelease: '1.618'
      };

      // Act
      const warning = formatSaveWarning(contradiction);

      // Assert
      expect<SaveValidationMessageViewModel>(warning).toEqual({
        message: 'This save declares game version 2.103, which the format of release 2.102 writes, but carries the format of release 1.618. It was read by what it carries.',
        location: null
      });
    });
  });

  describe('When the warning code is unknown', () => {
    it('should return a generic sentence rather than the code', () => {
      // Arrange
      const unknownWarning = {code: 'unheard-of-warning' as SaveWarningCode} as SaveWarning;

      // Act
      const warning = formatSaveWarning(unknownWarning);

      // Assert
      expect<SaveValidationMessageViewModel>(warning).toEqual({
        message: 'This save raised a warning the save manager cannot describe.',
        location: null
      });
    });
  });
});
