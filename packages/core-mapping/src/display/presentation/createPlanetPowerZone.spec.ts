import {describe, expect, it} from 'bun:test';
import {createPlanetPowerZone} from "./createPlanetPowerZone";
import {PlanetEnergyLevelsResponse, PowerBalanceResponse} from "../application/responses/EnergyLevelsResponse";
import {WorldObjectLabelsResponse} from "../application/responses/WorldObjectLabelsResponse";
import {TonedValueViewModel} from "./viewModels/ConfigurationPageViewModel";
import {PlanetPowerZoneViewModel, PowerBreakdownTableViewModel, PowerLoadMeterViewModel, PowerOptimizersViewModel} from "./viewModels/PlanetPowerZoneViewModel";

const nbsp = ' ';
const WORLD_OBJECT_LABELS: WorldObjectLabelsResponse = {
  Drill2: 'Drill T3',
  EnergyGenerator3: 'Solar panel T2',
  EnergyGenerator5: 'Nuclear Reactor T2',
  Optimizer2: 'Machine Optimizer T2',
  WindTurbine1: 'Wind turbine T2'
};
const TIGHT_PLANET: PlanetEnergyLevelsResponse = {
  planetId: 1,
  planetName: 'Prime',
  production: 1_000,
  consumption: 950,
  available: 50,
  balance: 'tight',
  productionBreakdown: [
    {name: 'EnergyGenerator5', quantity: 2, unitLevel: 400, totalLevel: 800, productionRatio: 0.8},
    {name: 'EnergyGenerator3', quantity: 4, unitLevel: 50, totalLevel: 200, productionRatio: 0.2}
  ],
  consumptionBreakdown: [
    {name: 'Drill2', quantity: 5, unitLevel: 190, totalLevel: 950, productionRatio: 0.95}
  ],
  optimizers: [
    {name: 'Optimizer2', fuseCount: 3, fuseSlots: 4, boostedMachines: [{name: 'WindTurbine1', quantity: 2}, {name: 'Drill2', quantity: 1}], contribution: 100, productionRatio: 0.1}
  ]
};
const IDLE_PLANET: PlanetEnergyLevelsResponse = {
  planetId: 3,
  production: 0,
  consumption: 0,
  available: 0,
  balance: 'balanced',
  productionBreakdown: [],
  consumptionBreakdown: [],
  optimizers: []
};

describe('createPlanetPowerZone', () => {
  it('should build the zone of a planet: status pill, three figure tiles, load meter, optimizers and the two tables ending on a total row', () => {
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
        consumers: {title: 'Consumers', rows: [], total: {label: 'Total', quantity: '0', unitLevel: '', totalLevel: `0${nbsp}kW`, share: ''}}
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
