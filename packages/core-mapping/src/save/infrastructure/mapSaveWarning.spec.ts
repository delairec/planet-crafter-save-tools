import {describe, expect, it} from 'bun:test';
import type {SaveWarning as SaveFormatWarning} from 'shared-save-processing/gameDefinitions';
import {mapSaveWarning} from './mapSaveWarning';
import type {SaveWarning} from '../domain/validation/SaveWarning';

describe('mapSaveWarning', () => {
  describe('When the save format reports a save written in the legacy format', () => {
    it('should hand over the legacy format warning of the domain', () => {
      // Arrange
      const saveFormatWarning: SaveFormatWarning = {code: 'legacy-save-format'};

      // Act
      const warning = mapSaveWarning(saveFormatWarning);

      // Assert
      expect<SaveWarning>(warning).toEqual({code: 'legacy-save-format'});
    });
  });

  describe('When the save format reports a declared release its content contradicts', () => {
    it('should hand over the contradiction with the releases it names', () => {
      // Arrange
      const saveFormatWarning: SaveFormatWarning = {
        code: 'declared-release-contradicts-content', declaredVersion: '2.102', declaredRelease: '2.102', carriedRelease: '1.618'
      };

      // Act
      const warning = mapSaveWarning(saveFormatWarning);

      // Assert
      expect<SaveWarning>(warning).toEqual({
        code: 'declared-release-contradicts-content', declaredVersion: '2.102', declaredRelease: '2.102', carriedRelease: '1.618'
      });
    });
  });
});
