import {describe, expect, it, mock} from 'bun:test';
import {ValidateSaveFileController} from './ValidateSaveFileController';
import {SaveFileValidationPresenterPort} from '../application/ports/SaveFileValidationPresenterPort';
import {ValidateSaveFileRequest} from '../application/requests/ValidateSaveFileRequest';
import {SaveFileValidationPresenter} from '../presentation/SaveFileValidationPresenter';

type ExecuteValidateSaveFile = (request: ValidateSaveFileRequest, presenter: SaveFileValidationPresenterPort) => Promise<void>;

function createController(execute: ExecuteValidateSaveFile): ValidateSaveFileController {
  return new ValidateSaveFileController((presenter) => ({execute: (request) => execute(request, presenter)}));
}

describe('ValidateSaveFileController', () => {
  it('should hand its use case the file name and the content, with the presenter of the validation', async () => {
    // Arrange
    const execute = mock<ExecuteValidateSaveFile>(async () => {});
    const controller = createController(execute);

    // Act
    await controller.validateSaveFile('Save-A.json', 'save content');

    // Assert
    expect(execute).toHaveBeenCalledWith({fileName: 'Save-A.json', content: 'save content'}, expect.any(SaveFileValidationPresenter));
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const controller = createController(async (_request, presenter) => {
      await Promise.resolve();
      presenter.presentFileWithoutJsonExtension();
    });

    // Act
    const viewModel = await controller.validateSaveFile('Save-A.txt', 'save content');

    // Assert
    expect(viewModel.status).toBe('invalid');
  });
});
