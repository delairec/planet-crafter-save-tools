import {describe, expect, it, mock} from 'bun:test';
import {LoadEnergyLevelsSectionController} from './LoadEnergyLevelsSectionController';
import {EnergyLevelsPresenterPort} from '../application/ports/EnergyLevelsPresenterPort';
import {LoadSaveSectionsRequest} from '../application/requests/LoadSaveSectionsRequest';
import {UnreadableLine} from '../domain/save/SaveSectionLocation';
import {EnergyLevelsPresenter} from '../presentation/EnergyLevelsPresenter';

type ExecuteLoadEnergyLevelsSection = (request: LoadSaveSectionsRequest, presenter: EnergyLevelsPresenterPort) => Promise<void>;

function createController(execute: ExecuteLoadEnergyLevelsSection): LoadEnergyLevelsSectionController {
  return new LoadEnergyLevelsSectionController((presenter) => ({execute: (request) => execute(request, presenter)}));
}

describe('LoadEnergyLevelsSectionController', () => {
  it('should hand its use case the validated content, with the presenter of the energy levels', async () => {
    // Arrange
    const execute = mock<ExecuteLoadEnergyLevelsSection>(async () => {});
    const controller = createController(execute);

    // Act
    await controller.loadEnergyLevelsSection('validated content');

    // Assert
    expect(execute).toHaveBeenCalledWith({content: 'validated content'}, expect.any(EnergyLevelsPresenter));
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const unreadableLines: UnreadableLine[] = [{section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{not valid json'}];
    const controller = createController(async (_request, presenter) => {
      await Promise.resolve();
      presenter.displaySaveWithUnreadableLines({unreadableLines});
    });

    // Act
    const viewModel = await controller.loadEnergyLevelsSection('validated content');

    // Assert
    expect(viewModel.unreadableLines).toHaveLength(1);
  });
});
