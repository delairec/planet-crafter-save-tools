import {describe, expect, it, mock} from 'bun:test';
import {LoadOverviewPageController} from './LoadOverviewPageController';
import {LoadOverviewPageRequest} from '../application/requests/LoadOverviewPageRequest';
import {OverviewPageViewModel} from '../presentation/viewModels/OverviewPageViewModel';

type ExecuteLoadOverviewPage = (request: LoadOverviewPageRequest) => Promise<void>;

const INITIAL_VIEW_MODEL: OverviewPageViewModel = {identity: {title: '', hint: ''}, notifications: [], tiles: {}, planets: {title: 'Planets', hint: '', cards: []}};

function createController(execute: ExecuteLoadOverviewPage, presenter: {viewModel: OverviewPageViewModel}): LoadOverviewPageController {
  return new LoadOverviewPageController(() => ({useCase: {execute}, presenter}));
}

describe('LoadOverviewPageController', () => {
  it('should hand its use case the validated content, the file name and the file size', async () => {
    // Arrange
    const execute = mock<ExecuteLoadOverviewPage>(async () => {});
    const controller = createController(execute, {viewModel: INITIAL_VIEW_MODEL});

    // Act
    await controller.loadOverviewPage({content: 'validated content', fileName: 'Standard-1.json', fileSize: 2_540});

    // Assert
    expect(execute).toHaveBeenCalledWith({content: 'validated content', fileName: 'Standard-1.json', fileSize: 2_540});
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const presenter: {viewModel: OverviewPageViewModel} = {viewModel: INITIAL_VIEW_MODEL};
    const viewModelAfterRun: OverviewPageViewModel = {identity: {title: 'Merged Save', hint: 'Standard'}, notifications: [], tiles: {}, planets: {title: 'Planets', hint: '0 planets', cards: []}};
    const controller = createController(async () => {
      await Promise.resolve();
      presenter.viewModel = viewModelAfterRun;
    }, presenter);

    // Act
    const viewModel = await controller.loadOverviewPage({content: 'validated content', fileName: 'Standard-1.json', fileSize: 2_540});

    // Assert
    expect(viewModel).toBe(viewModelAfterRun);
  });
});
