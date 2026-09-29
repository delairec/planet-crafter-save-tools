import {describe, expect, it} from 'bun:test';
import type {SaveWarning} from 'shared-save-processing/gameDefinitions';
import {collectSaveWarnings} from './collectSaveWarnings';
import {GAME_RELEASES} from '../testing/gameReleasesFixture';

describe('collectSaveWarnings', () => {
  describe('When the release the save declares contradicts the format it carries', () => {
    it('should add the contradiction after the warnings of the validation', () => {
      // Arrange
      const validation = {isValid: true, errors: [], warnings: [{code: 'legacy-save-format' as const}], declaredVersion: '2.103', carriedRelease: '1.618'};

      // Act
      const warnings = collectSaveWarnings(validation, GAME_RELEASES);

      // Assert
      expect<SaveWarning[]>(warnings).toEqual([
        {code: 'legacy-save-format'},
        {code: 'declared-release-contradicts-content', declaredVersion: '2.103', declaredRelease: '2.102', carriedRelease: '1.618'}
      ]);
    });
  });

  describe('When the release the save declares writes the format it carries', () => {
    it('should keep the warnings of the validation alone', () => {
      // Arrange
      const validation = {isValid: true, errors: [], warnings: [{code: 'legacy-save-format' as const}], declaredVersion: '1.618', carriedRelease: '1.618'};

      // Act
      const warnings = collectSaveWarnings(validation, GAME_RELEASES);

      // Assert
      expect<SaveWarning[]>(warnings).toEqual([{code: 'legacy-save-format'}]);
    });
  });
});
