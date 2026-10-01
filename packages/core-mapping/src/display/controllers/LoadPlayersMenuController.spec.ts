import {describe, expect, it, mock} from 'bun:test';
import {LoadPlayersMenuController} from './LoadPlayersMenuController';
import {LoadSaveSectionsRequest} from '../application/requests/LoadSaveSectionsRequest';
import {PlayersMenuViewModel} from '../presentation/viewModels/PlayersMenuViewModel';

type ExecuteLoadPlayersMenu = (request: LoadSaveSectionsRequest) => Promise<void>;

function createController(execute: ExecuteLoadPlayersMenu, presenter: {viewModel: PlayersMenuViewModel}): LoadPlayersMenuController {
  return new LoadPlayersMenuController(() => ({useCase: {execute}, presenter}));
}

describe('LoadPlayersMenuController', () => {
  it('should hand its use case the validated content', async () => {
    // Arrange
    const execute = mock<ExecuteLoadPlayersMenu>(async () => {});
    const controller = createController(execute, {viewModel: {players: []}});

    // Act
    await controller.loadPlayersMenu('validated content');

    // Assert
    expect(execute).toHaveBeenCalledWith({content: 'validated content'});
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const presenter: {viewModel: PlayersMenuViewModel} = {viewModel: {players: []}};
    const viewModelAfterRun: PlayersMenuViewModel = {players: [], unreadableLines: [{message: 'Unreadable line', location: null}]};
    const controller = createController(async () => {
      await Promise.resolve();
      presenter.viewModel = viewModelAfterRun;
    }, presenter);

    // Act
    const viewModel = await controller.loadPlayersMenu('validated content');

    // Assert
    expect(viewModel).toBe(viewModelAfterRun);
  });
});
