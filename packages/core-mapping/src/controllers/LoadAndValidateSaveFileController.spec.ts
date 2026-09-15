import {describe, expect, it} from 'bun:test';
import {LoadAndValidateSaveFileController} from './LoadAndValidateSaveFileController';
import {createFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {LoadSaveFileViewModel} from '../presentation/viewModels/LoadSaveFileViewModel';

describe('LoadAndValidateSaveFileController', () => {

  describe('When the file name has a valid extension and the content is a valid save', () => {
    it('should return a valid view model', async () => {
      // Act
      const viewModel = await LoadAndValidateSaveFileController.loadAndValidateSaveFile('Save-A.json', createFakeSaveContent());

      // Assert
      expect<LoadSaveFileViewModel>(viewModel).toEqual({status: 'valid', errors: [], warnings: []});
    });
  });

  describe('When the content is not a valid save', () => {
    it('should return an invalid view model with the content validation error messages', async () => {
      // Act
      const viewModel = await LoadAndValidateSaveFileController.loadAndValidateSaveFile('Save-A.json', 'not a valid save at all');

      // Assert
      expect<LoadSaveFileViewModel>(viewModel).toEqual({
        status: 'invalid',
        errors: [{message: 'Expected 11 sections but found 1', location: null}],
        warnings: []
      });
    });
  });
});
