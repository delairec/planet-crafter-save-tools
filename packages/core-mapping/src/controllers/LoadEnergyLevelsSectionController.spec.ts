import {describe, expect, it, mock} from 'bun:test';
import {LoadEnergyLevelsSectionController} from './LoadEnergyLevelsSectionController';
import {LoadSaveSectionsRequest} from '../application/requests/LoadSaveSectionsRequest';
import {EnergyLevelsViewModel} from '../presentation/viewModels/EnergyLevelsViewModel';

type ExecuteLoadEnergyLevelsSection = (request: LoadSaveSectionsRequest) => Promise<void>;

function createController(execute: ExecuteLoadEnergyLevelsSection, presenter: {viewModel: EnergyLevelsViewModel}): LoadEnergyLevelsSectionController {
  return new LoadEnergyLevelsSectionController(() => ({useCase: {execute}, presenter}));
}

describe('LoadEnergyLevelsSectionController', () => {
  it('should hand its use case the validated content', async () => {
    // Arrange
    const execute = mock<ExecuteLoadEnergyLevelsSection>(async () => {});
    const controller = createController(execute, {viewModel: {notifications: [], planets: []}});

    // Act
    await controller.loadEnergyLevelsSection('validated content');

    // Assert
    expect(execute).toHaveBeenCalledWith({content: 'validated content'});
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const presenter: {viewModel: EnergyLevelsViewModel} = {viewModel: {notifications: [], planets: []}};
    const viewModelAfterRun: EnergyLevelsViewModel = {notifications: [], planets: [], unreadableLines: [{message: 'Unreadable line', location: null}]};
    const controller = createController(async () => {
      await Promise.resolve();
      presenter.viewModel = viewModelAfterRun;
    }, presenter);

    // Act
    const viewModel = await controller.loadEnergyLevelsSection('validated content');

    // Assert
    expect(viewModel).toBe(viewModelAfterRun);
  });
});
