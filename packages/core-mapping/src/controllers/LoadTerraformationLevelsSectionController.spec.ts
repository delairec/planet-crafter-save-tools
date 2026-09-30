import {describe, expect, it, mock} from 'bun:test';
import {LoadTerraformationLevelsSectionController} from './LoadTerraformationLevelsSectionController';
import {TerraformationLevelsPresenterPort} from '../application/ports/TerraformationLevelsPresenterPort';
import {LoadSaveSectionsRequest} from '../application/requests/LoadSaveSectionsRequest';
import {UnreadableLine} from '../domain/save/SaveSectionLocation';
import {TerraformationLevelsPresenter} from '../presentation/TerraformationLevelsPresenter';

type ExecuteLoadTerraformationLevelsSection = (request: LoadSaveSectionsRequest, presenter: TerraformationLevelsPresenterPort) => Promise<void>;

function createController(execute: ExecuteLoadTerraformationLevelsSection): LoadTerraformationLevelsSectionController {
  return new LoadTerraformationLevelsSectionController((presenter) => ({execute: (request) => execute(request, presenter)}));
}

describe('LoadTerraformationLevelsSectionController', () => {
  it('should hand its use case the validated content, with the presenter of the terraformation levels', async () => {
    // Arrange
    const execute = mock<ExecuteLoadTerraformationLevelsSection>(async () => {});
    const controller = createController(execute);

    // Act
    await controller.loadTerraformationLevelsSection('validated content');

    // Assert
    expect(execute).toHaveBeenCalledWith({content: 'validated content'}, expect.any(TerraformationLevelsPresenter));
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const unreadableLines: UnreadableLine[] = [{section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{not valid json'}];
    const controller = createController(async (_request, presenter) => {
      await Promise.resolve();
      presenter.displaySaveWithUnreadableLines({unreadableLines});
    });

    // Act
    const viewModel = await controller.loadTerraformationLevelsSection('validated content');

    // Assert
    expect(viewModel.unreadableLines).toHaveLength(1);
  });
});
