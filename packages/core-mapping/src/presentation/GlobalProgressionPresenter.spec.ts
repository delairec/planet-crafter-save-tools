import {describe, expect, it} from 'bun:test';
import {GlobalProgressionPresenter} from './GlobalProgressionPresenter';
import {GlobalProgressionViewModel} from './viewModels/GlobalProgressionViewModel';

describe('GlobalProgressionPresenter', () => {
  it('should initialize with default view model', () => {
    // Act
    const presenter = new GlobalProgressionPresenter();

    // Assert
    expect(presenter.viewModel).toEqual<GlobalProgressionViewModel>({
      statistics: {
        columns: [
          {
            header: 'All time Terra Tokens',
            values: []
          },
          {
            header: 'Total crafted objects',
            values: []
          },
        ]
      },
    });
  });

  it('should present the global progression without statistics as no crafted object', () => {
    // Arrange
    const presenter = new GlobalProgressionPresenter();
    const globalProgression = {allTimeTerraTokens: 200_345};

    // Act
    presenter.displayGlobalProgressionWithoutStatistics(globalProgression);

    // Assert
    expect(presenter.viewModel).toEqual<GlobalProgressionViewModel>({
      statistics: {
        columns: [
          {
            header: 'All time Terra Tokens',
            values: ['200,345 =tt=']
          },
          {
            header: 'Total crafted objects',
            values: ['0']
          }
        ]
      },
    });
  });

  it('should present all GlobalProgression', () => {
    // Arrange
    const presenter = new GlobalProgressionPresenter();
    const globalProgression = {
      allTimeTerraTokens: 200_345
    };
    const statistics = {totalCraftedObjects:10};

    // Act
    presenter.displayGlobalProgression(globalProgression, statistics);

    // Assert
    expect(presenter.viewModel).toEqual<GlobalProgressionViewModel>({
      statistics: {
        columns: [
          {
            header: 'All time Terra Tokens',
            values: ['200,345 =tt=']
          },
          {
            header: 'Total crafted objects',
            values: ['10']
          }
        ]
      },
    });
  });

  it('should present the drone logistics as paused when the global metadata carries logisticsPaused true', () => {
    // Arrange
    const presenter = new GlobalProgressionPresenter();
    const globalProgression = {allTimeTerraTokens: 200_345, logisticsPaused: true};
    const statistics = {totalCraftedObjects: 10};

    // Act
    presenter.displayGlobalProgression(globalProgression, statistics);

    // Assert
    expect(presenter.viewModel).toEqual<GlobalProgressionViewModel>({
      statistics: {
        columns: [
          {
            header: 'All time Terra Tokens',
            values: ['200,345 =tt=']
          },
          {
            header: 'Total crafted objects',
            values: ['10']
          },
          {
            header: 'Drone logistics',
            values: ['Paused']
          }
        ]
      },
    });
  });

  it('should present the drone logistics as running when the global metadata carries logisticsPaused false', () => {
    // Arrange
    const presenter = new GlobalProgressionPresenter();
    const globalProgression = {allTimeTerraTokens: 200_345, logisticsPaused: false};
    const statistics = {totalCraftedObjects: 10};

    // Act
    presenter.displayGlobalProgression(globalProgression, statistics);

    // Assert
    expect(presenter.viewModel).toEqual<GlobalProgressionViewModel>({
      statistics: {
        columns: [
          {
            header: 'All time Terra Tokens',
            values: ['200,345 =tt=']
          },
          {
            header: 'Total crafted objects',
            values: ['10']
          },
          {
            header: 'Drone logistics',
            values: ['Running']
          }
        ]
      },
    });
  });
});

