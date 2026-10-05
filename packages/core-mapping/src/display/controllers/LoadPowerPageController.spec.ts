import {describe, expect, it, mock} from 'bun:test';
import {LoadPowerPageController} from './LoadPowerPageController';
import {LoadSaveSectionsRequest} from '../application/requests/LoadSaveSectionsRequest';
import {PowerPageViewModel} from '../presentation/viewModels/PowerPageViewModel';

type ExecuteLoadPowerPage = (request: LoadSaveSectionsRequest) => Promise<void>;

function createController(execute: ExecuteLoadPowerPage, presenter: {viewModel: PowerPageViewModel}): LoadPowerPageController {
  return new LoadPowerPageController(() => ({useCase: {execute}, presenter}));
}

describe('LoadPowerPageController', () => {
  it('should hand its use case the validated content', async () => {
    // Arrange
    const execute = mock<ExecuteLoadPowerPage>(async () => {});
    const controller = createController(execute, {viewModel: {notifications: [], planets: []}});

    // Act
    await controller.loadPowerPage('validated content');

    // Assert
    expect(execute).toHaveBeenCalledWith({content: 'validated content'});
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const presenter: {viewModel: PowerPageViewModel} = {viewModel: {notifications: [], planets: []}};
    const viewModelAfterRun: PowerPageViewModel = {notifications: [], planets: [], unreadableLines: [{message: 'Unreadable line', location: null}]};
    const controller = createController(async () => {
      await Promise.resolve();
      presenter.viewModel = viewModelAfterRun;
    }, presenter);

    // Act
    const viewModel = await controller.loadPowerPage('validated content');

    // Assert
    expect(viewModel).toBe(viewModelAfterRun);
  });
});
