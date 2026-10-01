import {describe, expect, it, mock} from 'bun:test';
import {MergeSaveFilesController} from './MergeSaveFilesController';
import {MergeSaveFilesRequest} from '../application/requests/MergeSaveFilesRequest';
import {MergeResultViewModel} from '../presentation/viewModels/MergeResultViewModel';

type ExecuteMergeSaveFiles = (request: MergeSaveFilesRequest) => Promise<void>;

function mergeResultViewModel(status: MergeResultViewModel['status']): MergeResultViewModel {
  return {
    status, fileName: '', content: '', mergeFailureMessage: '', mergeErrors: [], mergeWarnings: [], legacyFormatCouldBeKept: false,
    saveAErrors: [], saveBErrors: [], saveAWarnings: [], saveBWarnings: []
  };
}

function createController(execute: ExecuteMergeSaveFiles, presenter: {viewModel: MergeResultViewModel}): MergeSaveFilesController {
  return new MergeSaveFilesController(() => ({useCase: {execute}, presenter}));
}

describe('MergeSaveFilesController', () => {
  it('should hand its use case the request it received', async () => {
    // Arrange
    const request: MergeSaveFilesRequest = {fileNameA: 'Standard-1.json', contentA: 'save A', fileNameB: 'Standard-2.json', contentB: 'save B', preferLegacyFormat: true};
    const execute = mock<ExecuteMergeSaveFiles>(async () => {});
    const controller = createController(execute, {viewModel: mergeResultViewModel('idle')});

    // Act
    await controller.mergeSaveFiles(request);

    // Assert
    expect(execute).toHaveBeenCalledWith(request);
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const request: MergeSaveFilesRequest = {fileNameA: 'Standard-1.json', contentA: 'save A', fileNameB: 'Standard-2.json', contentB: 'save B'};
    const presenter: {viewModel: MergeResultViewModel} = {viewModel: mergeResultViewModel('idle')};
    const viewModelAfterRun: MergeResultViewModel = mergeResultViewModel('mergeFailed');
    const controller = createController(async () => {
      await Promise.resolve();
      presenter.viewModel = viewModelAfterRun;
    }, presenter);

    // Act
    const viewModel = await controller.mergeSaveFiles(request);

    // Assert
    expect(viewModel).toBe(viewModelAfterRun);
  });
});
