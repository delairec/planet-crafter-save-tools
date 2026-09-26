import {describe, expect, it} from 'bun:test';
import {EnergyLevelsPresenter} from "./EnergyLevelsPresenter";
import {EnergyLevelsViewModel} from "./viewModels/EnergyLevelsViewModel";
import {NotificationViewModel} from "./viewModels/NotificationViewModel";
import {CURRENT_FORMAT_RELEASE} from "shared-save-processing/gameReleases.js";

const nbsp = '\u00A0';

describe('EnergyLevelsPresenter', () => {
  it('should initialize with default view model', () => {
    // Act
    const presenter = new EnergyLevelsPresenter();

    // Assert
    expect(presenter.viewModel).toEqual<EnergyLevelsViewModel>({
      notifications: [{severity: 'limitation', message: 'Submerged machines may distort the computed available energy.'}],
      planets: []
    });
  });

  it('should present energy levels for a planet', () => {
    // Arrange
    const presenter = new EnergyLevelsPresenter();

    // Act
    presenter.displayEnergyLevels({
      gameRelease: CURRENT_FORMAT_RELEASE,
      powerConsumptionModifier: 1,
      planets: [{
        planetId: 1,
        production: 80_000,
        consumption: 0,
        available: 80_000,
        productionBreakdown: [],
        consumptionBreakdown: [],
        optimizers: []
      }]
    });

    // Assert
    expect(presenter.viewModel).toEqual<EnergyLevelsViewModel>(
      {
        notifications: [{severity: 'limitation', message: 'Submerged machines may distort the computed available energy.'}],
        planets: [{
          planetId: 'Planet 1',
          energyLevels: {
            columns: [
              {
                header: 'Production',
                values: ['80,000' + `${nbsp}kW`]
              },
              {
                header: 'Consumption',
                values: ['0' + `${nbsp}kW`]
              },
              {
                header: 'Available',
                values: ['80,000' + `${nbsp}kW`]
              }
            ]
          },
          productionBreakdown: [],
          consumptionBreakdown: [],
          optimizers: []
        }]
      }
    );
  });

  it('should present multiple planets independently', () => {
    // Arrange
    const presenter = new EnergyLevelsPresenter();

    // Act
    presenter.displayEnergyLevels({
      gameRelease: '2.102',
      powerConsumptionModifier: 1,
      planets: [
        {
          planetId: 1,
          production: 100,
          consumption: 0,
          available: 100,
          productionBreakdown: [],
          consumptionBreakdown: [],
          optimizers: []
        },
        {
          planetId: 2,
          production: 200,
          consumption: 0,
          available: 200,
          productionBreakdown: [],
          consumptionBreakdown: [],
          optimizers: []
        }
      ]
    });

    // Assert
    expect(presenter.viewModel.planets.map((planet) => planet.planetId)).toEqual(['Planet 1', 'Planet 2']);
  });

  it('should present the submerged machines limitation once for the whole section, whatever the number of planets', () => {
    // Arrange
    const presenter = new EnergyLevelsPresenter();

    // Act
    presenter.displayEnergyLevels({
      gameRelease: '2.102',
      powerConsumptionModifier: 1,
      planets: [
        {
          planetId: 1,
          production: 100,
          consumption: 0,
          available: 100,
          productionBreakdown: [],
          consumptionBreakdown: [],
          optimizers: []
        },
        {
          planetId: 2,
          production: 200,
          consumption: 0,
          available: 200,
          productionBreakdown: [],
          consumptionBreakdown: [],
          optimizers: []
        }
      ]
    });

    // Assert
    expect(presenter.viewModel.notifications).toEqual<NotificationViewModel[]>([
      {severity: 'limitation', message: 'Submerged machines may distort the computed available energy.'}
    ]);
  });

  describe('When it presents the values of a legacy game release', () => {
    it('should warn, under the submerged machines limitation, that the values are those of that game release', () => {
      // Arrange
      const presenter = new EnergyLevelsPresenter();

      // Act
      presenter.displayEnergyLevels({gameRelease: '2.004', powerConsumptionModifier: 1, planets: []});

      // Assert
      expect(presenter.viewModel.notifications).toEqual<NotificationViewModel[]>([
        {severity: 'limitation', message: 'Submerged machines may distort the computed available energy.'},
        {severity: 'warning', message: 'Values of game release 2.004'}
      ]);
    });
  });

  describe('When it presents the values of the current game release', () => {
    it('should name no game release', () => {
      // Arrange
      const presenter = new EnergyLevelsPresenter();

      // Act
      presenter.displayEnergyLevels({gameRelease: CURRENT_FORMAT_RELEASE, powerConsumptionModifier: 1, planets: []});

      // Assert
      expect(presenter.viewModel.notifications).toEqual<NotificationViewModel[]>([
        {severity: 'limitation', message: 'Submerged machines may distort the computed available energy.'}
      ]);
    });
  });

  describe('When the save multiplies the consumption by a power consumption modifier other than 1', () => {
    it('should name that modifier in a limitation, under the submerged machines one', () => {
      // Arrange
      const presenter = new EnergyLevelsPresenter();

      // Act
      presenter.displayEnergyLevels({gameRelease: CURRENT_FORMAT_RELEASE, powerConsumptionModifier: 1.5, planets: []});

      // Assert
      expect(presenter.viewModel.notifications).toEqual<NotificationViewModel[]>([
        {severity: 'limitation', message: 'Submerged machines may distort the computed available energy.'},
        {severity: 'limitation', message: "Consumption applies the save's Power Consumption modifier: 150%"}
      ]);
    });
  });

  describe('When the save of a legacy game release multiplies the consumption by a power consumption modifier other than 1', () => {
    it('should name that modifier under the game release warning', () => {
      // Arrange
      const presenter = new EnergyLevelsPresenter();

      // Act
      presenter.displayEnergyLevels({gameRelease: '2.004', powerConsumptionModifier: 1.5, planets: []});

      // Assert
      expect(presenter.viewModel.notifications).toEqual<NotificationViewModel[]>([
        {severity: 'limitation', message: 'Submerged machines may distort the computed available energy.'},
        {severity: 'warning', message: 'Values of game release 2.004'},
        {severity: 'limitation', message: "Consumption applies the save's Power Consumption modifier: 150%"}
      ]);
    });
  });

  describe('When the power consumption modifier of the save is 1', () => {
    it('should name no modifier', () => {
      // Arrange
      const presenter = new EnergyLevelsPresenter();

      // Act
      presenter.displayEnergyLevels({gameRelease: '2.004', powerConsumptionModifier: 1, planets: []});

      // Assert
      expect(presenter.viewModel.notifications).toEqual<NotificationViewModel[]>([
        {severity: 'limitation', message: 'Submerged machines may distort the computed available energy.'},
        {severity: 'warning', message: 'Values of game release 2.004'}
      ]);
    });
  });

  it('should present the production and consumption breakdowns as rows', () => {
    // Arrange
    const presenter = new EnergyLevelsPresenter();

    // Act
    presenter.displayEnergyLevels({
      gameRelease: '2.102',
      powerConsumptionModifier: 1,
      planets: [{
        planetId: 1,
        production: 590,
        consumption: 182,
        available: 408,
        productionBreakdown: [{
          name: 'WindTurbine1',
          quantity: 2,
          unitLevel: 290,
          totalLevel: 580,
          productionRatio: 580 / 590
        }],
        consumptionBreakdown: [{
          name: 'Drill2',
          quantity: 4,
          unitLevel: 45.5,
          totalLevel: 182
        }],
        optimizers: []
      }]
    });

    // Assert
    expect(presenter.viewModel.planets[0].productionBreakdown).toEqual([{
      label: 'Wind turbine T2',
      quantity: '2',
      unitLevel: `290${nbsp}kW`,
      totalLevel: `580${nbsp}kW (98%)`
    }]);
    expect(presenter.viewModel.planets[0].consumptionBreakdown).toEqual([{
      label: 'Drill T3',
      quantity: '4',
      unitLevel: `45.5${nbsp}kW`,
      totalLevel: `182${nbsp}kW`
    }]);
  });

  it('should present optimizers with the machines they boost and their contribution', () => {
    // Arrange
    const presenter = new EnergyLevelsPresenter();

    // Act
    presenter.displayEnergyLevels({
      gameRelease: '2.102',
      powerConsumptionModifier: 1,
      planets: [{
        planetId: 1,
        production: 590,
        consumption: 0,
        available: 590,
        productionBreakdown: [],
        consumptionBreakdown: [],
        optimizers: [{
          name: 'Optimizer2',
          fuseCount: 2,
          boostedMachines: [
            {name: 'EnergyGenerator5', quantity: 3},
            {name: 'EnergyGenerator3', quantity: 2}
          ],
          contribution: 994.5,
          productionRatio: 994.5 / 590
        }]
      }]
    });

    // Assert
    expect(presenter.viewModel.planets[0].optimizers).toEqual([{
      label: 'Machine Optimizer T2',
      fuseCount: '2',
      boostedMachines: '3 Nuclear Reactor T2, 2 Solar panel T2',
      contribution: `994.5${nbsp}kW (169%)`
    }]);
  });
});
