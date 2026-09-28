import {describe, expect, it, mock} from 'bun:test';
import {LoadPlayersSectionController} from './LoadPlayersSectionController';
import {LoadSaveSectionsRequest} from '../application/requests/LoadSaveSectionsRequest';
import {PlayersViewModel} from '../presentation/viewModels/PlayersViewModel';

type ExecuteLoadPlayersSection = (request: LoadSaveSectionsRequest) => Promise<void>;

function createController(execute: ExecuteLoadPlayersSection, presenter: {viewModel: PlayersViewModel}): LoadPlayersSectionController {
  return new LoadPlayersSectionController(() => ({useCase: {execute}, presenter}));
}

describe('LoadPlayersSectionController', () => {
  it('should hand its use case the validated content', async () => {
    // Arrange
    const execute = mock<ExecuteLoadPlayersSection>(async () => {});
    const controller = createController(execute, {viewModel: {players: []}});

    // Act
    await controller.loadPlayersSection('validated content');

    // Assert
    expect(execute).toHaveBeenCalledWith({content: 'validated content'});
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const presenter: {viewModel: PlayersViewModel} = {viewModel: {players: []}};
    const viewModelAfterRun: PlayersViewModel = {players: [], unreadableLines: [{message: 'Unreadable line', location: null}]};
    const controller = createController(async () => {
      await Promise.resolve();
      presenter.viewModel = viewModelAfterRun;
    }, presenter);

    // Act
    const viewModel = await controller.loadPlayersSection('validated content');

    // Assert
    expect(viewModel).toBe(viewModelAfterRun);
  });
});
