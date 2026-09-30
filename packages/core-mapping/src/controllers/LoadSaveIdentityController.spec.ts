import {describe, expect, it, mock} from 'bun:test';
import {LoadSaveIdentityController} from './LoadSaveIdentityController';
import {LoadSaveIdentityRequest} from '../application/requests/LoadSaveIdentityRequest';
import {SaveIdentityViewModel} from '../presentation/viewModels/SaveIdentityViewModel';

type ExecuteLoadSaveIdentity = (request: LoadSaveIdentityRequest) => Promise<void>;

function createController(execute: ExecuteLoadSaveIdentity, presenter: {viewModel: SaveIdentityViewModel}): LoadSaveIdentityController {
  return new LoadSaveIdentityController(() => ({useCase: {execute}, presenter}));
}

describe('LoadSaveIdentityController', () => {
  it('should hand its use case the validated content and the file name', async () => {
    // Arrange
    const execute = mock<ExecuteLoadSaveIdentity>(async () => {});
    const controller = createController(execute, {viewModel: {fileName: 'Standard-1.json'}});

    // Act
    await controller.loadSaveIdentity('validated content', 'Standard-1.json');

    // Assert
    expect(execute).toHaveBeenCalledWith({content: 'validated content', fileName: 'Standard-1.json'});
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const presenter: {viewModel: SaveIdentityViewModel} = {viewModel: {fileName: 'Standard-1.json'}};
    const viewModelAfterRun: SaveIdentityViewModel = {fileName: 'Standard-1.json', displayName: 'Merged Save'};
    const controller = createController(async () => {
      await Promise.resolve();
      presenter.viewModel = viewModelAfterRun;
    }, presenter);

    // Act
    const viewModel = await controller.loadSaveIdentity('validated content', 'Standard-1.json');

    // Assert
    expect(viewModel).toBe(viewModelAfterRun);
  });
});
