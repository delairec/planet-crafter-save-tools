import {describe, expect, it} from 'bun:test';
import {MergeSaveFilesController} from './MergeSaveFilesController';
import {createFakeSaveContent, createLegacyFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {parseSaveSections} from 'shared-save-processing/parseSaveSections.js';
import {SaveWarning} from 'shared-save-processing/gameDefinitions';
import {SaveValidationMessageViewModel} from '../presentation/viewModels/SaveFileValidationViewModel';

describe('MergeSaveFilesController', () => {

  describe('When both saves are valid', () => {
    it('should merge them into a save named after both file names', async () => {
      // Arrange
      const contentA = createFakeSaveContent();
      const contentB = createFakeSaveContent();

      // Act
      const viewModel = await MergeSaveFilesController.mergeSaveFiles({
        fileNameA: 'Standard-1.json',
        contentA,
        fileNameB: 'Standard-2.json',
        contentB
      });

      // Assert
      expect(viewModel.status).toBe('success');
      expect(viewModel.fileName).toBe('Standard-1-Standard-2-merged.json');
    });
  });

  describe('When one of the saves is invalid', () => {
    it('should report its validation errors against that save alone', async () => {
      // Arrange
      const contentA = 'not a valid save at all';
      const contentB = createFakeSaveContent();

      // Act
      const viewModel = await MergeSaveFilesController.mergeSaveFiles({
        fileNameA: 'Standard-1.json',
        contentA,
        fileNameB: 'Standard-2.json',
        contentB
      });

      // Assert
      expect(viewModel.status).toBe('validationError');
      expect<SaveValidationMessageViewModel[]>(viewModel.saveAErrors).toEqual([{message: 'Expected 11 or 12 sections but found 1', location: null}]);
      expect<SaveValidationMessageViewModel[]>(viewModel.saveBErrors).toEqual([]);
    });
  });

  describe('When a save of 1.618 is merged with a save of 2.004', () => {
    it('should write the format of 2.004 and declare a version of that format', async () => {
      // Arrange
      const contentA = createLegacyFakeSaveContent();
      const contentB = createFakeSaveContent();

      // Act
      const viewModel = await MergeSaveFilesController.mergeSaveFiles({fileNameA: 'Legacy.json', contentA, fileNameB: 'Standard-2.json', contentB});

      // Assert
      const {formatRelease, warnings} = parseSaveSections(viewModel.content);
      expect(formatRelease).toBe('2.004');
      expect<SaveWarning[]>(warnings).toEqual([]);
    });

    describe('When the legacy format is asked for', () => {
      it('should write the format of 1.618 and declare a version of that format', async () => {
        // Arrange
        const contentA = createLegacyFakeSaveContent();
        const contentB = createFakeSaveContent();

        // Act
        const viewModel = await MergeSaveFilesController.mergeSaveFiles({fileNameA: 'Legacy.json', contentA, fileNameB: 'Standard-2.json', contentB, preferLegacyFormat: true});

        // Assert
        const {formatRelease, warnings} = parseSaveSections(viewModel.content);
        expect(formatRelease).toBe('1.618');
        expect<SaveWarning[]>(warnings).toEqual([{code: 'legacy-save-format'}]);
      });
    });
  });
});
