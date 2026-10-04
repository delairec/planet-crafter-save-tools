import {describe, expect, it} from 'bun:test';
import {createPlanetPowerZone} from "./createPlanetPowerZone";
import {PlanetEnergyLevelsResponse, PowerBalanceResponse} from "../application/responses/EnergyLevelsResponse";
import {TonedValueViewModel} from "./viewModels/ConfigurationPageViewModel";
import {PlanetPowerZoneViewModel, PowerBreakdownTableViewModel, PowerLoadMeterViewModel, PowerOptimizersViewModel} from "./viewModels/PlanetPowerZoneViewModel";
import {IDLE_PLANET, TIGHT_PLANET, WORLD_OBJECT_LABELS} from "../testing/planetEnergyLevelsFixture";

const nbsp = '\u00A0';

describe('createPlanetPowerZone', () => {
  it('should build the zone of a planet: status pill, three figure tiles, load meter, optimizers, the two tables ending on a total row and the chart', () => {
    // Act
    const zone = createPlanetPowerZone(TIGHT_PLANET, WORLD_OBJECT_LABELS);

    // Assert
    expect<PlanetPowerZoneViewModel>(zone).toEqual({
      planetName: 'Prime',
      balance: {value: 'Tight', tone: 'neutral', toneLabel: 'less than a tenth of production available'},
      production: {label: 'Production', value: `1,000${nbsp}kW`},
      consumption: {label: 'Consumption', value: `950${nbsp}kW`},
      available: {label: 'Available', value: `+50${nbsp}kW`},
      loadMeter: {label: '95% of production consumed', fillPercentage: 95},
      optimizers: {
        title: 'Optimizers',
        summary: `1 optimizer · boost 100${nbsp}kW (10%)`,
        rows: [{label: 'Machine Optimizer T2', fuses: '3 / 4', boostedMachines: '2 Wind turbine T2, 1 Drill T3', contribution: `100${nbsp}kW`, share: '10%'}]
      },
      breakdownSummary: '6 producers · 5 consumers · 1 optimizer',
      producers: {
        title: 'Producers',
        rows: [
          {label: 'Nuclear Reactor T2', quantity: '2', unitLevel: `400${nbsp}kW`, totalLevel: `800${nbsp}kW`, share: '80%'},
          {label: 'Solar panel T2', quantity: '4', unitLevel: `50${nbsp}kW`, totalLevel: `200${nbsp}kW`, share: '20%'}
        ],
        total: {label: 'Total', quantity: '6', unitLevel: '', totalLevel: `1,000${nbsp}kW`, share: '100%'}
      },
      consumers: {
        title: 'Consumers',
        rows: [{label: 'Drill T3', quantity: '5', unitLevel: `190${nbsp}kW`, totalLevel: `950${nbsp}kW`, share: '95%'}],
        total: {label: 'Total', quantity: '5', unitLevel: '', totalLevel: `950${nbsp}kW`, share: '95%'}
      },
      chart: {
        production: {
          title: 'Production',
          summary: `2 types · 1,000${nbsp}kW`,
          bars: [
            {label: 'Nuclear Reactor T2', series: 'production', widthPercentage: 100, value: `800${nbsp}kW`, detail: `2 × 400${nbsp}kW = 800${nbsp}kW · 80% of production`},
            {label: 'Solar panel T2', series: 'production', widthPercentage: 25, value: `200${nbsp}kW`, detail: `4 × 50${nbsp}kW = 200${nbsp}kW · 20% of production`},
            {label: 'Optimizer boost', series: 'optimizerBoost', widthPercentage: 12.5, value: `100${nbsp}kW`, detail: `1 optimizer · 100${nbsp}kW · 10% of production`}
          ],
          ticks: ['0', '200', '400', '600', '800']
        },
        consumption: {
          title: 'Consumption',
          summary: `1 type · 950${nbsp}kW`,
          bars: [{label: 'Drill T3', series: 'consumption', widthPercentage: 95, value: `950${nbsp}kW`, detail: `5 × 190${nbsp}kW = 950${nbsp}kW · 95% of production`}],
          ticks: ['0', '250', '500', '750', '1,000']
        },
        legend: [
          {label: 'Producers', series: 'production'},
          {label: 'Optimizer boost', series: 'optimizerBoost'},
          {label: 'Consumers', series: 'consumption'}
        ]
      }
    });
  });

  it.each<[PowerBalanceResponse, TonedValueViewModel]>([
    ['deficit', {value: 'Deficit', tone: 'danger', toneLabel: 'consumption exceeds production'}],
    ['tight', {value: 'Tight', tone: 'neutral', toneLabel: 'less than a tenth of production available'}],
    ['surplus', {value: 'Surplus', tone: 'positive', toneLabel: 'production covers consumption'}],
    ['balanced', {value: 'Balanced', tone: 'neutral', toneLabel: 'no power produced nor consumed'}]
  ])('should map a %s balance to its word and tone', (balance, expectedBadge) => {
    // Act
    const zone = createPlanetPowerZone({...TIGHT_PLANET, balance}, WORLD_OBJECT_LABELS);

    // Assert
    expect<TonedValueViewModel>(zone.balance).toEqual(expectedBadge);
  });

  describe('When the planet consumes more than it produces', () => {
    it('should fill the load meter to its end while naming the share consumed', () => {
      // Act
      const zone = createPlanetPowerZone({...TIGHT_PLANET, production: 400, consumption: 500, available: -100, balance: 'deficit'}, WORLD_OBJECT_LABELS);

      // Assert
      expect<PowerLoadMeterViewModel | undefined>(zone.loadMeter).toEqual({label: '125% of production consumed', fillPercentage: 100});
    });
  });

  describe('When the planet produces nothing', () => {
    it('should show no load meter, no share and no optimizer boost share', () => {
      // Act
      const zone = createPlanetPowerZone(IDLE_PLANET, WORLD_OBJECT_LABELS);

      // Assert
      expect<PlanetPowerZoneViewModel>(zone).toEqual({
        planetName: 'Planet 3',
        balance: {value: 'Balanced', tone: 'neutral', toneLabel: 'no power produced nor consumed'},
        production: {label: 'Production', value: `0${nbsp}kW`},
        consumption: {label: 'Consumption', value: `0${nbsp}kW`},
        available: {label: 'Available', value: `0${nbsp}kW`},
        optimizers: {title: 'Optimizers', summary: `0 optimizers · boost 0${nbsp}kW`, rows: []},
        breakdownSummary: '0 producers · 0 consumers · 0 optimizers',
        producers: {title: 'Producers', rows: [], total: {label: 'Total', quantity: '0', unitLevel: '', totalLevel: `0${nbsp}kW`, share: ''}},
        consumers: {title: 'Consumers', rows: [], total: {label: 'Total', quantity: '0', unitLevel: '', totalLevel: `0${nbsp}kW`, share: ''}},
        chart: {
          production: {title: 'Production', summary: `0 types · 0${nbsp}kW`, bars: [], ticks: []},
          consumption: {title: 'Consumption', summary: `0 types · 0${nbsp}kW`, bars: [], ticks: []},
          legend: [
            {label: 'Producers', series: 'production'},
            {label: 'Consumers', series: 'consumption'}
          ]
        }
      });
    });

    it('should leave the share of a consumer and of an optimizer empty', () => {
      // Arrange
      const planet: PlanetEnergyLevelsResponse = {
        ...IDLE_PLANET,
        consumption: 190,
        available: -190,
        balance: 'deficit',
        consumptionBreakdown: [{name: 'Drill2', quantity: 1, unitLevel: 190, totalLevel: 190}],
        optimizers: [{name: 'Optimizer2', fuseCount: 0, fuseSlots: 4, boostedMachines: [], contribution: 0}]
      };

      // Act
      const zone = createPlanetPowerZone(planet, WORLD_OBJECT_LABELS);

      // Assert
      expect<[PowerBreakdownTableViewModel, PowerOptimizersViewModel]>([zone.consumers, zone.optimizers]).toEqual([
        {
          title: 'Consumers',
          rows: [{label: 'Drill T3', quantity: '1', unitLevel: `190${nbsp}kW`, totalLevel: `190${nbsp}kW`, share: ''}],
          total: {label: 'Total', quantity: '1', unitLevel: '', totalLevel: `190${nbsp}kW`, share: ''}
        },
        {
          title: 'Optimizers',
          summary: `1 optimizer · boost 0${nbsp}kW`,
          rows: [{label: 'Machine Optimizer T2', fuses: '0 / 4', boostedMachines: '', contribution: `0${nbsp}kW`, share: ''}]
        }
      ]);
    });
  });
});
