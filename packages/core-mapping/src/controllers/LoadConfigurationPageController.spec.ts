import {describe, expect, it, mock} from 'bun:test';
import {LoadConfigurationPageController} from './LoadConfigurationPageController';
import {ConfigurationPagePresenterPort} from '../application/ports/ConfigurationPagePresenterPort';
import {LoadSaveSectionsRequest} from '../application/requests/LoadSaveSectionsRequest';
import {UnreadableLine} from '../domain/save/SaveSectionLocation';
import {ConfigurationPagePresenter} from '../presentation/ConfigurationPagePresenter';

type ExecuteLoadConfigurationPage = (request: LoadSaveSectionsRequest, presenter: ConfigurationPagePresenterPort) => Promise<void>;

function createController(execute: ExecuteLoadConfigurationPage): LoadConfigurationPageController {
  return new LoadConfigurationPageController((presenter) => ({execute: (request) => execute(request, presenter)}));
}

describe('LoadConfigurationPageController', () => {
  it('should hand its use case the validated content, with the presenter of the configuration page', async () => {
    // Arrange
    const execute = mock<ExecuteLoadConfigurationPage>(async () => {});
    const controller = createController(execute);

    // Act
    await controller.loadConfigurationPage('validated content');

    // Assert
    expect(execute).toHaveBeenCalledWith({content: 'validated content'}, expect.any(ConfigurationPagePresenter));
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const unreadableLines: UnreadableLine[] = [{section: {name: 'worldObjects', index: 3}, entryIndex: 2, line: '{not valid json'}];
    const controller = createController(async (_request, presenter) => {
      await Promise.resolve();
      presenter.displaySaveWithUnreadableLines({unreadableLines});
    });

    // Act
    const viewModel = await controller.loadConfigurationPage('validated content');

    // Assert
    expect(viewModel.unreadableLines).toHaveLength(1);
  });
});
