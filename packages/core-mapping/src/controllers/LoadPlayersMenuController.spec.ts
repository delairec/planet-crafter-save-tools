import {describe, expect, it, mock} from 'bun:test';
import {LoadPlayersMenuController} from './LoadPlayersMenuController';
import {PlayersMenuPresenterPort} from '../application/ports/PlayersMenuPresenterPort';
import {LoadSaveSectionsRequest} from '../application/requests/LoadSaveSectionsRequest';
import {UnreadableLine} from '../application/ports/SaveSectionLocation';
import {PlayersMenuPresenter} from '../presentation/PlayersMenuPresenter';
import {PlayersMenuViewModel} from '../presentation/viewModels/PlayersMenuViewModel';

type ExecuteLoadPlayersMenu = (request: LoadSaveSectionsRequest, presenter: PlayersMenuPresenterPort) => Promise<void>;

function createController(execute: ExecuteLoadPlayersMenu): LoadPlayersMenuController {
  return new LoadPlayersMenuController((presenter) => ({execute: (request) => execute(request, presenter)}));
}

describe('LoadPlayersMenuController', () => {
  it('should hand its use case the validated content, with the presenter of the players menu', async () => {
    // Arrange
    const execute = mock<ExecuteLoadPlayersMenu>(async () => {});
    const controller = createController(execute);

    // Act
    await controller.loadPlayersMenu('validated content');

    // Assert
    expect(execute).toHaveBeenCalledWith({content: 'validated content'}, expect.any(PlayersMenuPresenter));
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const unreadableLines: UnreadableLine[] = [{section: {name: 'worldObjects', index: 3}, entryIndex: 2, line: '{not valid json'}];
    const controller = createController(async (_request, presenter) => {
      await Promise.resolve();
      presenter.displaySaveWithUnreadableLines(unreadableLines);
    });

    // Act
    const viewModel = await controller.loadPlayersMenu('validated content');

    // Assert
    expect(viewModel).toEqual<PlayersMenuViewModel>({
      players: [],
      unreadableLines: [{message: 'Invalid JSON: {not valid json', location: 'World objects (section 3), entry 2'}]
    });
  });
});
