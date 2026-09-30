import {describe, expect, it, mock} from 'bun:test';
import {LoadTerraformationLevelsSectionController} from './LoadTerraformationLevelsSectionController';
import {LoadSaveSectionsRequest} from '../application/requests/LoadSaveSectionsRequest';
import {TerraformationLevelsViewModel} from '../presentation/viewModels/TerraformationLevelsViewModel';

type ExecuteLoadTerraformationLevelsSection = (request: LoadSaveSectionsRequest) => Promise<void>;

function createController(execute: ExecuteLoadTerraformationLevelsSection, presenter: {viewModel: TerraformationLevelsViewModel}): LoadTerraformationLevelsSectionController {
  return new LoadTerraformationLevelsSectionController(() => ({useCase: {execute}, presenter}));
}

describe('LoadTerraformationLevelsSectionController', () => {
  it('should hand its use case the validated content', async () => {
    // Arrange
    const execute = mock<ExecuteLoadTerraformationLevelsSection>(async () => {});
    const controller = createController(execute, {viewModel: {planets: []}});

    // Act
    await controller.loadTerraformationLevelsSection('validated content');

    // Assert
    expect(execute).toHaveBeenCalledWith({content: 'validated content'});
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const presenter: {viewModel: TerraformationLevelsViewModel} = {viewModel: {planets: []}};
    const viewModelAfterRun: TerraformationLevelsViewModel = {planets: [], unreadableLines: [{message: 'Unreadable line', location: null}]};
    const controller = createController(async () => {
      await Promise.resolve();
      presenter.viewModel = viewModelAfterRun;
    }, presenter);

    // Act
    const viewModel = await controller.loadTerraformationLevelsSection('validated content');

    // Assert
    expect(viewModel).toBe(viewModelAfterRun);
  });
});
