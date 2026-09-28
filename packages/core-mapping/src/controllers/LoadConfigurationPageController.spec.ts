import {describe, expect, it, mock} from 'bun:test';
import {LoadConfigurationPageController} from './LoadConfigurationPageController';
import {LoadSaveSectionsRequest} from '../application/requests/LoadSaveSectionsRequest';
import {ConfigurationPageViewModel} from '../presentation/viewModels/ConfigurationPageViewModel';

type ExecuteLoadConfigurationPage = (request: LoadSaveSectionsRequest) => Promise<void>;

function createController(execute: ExecuteLoadConfigurationPage, presenter: {viewModel: ConfigurationPageViewModel}): LoadConfigurationPageController {
  return new LoadConfigurationPageController(() => ({useCase: {execute}, presenter}));
}

describe('LoadConfigurationPageController', () => {
  it('should hand its use case the validated content', async () => {
    // Arrange
    const execute = mock<ExecuteLoadConfigurationPage>(async () => {});
    const controller = createController(execute, {viewModel: {progression: {fields: []}}});

    // Act
    await controller.loadConfigurationPage('validated content');

    // Assert
    expect(execute).toHaveBeenCalledWith({content: 'validated content'});
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const presenter: {viewModel: ConfigurationPageViewModel} = {viewModel: {progression: {fields: []}}};
    const viewModelAfterRun: ConfigurationPageViewModel = {progression: {fields: []}, unreadableLines: [{message: 'Unreadable line', location: null}]};
    const controller = createController(async () => {
      await Promise.resolve();
      presenter.viewModel = viewModelAfterRun;
    }, presenter);

    // Act
    const viewModel = await controller.loadConfigurationPage('validated content');

    // Assert
    expect(viewModel).toBe(viewModelAfterRun);
  });
});
