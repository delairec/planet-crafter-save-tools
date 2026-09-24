import {describe, expect, it} from 'bun:test';
import {ValidateSaveFileController} from './ValidateSaveFileController';
import {createFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {SaveFileValidationViewModel} from '../presentation/viewModels/SaveFileValidationViewModel';

describe('ValidateSaveFileController', () => {

  describe('When the save file is valid', () => {
    it('should return a valid view model', async () => {
      // Act
      const viewModel = await ValidateSaveFileController.validateSaveFile('Save-A.json', createFakeSaveContent());

      // Assert
      expect<SaveFileValidationViewModel>(viewModel).toEqual({status: 'valid', errors: [], warnings: []});
    });
  });

  describe('When the save file is invalid', () => {
    it('should return an invalid view model with the validation error messages', async () => {
      // Act
      const viewModel = await ValidateSaveFileController.validateSaveFile('Save-A.json', 'not a valid save at all');

      // Assert
      expect<SaveFileValidationViewModel>(viewModel).toEqual({
        status: 'invalid',
        errors: [{message: 'Expected 11 or 12 sections but found 1', location: null}],
        warnings: []
      });
    });
  });
});
