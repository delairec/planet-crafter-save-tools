import {describe, expect, it, mock} from 'bun:test';
import {LoadTerraformationPageController} from './LoadTerraformationPageController';
import {LoadSaveSectionsRequest} from '../application/requests/LoadSaveSectionsRequest';
import {TerraformationPageViewModel} from '../presentation/viewModels/TerraformationPageViewModel';

type ExecuteLoadTerraformationPage = (request: LoadSaveSectionsRequest) => Promise<void>;

function createController(execute: ExecuteLoadTerraformationPage, presenter: {viewModel: TerraformationPageViewModel}): LoadTerraformationPageController {
  return new LoadTerraformationPageController(() => ({useCase: {execute}, presenter}));
}

describe('LoadTerraformationPageController', () => {
  it('should hand its use case the validated content', async () => {
    // Arrange
    const execute = mock<ExecuteLoadTerraformationPage>(async () => {});
    const controller = createController(execute, {viewModel: {planets: []}});

    // Act
    await controller.loadTerraformationPage('validated content');

    // Assert
    expect(execute).toHaveBeenCalledWith({content: 'validated content'});
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const presenter: {viewModel: TerraformationPageViewModel} = {viewModel: {planets: []}};
    const viewModelAfterRun: TerraformationPageViewModel = {planets: [], unreadableLines: [{message: 'Unreadable line', location: null}]};
    const controller = createController(async () => {
      await Promise.resolve();
      presenter.viewModel = viewModelAfterRun;
    }, presenter);

    // Act
    const viewModel = await controller.loadTerraformationPage('validated content');

    // Assert
    expect(viewModel).toBe(viewModelAfterRun);
  });
});
