import {describe, expect, it} from 'bun:test';
import {LoadAndValidateSaveFileController} from './LoadAndValidateSaveFileController';
import {createFakeSaveContent, createLegacyFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {LoadSaveFileViewModel} from '../presentation/viewModels/LoadSaveFileViewModel';

describe('LoadAndValidateSaveFileController', () => {

  describe('When the file name has an invalid extension', () => {
    it('should return an invalid view model', async () => {
      // Act
      const viewModel = await LoadAndValidateSaveFileController.loadAndValidateSaveFile('Save-A.txt', createFakeSaveContent());

      // Assert
      expect<LoadSaveFileViewModel>(viewModel).toEqual({
        status: 'invalid',
        errors: [{message: 'Invalid file extension: expected a .json file.', location: null}],
        warnings: []
      });
    });
  });

  describe('When the file name has a valid extension and the content is a valid save', () => {
    it('should return a valid view model', async () => {
      // Act
      const viewModel = await LoadAndValidateSaveFileController.loadAndValidateSaveFile('Save-A.json', createFakeSaveContent());

      // Assert
      expect<LoadSaveFileViewModel>(viewModel).toEqual({status: 'valid', errors: [], warnings: []});
    });
  });

  describe('When the file name has a valid extension but the content is not a valid save', () => {
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

  describe('When the content is a save in the legacy format', () => {
    it('should return a valid view model with a user message about the format adaptation', async () => {
      // Act
      const viewModel = await LoadAndValidateSaveFileController.loadAndValidateSaveFile('Save-A.json', createLegacyFakeSaveContent());

      // Assert
      expect<LoadSaveFileViewModel>(viewModel).toEqual({
        status: 'valid',
        errors: [],
        warnings: [{
          message: 'This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.',
          location: null
        }]
      });
    });
  });
});
