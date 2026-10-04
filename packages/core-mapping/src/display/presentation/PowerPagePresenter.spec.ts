import {describe, expect, it} from 'bun:test';
import {UnreadableLineResponse} from "../../save/application/responses/UnreadableLineResponse";
import {WORLD_OBJECTS_SECTION} from "../../save/testing/saveSectionLocations";
import {PowerPagePresenter} from "./PowerPagePresenter";
import {PowerPageViewModel} from "./viewModels/PowerPageViewModel";

const nbsp = '\u00A0';

describe('PowerPagePresenter', () => {
  it('should initialize with the submerged machines limitation and no planet', () => {
    // Act
    const presenter = new PowerPagePresenter();

    // Assert
    expect<PowerPageViewModel>(presenter.viewModel).toEqual({
      notifications: [{severity: 'limitation', message: 'Submerged machines may distort the computed available energy.'}],
      planets: []
    });
  });

  it('should present the notifications of the save, then one zone per planet', () => {
    // Arrange
    const presenter = new PowerPagePresenter();

    // Act
    presenter.displayPowerPage({
      gameRelease: '2.004',
      gameReleaseIsEarlierThanCurrent: true,
      powerConsumptionModifier: 1.5,
      powerConsumptionIsModified: true,
      worldObjectLabels: {EnergyGenerator3: 'Solar panel T2'},
      planets: [{
        planetId: 1,
        planetName: 'Prime',
        production: 50,
        consumption: 0,
        available: 50,
        balance: 'surplus',
        productionBreakdown: [{name: 'EnergyGenerator3', quantity: 1, unitLevel: 50, totalLevel: 50, productionRatio: 1}],
        consumptionBreakdown: [],
        optimizers: []
      }]
    });

    // Assert
    expect<PowerPageViewModel>(presenter.viewModel).toEqual({
      notifications: [
        {severity: 'limitation', message: 'Submerged machines may distort the computed available energy.'},
        {severity: 'warning', message: 'Values of game release 2.004'},
        {severity: 'information', message: "Consumption applies the save's Power Consumption modifier: 150%"}
      ],
      planets: [{
        planetName: 'Prime',
        balance: {value: 'Surplus', tone: 'positive', toneLabel: 'production covers consumption'},
        production: {label: 'Production', value: `50${nbsp}kW`},
        consumption: {label: 'Consumption', value: `0${nbsp}kW`},
        available: {label: 'Available', value: `+50${nbsp}kW`},
        loadMeter: {label: '0% of production consumed', fillPercentage: 0},
        optimizers: {title: 'Optimizers', summary: `0 optimizers · boost 0${nbsp}kW`, rows: []},
        breakdownSummary: '1 producer · 0 consumers · 0 optimizers',
        producers: {
          title: 'Producers',
          rows: [{label: 'Solar panel T2', quantity: '1', unitLevel: `50${nbsp}kW`, totalLevel: `50${nbsp}kW`, share: '100%'}],
          total: {label: 'Total', quantity: '1', unitLevel: '', totalLevel: `50${nbsp}kW`, share: '100%'}
        },
        consumers: {title: 'Consumers', rows: [], total: {label: 'Total', quantity: '0', unitLevel: '', totalLevel: `0${nbsp}kW`, share: ''}},
        chart: {
          production: {
            title: 'Production',
            summary: `1 type · 50${nbsp}kW`,
            bars: [{label: 'Solar panel T2', series: 'production', widthPercentage: 62.5, value: `50${nbsp}kW`, detail: `1 × 50${nbsp}kW = 50${nbsp}kW · 100% of production`}],
            ticks: ['0', '20', '40', '60', '80']
          },
          consumption: {title: 'Consumption', summary: `0 types · 0${nbsp}kW`, bars: [], ticks: []},
          legend: [
            {label: 'Producers', series: 'production'},
            {label: 'Consumers', series: 'consumption'}
          ]
        }
      }]
    });
  });

  describe('When the save has unreadable lines', () => {
    it('should show the unreadable lines in place of the planets', () => {
      // Arrange
      const unreadableLines: UnreadableLineResponse[] = [{code: 'invalid-json', section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{not valid json'}];
      const presenter = new PowerPagePresenter();

      // Act
      presenter.displaySaveWithUnreadableLines({unreadableLines});

      // Assert
      expect<PowerPageViewModel>(presenter.viewModel).toEqual({notifications: [], planets: [], unreadableLines: [{message: 'Invalid JSON: {not valid json', location: 'World objects (section 78), entry 2'}]});
    });
  });
});
