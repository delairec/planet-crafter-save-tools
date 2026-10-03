import {describe, expect, it, mock} from 'bun:test';
import {LoadPlayersPageController} from './LoadPlayersPageController';
import {LoadSaveSectionsRequest} from '../application/requests/LoadSaveSectionsRequest';
import {PlayersPageViewModel} from '../presentation/viewModels/PlayersPageViewModel';

type ExecuteLoadPlayersPage = (request: LoadSaveSectionsRequest) => Promise<void>;

function createController(execute: ExecuteLoadPlayersPage, presenter: {viewModel: PlayersPageViewModel}): LoadPlayersPageController {
  return new LoadPlayersPageController(() => ({useCase: {execute}, presenter}));
}

describe('LoadPlayersPageController', () => {
  it('should hand its use case the validated content', async () => {
    // Arrange
    const execute = mock<ExecuteLoadPlayersPage>(async () => {});
    const controller = createController(execute, {viewModel: {players: []}});

    // Act
    await controller.loadPlayersPage('validated content');

    // Assert
    expect(execute).toHaveBeenCalledWith({content: 'validated content'});
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const presenter: {viewModel: PlayersPageViewModel} = {viewModel: {players: []}};
    const viewModelAfterRun: PlayersPageViewModel = {players: [], unreadableLines: [{message: 'Unreadable line', location: null}]};
    const controller = createController(async () => {
      await Promise.resolve();
      presenter.viewModel = viewModelAfterRun;
    }, presenter);

    // Act
    const viewModel = await controller.loadPlayersPage('validated content');

    // Assert
    expect(viewModel).toBe(viewModelAfterRun);
  });
});
