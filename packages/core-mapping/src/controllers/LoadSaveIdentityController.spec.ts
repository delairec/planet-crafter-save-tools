import {describe, expect, it, mock} from 'bun:test';
import {LoadSaveIdentityController} from './LoadSaveIdentityController';
import {SaveIdentityPresenterPort} from '../application/ports/SaveIdentityPresenterPort';
import {LoadSaveIdentityRequest} from '../application/requests/LoadSaveIdentityRequest';
import {SaveIdentityPresenter} from '../presentation/SaveIdentityPresenter';
import {SaveIdentityViewModel} from '../presentation/viewModels/SaveIdentityViewModel';

type ExecuteLoadSaveIdentity = (request: LoadSaveIdentityRequest, presenter: SaveIdentityPresenterPort) => Promise<void>;

function createController(execute: ExecuteLoadSaveIdentity): LoadSaveIdentityController {
  return new LoadSaveIdentityController((presenter) => ({execute: (request) => execute(request, presenter)}));
}

describe('LoadSaveIdentityController', () => {
  it('should hand its use case the validated content and the file name, with the presenter of the save identity', async () => {
    // Arrange
    const execute = mock<ExecuteLoadSaveIdentity>(async () => {});
    const controller = createController(execute);

    // Act
    await controller.loadSaveIdentity('validated content', 'Standard-1.json');

    // Assert
    expect(execute).toHaveBeenCalledWith({content: 'validated content', fileName: 'Standard-1.json'}, expect.any(SaveIdentityPresenter));
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const controller = createController(async (_request, presenter) => {
      await Promise.resolve();
      presenter.displaySaveIdentity({fileName: 'Standard-1.json', displayName: 'Merged Save', mode: 'Standard', gameRelease: '2.004'});
    });

    // Act
    const viewModel = await controller.loadSaveIdentity('validated content', 'Standard-1.json');

    // Assert
    expect(viewModel).toEqual<SaveIdentityViewModel>({
      fileName: 'Standard-1.json',
      displayName: 'Merged Save',
      mode: 'Standard',
      gameRelease: 'Game release 2.004'
    });
  });
});
