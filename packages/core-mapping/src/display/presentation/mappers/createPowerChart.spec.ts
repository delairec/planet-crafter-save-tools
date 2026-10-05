import {describe, expect, it} from 'bun:test';
import {createPowerChart} from "./createPowerChart";
import {PlanetEnergyLevelsResponse} from "../../application/responses/EnergyLevelsResponse";
import {
  PowerChartBarViewModel,
  PowerChartLegendItemViewModel,
  PowerChartPanelViewModel,
  PowerChartViewModel,
  PowerShareBarViewModel,
  PowerShareChartViewModel,
  PowerShareSegmentViewModel
} from "../viewModels/PowerChartViewModel";
import {
  IDLE_PLANET,
  PLANET_WITH_FIFTEEN_TYPES_OF_PRODUCERS,
  PLANET_WITH_NINE_TYPES_OF_CONSUMERS,
  PLANET_WITH_TWELVE_TYPES_OF_CONSUMERS,
  TIGHT_PLANET,
  WORLD_OBJECT_LABELS
} from "../../testing/planetEnergyLevelsFixture";

const nbsp = '\u00A0';

describe('createPowerChart', () => {
  it('should chart the production with the optimizer boost as a bar and a segment of its own and the consumption, largest first, each panel on its own ticks, and as the share of each machine type', () => {
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
      ],
      share: {
        production: {
          title: 'Production',
          summary: `2 types · 1,000${nbsp}kW`,
          segments: [
            {label: 'Nuclear Reactor T2', fill: 'production-1', widthPercentage: 80, writtenShare: '80%', detail: `2 × 400${nbsp}kW = 800${nbsp}kW · 80% of production`},
            {label: 'Solar panel T2', fill: 'production-2', widthPercentage: 20, writtenShare: '20%', detail: `4 × 50${nbsp}kW = 200${nbsp}kW · 20% of production`},
            {label: 'Optimizer boost', fill: 'optimizerBoost', widthPercentage: 10, writtenShare: '10%', detail: `1 optimizer · 100${nbsp}kW · 10% of production`}
          ]
        },
        consumption: {
          title: 'Consumption',
          summary: `1 type · 950${nbsp}kW`,
          segments: [
            {label: 'Drill T3', fill: 'consumption-1', widthPercentage: 95, writtenShare: '95%', detail: `5 × 190${nbsp}kW = 950${nbsp}kW · 95% of production`}
          ]
        }
      }
    });
  });

  describe('When the planet has more than twelve types of producers', () => {
    it('should keep the eleven largest and fold the rest into one Other bar, last, while the optimizer boost keeps its own bar', () => {
      // Act
      const chart = createPowerChart(PLANET_WITH_FIFTEEN_TYPES_OF_PRODUCERS, WORLD_OBJECT_LABELS);

      // Assert
      expect<PowerChartPanelViewModel>(chart.production).toEqual({
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
      });
    });

    it('should name the folded tail in the legend', () => {
      // Act
      const chart = createPowerChart(PLANET_WITH_FIFTEEN_TYPES_OF_PRODUCERS, WORLD_OBJECT_LABELS);

      // Assert
      expect<PowerChartLegendItemViewModel[]>(chart.legend).toEqual([
        {label: 'Producers', series: 'production'},
        {label: 'Optimizer boost', series: 'optimizerBoost'},
        {label: 'Consumers', series: 'consumption'},
        {label: 'Folded tail', series: 'foldedTail'}
      ]);
    });

    it('should keep the eight largest in the share of the production and fold the rest into one Other segment, last, while the optimizer boost keeps its own segment', () => {
      // Act
      const chart = createPowerChart(PLANET_WITH_FIFTEEN_TYPES_OF_PRODUCERS, WORLD_OBJECT_LABELS);

      // Assert
      expect<PowerShareBarViewModel>(chart.share.production).toEqual({
        title: 'Production',
        summary: `15 types · 1,000${nbsp}kW`,
        segments: [
          {label: 'Generator 01', fill: 'production-1', widthPercentage: 20, writtenShare: '20%', detail: `1 × 200${nbsp}kW = 200${nbsp}kW · 20% of production`},
          {label: 'Generator 02', fill: 'production-2', widthPercentage: 15, writtenShare: '15%', detail: `1 × 150${nbsp}kW = 150${nbsp}kW · 15% of production`},
          {label: 'Generator 03', fill: 'production-3', widthPercentage: 10, writtenShare: '10%', detail: `1 × 100${nbsp}kW = 100${nbsp}kW · 10% of production`},
          {label: 'Generator 04', fill: 'production-4', widthPercentage: 9, detail: `1 × 90${nbsp}kW = 90${nbsp}kW · 9% of production`},
          {label: 'Generator 05', fill: 'production-5', widthPercentage: 8, detail: `1 × 80${nbsp}kW = 80${nbsp}kW · 8% of production`},
          {label: 'Generator 06', fill: 'production-6', widthPercentage: 7, detail: `1 × 70${nbsp}kW = 70${nbsp}kW · 7% of production`},
          {label: 'Generator 07', fill: 'production-7', widthPercentage: 6, detail: `1 × 60${nbsp}kW = 60${nbsp}kW · 6% of production`},
          {label: 'Generator 08', fill: 'production-8', widthPercentage: 5, detail: `1 × 50${nbsp}kW = 50${nbsp}kW · 5% of production`},
          {label: 'Optimizer boost', fill: 'optimizerBoost', widthPercentage: 2, detail: `2 optimizers · 20${nbsp}kW · 2% of production`},
          {label: 'Other (7 types)', fill: 'foldedTail', widthPercentage: 18, writtenShare: '18%', detail: `7 machines · 180${nbsp}kW · 18% of production`}
        ]
      });
    });
  });

  describe('When the planet has twelve types of consumers', () => {
    it('should keep the twelfth type as the last bar, folding none', () => {
      // Act
      const chart = createPowerChart(PLANET_WITH_TWELVE_TYPES_OF_CONSUMERS, WORLD_OBJECT_LABELS);

      // Assert
      expect<PowerChartBarViewModel | undefined>(chart.consumption.bars.at(-1)).toEqual(
        {label: 'Generator 12', series: 'consumption', widthPercentage: 100, value: `10${nbsp}kW`, detail: `1 × 10${nbsp}kW = 10${nbsp}kW · 1% of production`}
      );
    });

    it('should fold the share of the consumption beyond the eighth type into one Other segment, last', () => {
      // Act
      const chart = createPowerChart(PLANET_WITH_TWELVE_TYPES_OF_CONSUMERS, WORLD_OBJECT_LABELS);

      // Assert
      expect<PowerShareSegmentViewModel | undefined>(chart.share.consumption.segments.at(-1)).toEqual(
        {label: 'Other (4 types)', fill: 'foldedTail', widthPercentage: 4, detail: `4 machines · 40${nbsp}kW · 4% of production`}
      );
    });
  });

  describe('When the planet has nine types of consumers', () => {
    it('should keep the ninth type as the last segment of the share of the consumption, folding none', () => {
      // Act
      const chart = createPowerChart(PLANET_WITH_NINE_TYPES_OF_CONSUMERS, WORLD_OBJECT_LABELS);

      // Assert
      expect<PowerShareSegmentViewModel | undefined>(chart.share.consumption.segments.at(-1)).toEqual(
        {label: 'Generator 09', fill: 'consumption-9', widthPercentage: 1, detail: `1 × 10${nbsp}kW = 10${nbsp}kW · 1% of production`}
      );
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
        ],
        share: {
          production: {title: 'Production', summary: `0 types · 0${nbsp}kW`, segments: []},
          consumption: {title: 'Consumption', summary: `0 types · 0${nbsp}kW`, segments: []}
        }
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

    it('should write no share inside the segment of a consumer, nor in its detail', () => {
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
      expect<PowerShareBarViewModel>(chart.share.consumption).toEqual({
        title: 'Consumption',
        summary: `1 type · 190${nbsp}kW`,
        segments: [{label: 'Drill T3', fill: 'consumption-1', widthPercentage: 100, detail: `1 × 190${nbsp}kW = 190${nbsp}kW`}]
      });
    });
  });

  describe('When the consumption exceeds the production', () => {
    it('should draw the share of the production and the share of the consumption on the scale of the consumption, each segment naming its share of production', () => {
      // Arrange
      const planet: PlanetEnergyLevelsResponse = {
        ...IDLE_PLANET,
        production: 500,
        consumption: 1_000,
        available: -500,
        balance: 'deficit',
        productionBreakdown: [{name: 'EnergyGenerator5', quantity: 1, unitLevel: 400, totalLevel: 400, productionRatio: 0.8}],
        consumptionBreakdown: [
          {name: 'Drill2', quantity: 5, unitLevel: 190, totalLevel: 950, productionRatio: 1.9},
          {name: 'Generator01', quantity: 1, unitLevel: 50, totalLevel: 50, productionRatio: 0.1}
        ],
        optimizers: [
          {name: 'Optimizer2', fuseCount: 1, fuseSlots: 4, boostedMachines: [{name: 'EnergyGenerator5', quantity: 1}], contribution: 100, productionRatio: 0.2}
        ]
      };

      // Act
      const chart = createPowerChart(planet, WORLD_OBJECT_LABELS);

      // Assert
      expect<PowerShareChartViewModel>(chart.share).toEqual({
        production: {
          title: 'Production',
          summary: `1 type · 500${nbsp}kW`,
          segments: [
            {label: 'Nuclear Reactor T2', fill: 'production-1', widthPercentage: 40, writtenShare: '80%', detail: `1 × 400${nbsp}kW = 400${nbsp}kW · 80% of production`},
            {label: 'Optimizer boost', fill: 'optimizerBoost', widthPercentage: 10, writtenShare: '20%', detail: `1 optimizer · 100${nbsp}kW · 20% of production`}
          ]
        },
        consumption: {
          title: 'Consumption',
          summary: `2 types · 1,000${nbsp}kW`,
          segments: [
            {label: 'Drill T3', fill: 'consumption-1', widthPercentage: 95, writtenShare: '190%', detail: `5 × 190${nbsp}kW = 950${nbsp}kW · 190% of production`},
            {label: 'Generator 01', fill: 'consumption-2', widthPercentage: 5, detail: `1 × 50${nbsp}kW = 50${nbsp}kW · 10% of production`}
          ]
        }
      });
    });
  });
});
