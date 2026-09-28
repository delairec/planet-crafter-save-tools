import {describe, expect, it, mock} from 'bun:test';
import {LoadAndValidateSaveFileController} from './LoadAndValidateSaveFileController';
import {ValidateSaveFileRequest} from '../application/requests/ValidateSaveFileRequest';
import {LoadSaveFileViewModel} from '../presentation/viewModels/LoadSaveFileViewModel';

type ExecuteLoadAndValidateSaveFile = (request: ValidateSaveFileRequest) => Promise<void>;

function createController(execute: ExecuteLoadAndValidateSaveFile, presenter: {viewModel: LoadSaveFileViewModel}): LoadAndValidateSaveFileController {
  return new LoadAndValidateSaveFileController(() => ({useCase: {execute}, presenter}));
}

describe('LoadAndValidateSaveFileController', () => {
  it('should hand its use case the file name and the content', async () => {
    // Arrange
    const execute = mock<ExecuteLoadAndValidateSaveFile>(async () => {});
    const controller = createController(execute, {viewModel: {status: 'idle', errors: [], warnings: []}});

    // Act
    await controller.loadAndValidateSaveFile('Save-A.json', 'save content');

    // Assert
    expect(execute).toHaveBeenCalledWith({fileName: 'Save-A.json', content: 'save content'});
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const presenter: {viewModel: LoadSaveFileViewModel} = {viewModel: {status: 'idle', errors: [], warnings: []}};
    const viewModelAfterRun: LoadSaveFileViewModel = {status: 'invalid', errors: [], warnings: []};
    const controller = createController(async () => {
      await Promise.resolve();
      presenter.viewModel = viewModelAfterRun;
    }, presenter);

    // Act
    const viewModel = await controller.loadAndValidateSaveFile('Save-A.json', 'save content');

    // Assert
    expect(viewModel).toBe(viewModelAfterRun);
  });
});
