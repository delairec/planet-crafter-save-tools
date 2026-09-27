import {describe, expect, it} from 'bun:test';
import {createFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {LoadSaveIdentityController} from './LoadSaveIdentityController';
import {SaveIdentityViewModel} from '../presentation/viewModels/SaveIdentityViewModel';

describe('LoadSaveIdentityController', () => {
  it('should present the identity of the parsed save under the file name of the request', async () => {
    // Arrange
    const validatedContent = createFakeSaveContent();

    // Act
    const viewModel = await LoadSaveIdentityController.loadSaveIdentity(validatedContent, 'Standard-1.json');

    // Assert
    expect(viewModel).toEqual<SaveIdentityViewModel>({
      fileName: 'Standard-1.json',
      displayName: 'Merged Save',
      mode: 'Standard',
      gameRelease: 'Game release 2.004'
    });
  });
});
