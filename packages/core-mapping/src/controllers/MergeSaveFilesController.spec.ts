import {describe, expect, it, mock} from 'bun:test';
import {MergeSaveFilesController} from './MergeSaveFilesController';
import {MergeResultPresenterPort} from '../application/ports/MergeResultPresenterPort';
import {MergeSaveFilesRequest} from '../application/requests/MergeSaveFilesRequest';
import {MergeResultPresenter} from '../presentation/MergeResultPresenter';

type ExecuteMergeSaveFiles = (request: MergeSaveFilesRequest, presenter: MergeResultPresenterPort) => Promise<void>;

function createController(execute: ExecuteMergeSaveFiles): MergeSaveFilesController {
  return new MergeSaveFilesController((presenter) => ({execute: (request) => execute(request, presenter)}));
}

describe('MergeSaveFilesController', () => {
  it('should hand its use case the request it received, with the presenter of the merge result', async () => {
    // Arrange
    const execute = mock<ExecuteMergeSaveFiles>(async () => {});
    const controller = createController(execute);

    // Act
    await controller.mergeSaveFiles({fileNameA: 'Standard-1.json', contentA: 'save A', fileNameB: 'Standard-2.json', contentB: 'save B', preferLegacyFormat: true});

    // Assert
    expect(execute).toHaveBeenCalledWith(
      {fileNameA: 'Standard-1.json', contentA: 'save A', fileNameB: 'Standard-2.json', contentB: 'save B', preferLegacyFormat: true},
      expect.any(MergeResultPresenter)
    );
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const controller = createController(async (_request, presenter) => {
      await Promise.resolve();
      presenter.presentMergedSaveUnusable();
    });

    // Act
    const viewModel = await controller.mergeSaveFiles({fileNameA: 'Standard-1.json', contentA: 'save A', fileNameB: 'Standard-2.json', contentB: 'save B'});

    // Assert
    expect(viewModel.status).toBe('mergeFailed');
  });
});
