import {describe, expect, it, mock} from 'bun:test';
import {LoadAndValidateSaveFileController} from './LoadAndValidateSaveFileController';
import {SaveFileValidationPresenterPort} from '../application/ports/SaveFileValidationPresenterPort';
import {ValidateSaveFileRequest} from '../application/requests/ValidateSaveFileRequest';
import {LoadSaveFilePresenter} from '../presentation/LoadSaveFilePresenter';

type ExecuteValidateSaveFile = (request: ValidateSaveFileRequest, presenter: SaveFileValidationPresenterPort) => Promise<void>;

function createController(execute: ExecuteValidateSaveFile): LoadAndValidateSaveFileController {
  return new LoadAndValidateSaveFileController((presenter) => ({execute: (request) => execute(request, presenter)}));
}

describe('LoadAndValidateSaveFileController', () => {
  it('should hand its use case the file name and the content, with the presenter of the loaded save', async () => {
    // Arrange
    const execute = mock<ExecuteValidateSaveFile>(async () => {});
    const controller = createController(execute);

    // Act
    await controller.loadAndValidateSaveFile('Save-A.json', 'save content');

    // Assert
    expect(execute).toHaveBeenCalledWith({fileName: 'Save-A.json', content: 'save content'}, expect.any(LoadSaveFilePresenter));
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const controller = createController(async (_request, presenter) => {
      await Promise.resolve();
      presenter.presentFileWithoutJsonExtension();
    });

    // Act
    const viewModel = await controller.loadAndValidateSaveFile('Save-A.txt', 'save content');

    // Assert
    expect(viewModel.status).toBe('invalid');
  });
});
