import {describe, expect, it, mock} from 'bun:test';
import {ValidateSaveFileController} from './ValidateSaveFileController';
import {ValidateSaveFileRequest} from '../application/requests/ValidateSaveFileRequest';
import {SaveFileValidationViewModel} from '../presentation/viewModels/SaveFileValidationViewModel';

type ExecuteValidateSaveFile = (request: ValidateSaveFileRequest) => Promise<void>;

function createController(execute: ExecuteValidateSaveFile, presenter: {viewModel: SaveFileValidationViewModel}): ValidateSaveFileController {
  return new ValidateSaveFileController(() => ({useCase: {execute}, presenter}));
}

describe('ValidateSaveFileController', () => {
  it('should hand its use case the file name and the content', async () => {
    // Arrange
    const execute = mock<ExecuteValidateSaveFile>(async () => {});
    const controller = createController(execute, {viewModel: {status: 'idle', errors: [], warnings: []}});

    // Act
    await controller.validateSaveFile('Save-A.json', 'save content');

    // Assert
    expect(execute).toHaveBeenCalledWith({fileName: 'Save-A.json', content: 'save content'});
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const presenter: {viewModel: SaveFileValidationViewModel} = {viewModel: {status: 'idle', errors: [], warnings: []}};
    const viewModelAfterRun: SaveFileValidationViewModel = {status: 'invalid', errors: [], warnings: []};
    const controller = createController(async () => {
      await Promise.resolve();
      presenter.viewModel = viewModelAfterRun;
    }, presenter);

    // Act
    const viewModel = await controller.validateSaveFile('Save-A.json', 'save content');

    // Assert
    expect(viewModel).toBe(viewModelAfterRun);
  });
});
