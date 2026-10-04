import {describe, expect, it, mock} from 'bun:test';
import {LoadPlanetPageController} from './LoadPlanetPageController';
import {LoadPlanetPageRequest} from '../application/requests/LoadPlanetPageRequest';
import {PlanetPageViewModel} from '../presentation/viewModels/PlanetPageViewModel';

type ExecuteLoadPlanetPage = (request: LoadPlanetPageRequest) => Promise<void>;

const VIEW_MODEL_BEFORE_RUN: PlanetPageViewModel = {planetName: '', power: {notifications: []}, terraformation: {}};

function createController(execute: ExecuteLoadPlanetPage, presenter: {viewModel: PlanetPageViewModel}): LoadPlanetPageController {
  return new LoadPlanetPageController(() => ({useCase: {execute}, presenter}));
}

describe('LoadPlanetPageController', () => {
  it('should hand its use case the validated content and the planet identifier', async () => {
    // Arrange
    const execute = mock<ExecuteLoadPlanetPage>(async () => {});
    const controller = createController(execute, {viewModel: VIEW_MODEL_BEFORE_RUN});

    // Act
    await controller.loadPlanetPage({content: 'validated content', planetIdentifier: 'Toxicity'});

    // Assert
    expect(execute).toHaveBeenCalledWith({content: 'validated content', planetIdentifier: 'Toxicity'});
  });

  it('should return the view model its presenter holds once the use case has run', async () => {
    // Arrange
    const presenter: {viewModel: PlanetPageViewModel} = {viewModel: VIEW_MODEL_BEFORE_RUN};
    const viewModelAfterRun: PlanetPageViewModel = {planetName: 'Toxicity', power: {notifications: [], absentZone: 'No machine placed'}, terraformation: {}};
    const controller = createController(async () => {
      await Promise.resolve();
      presenter.viewModel = viewModelAfterRun;
    }, presenter);

    // Act
    const viewModel = await controller.loadPlanetPage({content: 'validated content', planetIdentifier: 'Toxicity'});

    // Assert
    expect(viewModel).toBe(viewModelAfterRun);
  });
});
