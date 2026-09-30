import {describe, expect, it, mock} from 'bun:test';
import {LoadPlayersSectionController} from './LoadPlayersSectionController';
import {PlayersPresenterPort} from '../application/ports/PlayersPresenterPort';
import {LoadSaveSectionsRequest} from '../application/requests/LoadSaveSectionsRequest';
import {UnreadableLine} from '../domain/save/SaveSectionLocation';
import {PlayersPresenter} from '../presentation/PlayersPresenter';

type ExecuteLoadPlayersSection = (request: LoadSaveSectionsRequest, presenter: PlayersPresenterPort) => Promise<void>;

function createController(execute: ExecuteLoadPlayersSection): LoadPlayersSectionController {
  return new LoadPlayersSectionController((presenter) => ({execute: (request) => execute(request, presenter)}));
}

describe('LoadPlayersSectionController', () => {
  it('should hand its use case the validated content, with the presenter of the players', async () => {
    // Arrange
    const execute = mock<ExecuteLoadPlayersSection>(async () => {});
    const controller = createController(execute);

    // Act
    await controller.loadPlayersSection('validated content');

    // Assert
    expect(execute).toHaveBeenCalledWith({content: 'validated content'}, expect.any(PlayersPresenter));
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const unreadableLines: UnreadableLine[] = [{section: {name: 'worldObjects', index: 3}, entryIndex: 2, line: '{not valid json'}];
    const controller = createController(async (_request, presenter) => {
      await Promise.resolve();
      presenter.displaySaveWithUnreadableLines({unreadableLines});
    });

    // Act
    const viewModel = await controller.loadPlayersSection('validated content');

    // Assert
    expect(viewModel.unreadableLines).toHaveLength(1);
  });
});
