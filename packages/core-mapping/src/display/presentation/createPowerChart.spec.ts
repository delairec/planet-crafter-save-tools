import {describe, expect, it} from 'bun:test';
import {createPowerChart} from "./createPowerChart";
import {PlanetEnergyLevelsResponse} from "../application/responses/EnergyLevelsResponse";
import {WorldObjectLabelsResponse} from "../application/responses/WorldObjectLabelsResponse";
import {PowerChartPanelViewModel, PowerChartViewModel} from "./viewModels/PowerChartViewModel";

const nbsp = ' ';
const WORLD_OBJECT_LABELS: WorldObjectLabelsResponse = {
  Drill2: 'Drill T3',
  EnergyGenerator3: 'Solar panel T2',
  EnergyGenerator5: 'Nuclear Reactor T2',
  Optimizer2: 'Machine Optimizer T2',
  Generator01: 'Generator 01',
  Generator02: 'Generator 02',
  Generator03: 'Generator 03',
  Generator04: 'Generator 04',
  Generator05: 'Generator 05',
  Generator06: 'Generator 06',
  Generator07: 'Generator 07',
  Generator08: 'Generator 08',
  Generator09: 'Generator 09',
  Generator10: 'Generator 10',
  Generator11: 'Generator 11',
  Generator12: 'Generator 12',
  Generator13: 'Generator 13',
  Generator14: 'Generator 14',
  Generator15: 'Generator 15'
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
    {name: 'Optimizer2', fuseCount: 3, fuseSlots: 4, boostedMachines: [{name: 'EnergyGenerator5', quantity: 2}], contribution: 100, productionRatio: 0.1}
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

describe('createPowerChart', () => {
  it('should chart the production with the optimizer boost as a bar of its own and the consumption, largest first, each panel on its own ticks', () => {
    // Act
    const chart = createPowerChart(TIGHT_PLANET, WORLD_OBJECT_LABELS);

    // Assert
    expect<PowerChartViewModel>(chart).toEqual({
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
        bars: [
          {label: 'Drill T3', series: 'consumption', widthPercentage: 95, value: `950${nbsp}kW`, detail: `5 × 190${nbsp}kW = 950${nbsp}kW · 95% of production`}
        ],
        ticks: ['0', '250', '500', '750', '1,000']
      },
      legend: [
        {label: 'Producers', series: 'production'},
        {label: 'Optimizer boost', series: 'optimizerBoost'},
        {label: 'Consumers', series: 'consumption'}
      ]
    });
  });

  describe('When the planet has more than twelve types of producers', () => {
    it('should keep the eleven largest and fold the rest into one Other bar, last, while the optimizer boost keeps its own bar', () => {
      // Arrange
      const planet: PlanetEnergyLevelsResponse = {
        ...IDLE_PLANET,
        production: 1_000,
        available: 1_000,
        balance: 'surplus',
        productionBreakdown: [
          {name: 'Generator01', quantity: 1, unitLevel: 200, totalLevel: 200, productionRatio: 0.2},
          {name: 'Generator02', quantity: 1, unitLevel: 150, totalLevel: 150, productionRatio: 0.15},
          {name: 'Generator03', quantity: 1, unitLevel: 100, totalLevel: 100, productionRatio: 0.1},
          {name: 'Generator04', quantity: 1, unitLevel: 90, totalLevel: 90, productionRatio: 0.09},
          {name: 'Generator05', quantity: 1, unitLevel: 80, totalLevel: 80, productionRatio: 0.08},
          {name: 'Generator06', quantity: 1, unitLevel: 70, totalLevel: 70, productionRatio: 0.07},
          {name: 'Generator07', quantity: 1, unitLevel: 60, totalLevel: 60, productionRatio: 0.06},
          {name: 'Generator08', quantity: 1, unitLevel: 50, totalLevel: 50, productionRatio: 0.05},
          {name: 'Generator09', quantity: 1, unitLevel: 40, totalLevel: 40, productionRatio: 0.04},
          {name: 'Generator10', quantity: 1, unitLevel: 30, totalLevel: 30, productionRatio: 0.03},
          {name: 'Generator11', quantity: 1, unitLevel: 30, totalLevel: 30, productionRatio: 0.03},
          {name: 'Generator12', quantity: 1, unitLevel: 20, totalLevel: 20, productionRatio: 0.02},
          {name: 'Generator13', quantity: 1, unitLevel: 20, totalLevel: 20, productionRatio: 0.02},
          {name: 'Generator14', quantity: 1, unitLevel: 20, totalLevel: 20, productionRatio: 0.02},
          {name: 'Generator15', quantity: 1, unitLevel: 20, totalLevel: 20, productionRatio: 0.02}
        ],
        optimizers: [
          {name: 'Optimizer2', fuseCount: 1, fuseSlots: 4, boostedMachines: [{name: 'Generator01', quantity: 1}], contribution: 10, productionRatio: 0.01},
          {name: 'Optimizer2', fuseCount: 1, fuseSlots: 4, boostedMachines: [{name: 'Generator02', quantity: 1}], contribution: 10, productionRatio: 0.01}
        ]
      };

      // Act
      const chart = createPowerChart(planet, WORLD_OBJECT_LABELS);

      // Assert
      expect<PowerChartViewModel>(chart).toEqual({
        production: {
          title: 'Production',
          summary: `15 types · 1,000${nbsp}kW`,
          bars: [
            {label: 'Generator 01', series: 'production', widthPercentage: 100, value: `200${nbsp}kW`, detail: `1 × 200${nbsp}kW = 200${nbsp}kW · 20% of production`},
            {label: 'Generator 02', series: 'production', widthPercentage: 75, value: `150${nbsp}kW`, detail: `1 × 150${nbsp}kW = 150${nbsp}kW · 15% of production`},
            {label: 'Generator 03', series: 'production', widthPercentage: 50, value: `100${nbsp}kW`, detail: `1 × 100${nbsp}kW = 100${nbsp}kW · 10% of production`},
            {label: 'Generator 04', series: 'production', widthPercentage: 45, value: `90${nbsp}kW`, detail: `1 × 90${nbsp}kW = 90${nbsp}kW · 9% of production`},
            {label: 'Generator 05', series: 'production', widthPercentage: 40, value: `80${nbsp}kW`, detail: `1 × 80${nbsp}kW = 80${nbsp}kW · 8% of production`},
            {label: 'Generator 06', series: 'production', widthPercentage: 35, value: `70${nbsp}kW`, detail: `1 × 70${nbsp}kW = 70${nbsp}kW · 7% of production`},
            {label: 'Generator 07', series: 'production', widthPercentage: 30, value: `60${nbsp}kW`, detail: `1 × 60${nbsp}kW = 60${nbsp}kW · 6% of production`},
            {label: 'Generator 08', series: 'production', widthPercentage: 25, value: `50${nbsp}kW`, detail: `1 × 50${nbsp}kW = 50${nbsp}kW · 5% of production`},
            {label: 'Generator 09', series: 'production', widthPercentage: 20, value: `40${nbsp}kW`, detail: `1 × 40${nbsp}kW = 40${nbsp}kW · 4% of production`},
            {label: 'Generator 10', series: 'production', widthPercentage: 15, value: `30${nbsp}kW`, detail: `1 × 30${nbsp}kW = 30${nbsp}kW · 3% of production`},
            {label: 'Generator 11', series: 'production', widthPercentage: 15, value: `30${nbsp}kW`, detail: `1 × 30${nbsp}kW = 30${nbsp}kW · 3% of production`},
            {label: 'Optimizer boost', series: 'optimizerBoost', widthPercentage: 10, value: `20${nbsp}kW`, detail: `2 optimizers · 20${nbsp}kW · 2% of production`},
            {label: 'Other (4 types)', series: 'foldedTail', widthPercentage: 40, value: `80${nbsp}kW`, detail: `4 machines · 80${nbsp}kW · 8% of production`}
          ],
          ticks: ['0', '50', '100', '150', '200']
        },
        consumption: {title: 'Consumption', summary: `0 types · 0${nbsp}kW`, bars: [], ticks: []},
        legend: [
          {label: 'Producers', series: 'production'},
          {label: 'Optimizer boost', series: 'optimizerBoost'},
          {label: 'Consumers', series: 'consumption'},
          {label: 'Folded tail', series: 'foldedTail'}
        ]
      });
    });
  });

  describe('When the planet has twelve types of consumers', () => {
    it('should keep a bar for each of them and fold none', () => {
      // Arrange
      const planet: PlanetEnergyLevelsResponse = {
        ...IDLE_PLANET,
        production: 1_000,
        consumption: 120,
        available: 880,
        balance: 'surplus',
        consumptionBreakdown: [
          {name: 'Generator01', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
          {name: 'Generator02', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
          {name: 'Generator03', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
          {name: 'Generator04', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
          {name: 'Generator05', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
          {name: 'Generator06', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
          {name: 'Generator07', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
          {name: 'Generator08', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
          {name: 'Generator09', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
          {name: 'Generator10', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
          {name: 'Generator11', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
          {name: 'Generator12', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01}
        ]
      };

      // Act
      const chart = createPowerChart(planet, WORLD_OBJECT_LABELS);

      // Assert
      expect<PowerChartPanelViewModel>(chart.consumption).toEqual({
        title: 'Consumption',
        summary: `12 types · 120${nbsp}kW`,
        bars: [
          {label: 'Generator 01', series: 'consumption', widthPercentage: 100, value: `10${nbsp}kW`, detail: `1 × 10${nbsp}kW = 10${nbsp}kW · 1% of production`},
          {label: 'Generator 02', series: 'consumption', widthPercentage: 100, value: `10${nbsp}kW`, detail: `1 × 10${nbsp}kW = 10${nbsp}kW · 1% of production`},
          {label: 'Generator 03', series: 'consumption', widthPercentage: 100, value: `10${nbsp}kW`, detail: `1 × 10${nbsp}kW = 10${nbsp}kW · 1% of production`},
          {label: 'Generator 04', series: 'consumption', widthPercentage: 100, value: `10${nbsp}kW`, detail: `1 × 10${nbsp}kW = 10${nbsp}kW · 1% of production`},
          {label: 'Generator 05', series: 'consumption', widthPercentage: 100, value: `10${nbsp}kW`, detail: `1 × 10${nbsp}kW = 10${nbsp}kW · 1% of production`},
          {label: 'Generator 06', series: 'consumption', widthPercentage: 100, value: `10${nbsp}kW`, detail: `1 × 10${nbsp}kW = 10${nbsp}kW · 1% of production`},
          {label: 'Generator 07', series: 'consumption', widthPercentage: 100, value: `10${nbsp}kW`, detail: `1 × 10${nbsp}kW = 10${nbsp}kW · 1% of production`},
          {label: 'Generator 08', series: 'consumption', widthPercentage: 100, value: `10${nbsp}kW`, detail: `1 × 10${nbsp}kW = 10${nbsp}kW · 1% of production`},
          {label: 'Generator 09', series: 'consumption', widthPercentage: 100, value: `10${nbsp}kW`, detail: `1 × 10${nbsp}kW = 10${nbsp}kW · 1% of production`},
          {label: 'Generator 10', series: 'consumption', widthPercentage: 100, value: `10${nbsp}kW`, detail: `1 × 10${nbsp}kW = 10${nbsp}kW · 1% of production`},
          {label: 'Generator 11', series: 'consumption', widthPercentage: 100, value: `10${nbsp}kW`, detail: `1 × 10${nbsp}kW = 10${nbsp}kW · 1% of production`},
          {label: 'Generator 12', series: 'consumption', widthPercentage: 100, value: `10${nbsp}kW`, detail: `1 × 10${nbsp}kW = 10${nbsp}kW · 1% of production`}
        ],
        ticks: ['0', '2.5', '5', '7.5', '10']
      });
    });
  });

  describe('When the planet produces nothing', () => {
    it('should draw two empty panels without ticks, and a legend without optimizer boost', () => {
      // Act
      const chart = createPowerChart(IDLE_PLANET, WORLD_OBJECT_LABELS);

      // Assert
      expect<PowerChartViewModel>(chart).toEqual({
        production: {title: 'Production', summary: `0 types · 0${nbsp}kW`, bars: [], ticks: []},
        consumption: {title: 'Consumption', summary: `0 types · 0${nbsp}kW`, bars: [], ticks: []},
        legend: [
          {label: 'Producers', series: 'production'},
          {label: 'Consumers', series: 'consumption'}
        ]
      });
    });

    it('should name no share in the detail of a consumer', () => {
      // Arrange
      const planet: PlanetEnergyLevelsResponse = {
        ...IDLE_PLANET,
        consumption: 190,
        available: -190,
        balance: 'deficit',
        consumptionBreakdown: [{name: 'Drill2', quantity: 1, unitLevel: 190, totalLevel: 190}]
      };

      // Act
      const chart = createPowerChart(planet, WORLD_OBJECT_LABELS);

      // Assert
      expect<PowerChartPanelViewModel>(chart.consumption).toEqual({
        title: 'Consumption',
        summary: `1 type · 190${nbsp}kW`,
        bars: [{label: 'Drill T3', series: 'consumption', widthPercentage: 95, value: `190${nbsp}kW`, detail: `1 × 190${nbsp}kW = 190${nbsp}kW`}],
        ticks: ['0', '50', '100', '150', '200']
      });
    });
  });
});
