import {
  EnergyBreakdownEntryResponse,
  OptimizerResponse,
  PlanetEnergyLevelsResponse
} from "../application/responses/EnergyLevelsResponse";
import {WorldObjectLabelsResponse} from "../application/responses/WorldObjectLabelsResponse";
import {
  PowerChartBarViewModel,
  PowerChartLegendItemViewModel,
  PowerChartPanelViewModel,
  PowerChartSeries,
  PowerChartViewModel
} from "./viewModels/PowerChartViewModel";
import {formatKilowatts} from "./formatKilowatts";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {FormatNumberStrategies} from "./formatters/formatNumber/FormatNumberStrategies";
import {
  energyLevelsSectionConsumptionTitle,
  energyLevelsSectionProductionTitle
} from "./messages/energyLevelsSectionMessages.js";
import {
  powerPageConsumersTitle,
  powerPageFoldedTailLabel,
  powerPageOptimizerBoostLabel,
  powerPageProducersTitle,
  resolvePowerPageBarDetailWithShare,
  resolvePowerPageChartSummary,
  resolvePowerPageFoldedTailBarDetail,
  resolvePowerPageFoldedTailBarLabel,
  resolvePowerPageMachineBarDetail,
  resolvePowerPageOptimizerBoostBarDetail
} from "./messages/powerPageMessages.js";

type MachineSeries = 'production' | 'consumption';

const UNFOLDED_MACHINE_TYPE_LIMIT = 12;
const MACHINE_TYPES_KEPT_BESIDE_FOLDED_TAIL = 11;
const TICK_INTERVALS = 4;
const TICK_STEP_MULTIPLIERS = [1, 2, 2.5, 5];
const NEXT_MAGNITUDE_MULTIPLIER = 10;
const FULL_WIDTH_PERCENTAGE = 100;
const NO_TICKS: string[] = [];
const NO_COMPANION_BARS: ChartBar[] = [];

interface ChartBar {
  readonly label: string;
  readonly series: PowerChartSeries;
  readonly totalLevel: number;
  readonly detail: string;
}

interface PanelSource {
  readonly title: string;
  readonly series: MachineSeries;
  readonly totalLevel: number;
  readonly breakdown: readonly EnergyBreakdownEntryResponse[];
  readonly companionBars: readonly ChartBar[];
}

export function createPowerChart(planet: PlanetEnergyLevelsResponse, worldObjectLabels: WorldObjectLabelsResponse): PowerChartViewModel {
  const optimizerBoostBars = planet.optimizers.length > 0 ? [createOptimizerBoostBar(planet.optimizers)] : NO_COMPANION_BARS;
  const production = createPanel({
    title: energyLevelsSectionProductionTitle,
    series: 'production',
    totalLevel: planet.production,
    breakdown: planet.productionBreakdown,
    companionBars: optimizerBoostBars
  }, worldObjectLabels);
  const consumption = createPanel({
    title: energyLevelsSectionConsumptionTitle,
    series: 'consumption',
    totalLevel: planet.consumption,
    breakdown: planet.consumptionBreakdown,
    companionBars: NO_COMPANION_BARS
  }, worldObjectLabels);
  const hasFoldedTail = [...production.bars, ...consumption.bars].some((bar) => bar.series === 'foldedTail');

  return {
    production,
    consumption,
    legend: [
      {label: powerPageProducersTitle, series: 'production'},
      ...optimizerBoostBars.map((bar): PowerChartLegendItemViewModel => ({label: bar.label, series: bar.series})),
      {label: powerPageConsumersTitle, series: 'consumption'},
      ...hasFoldedTail ? [{label: powerPageFoldedTailLabel, series: 'foldedTail' as const}] : []
    ]
  };
}

function createPanel(source: PanelSource, worldObjectLabels: WorldObjectLabelsResponse): PowerChartPanelViewModel {
  const entries = [...source.breakdown].sort((first, second) => second.totalLevel - first.totalLevel);
  const isFolded = entries.length > UNFOLDED_MACHINE_TYPE_LIMIT;
  const keptEntries = isFolded ? entries.slice(0, MACHINE_TYPES_KEPT_BESIDE_FOLDED_TAIL) : entries;
  const keptBars = [...keptEntries.map((entry) => createMachineBar(entry, source.series, worldObjectLabels)), ...source.companionBars]
    .sort((first, second) => second.totalLevel - first.totalLevel);
  const bars = isFolded ? [...keptBars, createFoldedTailBar(entries.slice(MACHINE_TYPES_KEPT_BESIDE_FOLDED_TAIL))] : keptBars;
  const largestTotalLevel = Math.max(0, ...bars.map((bar) => bar.totalLevel));
  const fullWidthLevel = TICK_INTERVALS * findTickStep(largestTotalLevel);

  return {
    title: source.title,
    summary: resolvePowerPageChartSummary(source.breakdown.length, formatKilowatts(source.totalLevel)),
    bars: bars.map((bar): PowerChartBarViewModel => ({
      label: bar.label,
      series: bar.series,
      widthPercentage: largestTotalLevel === 0 ? 0 : bar.totalLevel * FULL_WIDTH_PERCENTAGE / fullWidthLevel,
      value: formatKilowatts(bar.totalLevel),
      detail: bar.detail
    })),
    ticks: largestTotalLevel === 0 ? NO_TICKS : createTicks(fullWidthLevel / TICK_INTERVALS)
  };
}

function findTickStep(largestTotalLevel: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(largestTotalLevel / TICK_INTERVALS));
  const multiplier = TICK_STEP_MULTIPLIERS.find((candidate) => TICK_INTERVALS * candidate * magnitude >= largestTotalLevel);
  return (multiplier ?? NEXT_MAGNITUDE_MULTIPLIER) * magnitude;
}

function createTicks(step: number): string[] {
  return Array.from({length: TICK_INTERVALS + 1}, (_, index) => formatNumber(index * step));
}

function createMachineBar(entry: EnergyBreakdownEntryResponse, series: MachineSeries, worldObjectLabels: WorldObjectLabelsResponse): ChartBar {
  const detail = resolvePowerPageMachineBarDetail(formatNumber(entry.quantity), formatKilowatts(entry.unitLevel), formatKilowatts(entry.totalLevel));
  return {
    label: worldObjectLabels[entry.name],
    series,
    totalLevel: entry.totalLevel,
    detail: appendShare(detail, entry.productionRatio)
  };
}

function createFoldedTailBar(foldedEntries: readonly EnergyBreakdownEntryResponse[]): ChartBar {
  const totalLevel = foldedEntries.reduce((total, entry) => total + entry.totalLevel, 0);
  const machineCount = foldedEntries.reduce((total, entry) => total + entry.quantity, 0);
  return {
    label: resolvePowerPageFoldedTailBarLabel(foldedEntries.length),
    series: 'foldedTail',
    totalLevel,
    detail: appendShare(
      resolvePowerPageFoldedTailBarDetail(machineCount, formatKilowatts(totalLevel)),
      sumRatios(foldedEntries.map((entry) => entry.productionRatio))
    )
  };
}

function createOptimizerBoostBar(optimizers: readonly OptimizerResponse[]): ChartBar {
  const totalLevel = optimizers.reduce((total, optimizer) => total + optimizer.contribution, 0);
  return {
    label: powerPageOptimizerBoostLabel,
    series: 'optimizerBoost',
    totalLevel,
    detail: appendShare(
      resolvePowerPageOptimizerBoostBarDetail(optimizers.length, formatKilowatts(totalLevel)),
      sumRatios(optimizers.map((optimizer) => optimizer.productionRatio))
    )
  };
}

function sumRatios(ratios: readonly (number | undefined)[]): number | undefined {
  return ratios.reduce<number | undefined>((total, ratio) => ratio === undefined ? total : (total ?? 0) + ratio, undefined);
}

function appendShare(detail: string, productionRatio: number | undefined): string {
  if (productionRatio === undefined) {
    return detail;
  }
  return resolvePowerPageBarDetailWithShare(detail, formatNumber(productionRatio, FormatNumberStrategies.PERCENTAGE));
}
