import {describe, expect, it} from 'bun:test';
import {formatMergeWarning} from './formatMergeWarning';
import {MergeWarning} from '../application/responses/MergeWarning';
import {SaveValidationMessageViewModel} from './viewModels/SaveFileValidationViewModel';

describe('formatMergeWarning', () => {

  describe('When the merge reports the format it wrote', () => {
    it('should state that the saves differ in format and name the release whose format is written, without a location', () => {
      // Act
      const warning = formatMergeWarning({code: 'merged-save-format', formatRelease: '2.004'});

      // Assert
      expect<SaveValidationMessageViewModel>(warning).toEqual({
        message: 'The two saves carry different formats; the merged save is written in the format of release 2.004.',
        location: null
      });
    });
  });

  describe('When the merge reports a section writing that format dropped', () => {
    it('should name the section by its label', () => {
      // Act
      const warning = formatMergeWarning({code: 'merged-save-section-dropped', section: 'terrainLayers'});

      // Assert
      expect<SaveValidationMessageViewModel>(warning).toEqual({
        message: 'Writing that format dropped the Terrain layers section.',
        location: null
      });
    });
  });

  describe('When the merge reports content written by a release later than the format written', () => {
    it('should name both releases and say that the game may drop what the earlier release does not know', () => {
      // Act
      const warning = formatMergeWarning({code: 'merged-save-content-newer-than-format', formatRelease: '1.618', contentRelease: '2.004'});

      // Assert
      expect<SaveValidationMessageViewModel>(warning).toEqual({
        message: 'The merged save carries content of a save written in the format of release 2.004 or a later one; the tool dropped none of it, but a game of release 1.618 may not know every object, item or planet it names and may drop them when it loads the save.',
        location: null
      });
    });
  });

  describe('When the warning code is unknown', () => {
    it('should return a generic sentence rather than the code', () => {
      // Arrange
      const unknownWarning = {code: 'unheard-of-warning' as MergeWarning['code']} as MergeWarning;

      // Act
      const warning = formatMergeWarning(unknownWarning);

      // Assert
      expect<SaveValidationMessageViewModel>(warning).toEqual({
        message: 'The merge raised a warning that has no description.',
        location: null
      });
    });
  });
});
