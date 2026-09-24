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

  describe('When the statistics are missing', () => {
    it('should present the global progression as no crafted object', () => {
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
  });

  describe('When the global metadata carries no logisticsPaused', () => {
    it('should present all GlobalProgression', () => {
      // Arrange
      const presenter = new GlobalProgressionPresenter();
      const globalProgression = {allTimeTerraTokens: 200_345};
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
            }
          ]
        },
      });
    });
  });

  describe('When the global metadata carries logisticsPaused', () => {
    it.each([
      {logisticsPaused: true, logisticsState: 'Paused'},
      {logisticsPaused: false, logisticsState: 'Running'},
    ])('should present the drone logistics as $logisticsState', ({logisticsPaused, logisticsState}) => {
      // Arrange
      const presenter = new GlobalProgressionPresenter();
      const globalProgression = {allTimeTerraTokens: 200_345, logisticsPaused};
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
              values: [logisticsState]
            }
          ]
        },
      });
    });
  });
});
