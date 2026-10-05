import {
  EnergyBreakdownEntryResponse,
  OptimizerResponse,
  PlanetEnergyLevelsResponse
} from "../../application/responses/EnergyLevelsResponse";
import {WorldObjectLabelsResponse} from "../../application/responses/WorldObjectLabelsResponse";
import {
  PowerChartBarViewModel,
  PowerChartLegendItemViewModel,
  PowerChartPanelViewModel,
  PowerChartSeries,
  PowerChartViewModel,
  PowerShareBarViewModel,
  PowerShareFill,
  PowerShareSegmentViewModel
} from "../viewModels/PowerChartViewModel";
import {formatKilowatts} from "./formatKilowatts";
import {sumOptimizerBoost} from "./sumOptimizerBoost";
import {sumProductionRatios} from "./sumProductionRatios";
import {formatShare} from "./formatShare";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {
  energyLevelsSectionConsumptionTitle,
  energyLevelsSectionProductionTitle
} from "../messages/energyLevelsSectionMessages.js";
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
} from "../messages/powerPageMessages.js";

type MachineSeries = 'production' | 'consumption';

const UNFOLDED_MACHINE_TYPE_LIMIT = 12;
const MACHINE_TYPES_KEPT_BESIDE_FOLDED_TAIL = 11;
const UNFOLDED_SHARE_MACHINE_TYPE_LIMIT = 9;
const SHARE_MACHINE_TYPES_KEPT_BESIDE_FOLDED_TAIL = 8;
const WRITTEN_SHARE_MIN_WIDTH_PERCENTAGE = 10;
const TICK_INTERVALS = 4;
const TICK_STEP_MULTIPLIERS = [1, 2, 2.5, 5];
const NEXT_MAGNITUDE_MULTIPLIER = 10;
const FULL_WIDTH_PERCENTAGE = 100;
const NO_TICKS: string[] = [];
const NO_COMPANION_BARS: ChartBar[] = [];
const MACHINE_SHARE_FILLS: Record<MachineSeries, readonly PowerShareFill[]> = {
  production: ['production-1', 'production-2', 'production-3', 'production-4', 'production-5', 'production-6', 'production-7', 'production-8', 'production-9'],
  consumption: ['consumption-1', 'consumption-2', 'consumption-3', 'consumption-4', 'consumption-5', 'consumption-6', 'consumption-7', 'consumption-8', 'consumption-9']
};

interface ChartBar {
  readonly label: string;
  readonly series: PowerChartSeries;
  readonly totalLevel: number;
  readonly productionRatio: number | undefined;
  readonly detail: string;
}

interface PanelSource {
  readonly title: string;
  readonly series: MachineSeries;
  readonly totalLevel: number;
  readonly breakdown: readonly EnergyBreakdownEntryResponse[];
  readonly companionBars: readonly ChartBar[];
}

interface FoldLimits {
  readonly unfoldedMachineTypeLimit: number;
  readonly machineTypesKeptBesideFoldedTail: number;
}

const BARS_FOLD_LIMITS: FoldLimits = {
  unfoldedMachineTypeLimit: UNFOLDED_MACHINE_TYPE_LIMIT,
  machineTypesKeptBesideFoldedTail: MACHINE_TYPES_KEPT_BESIDE_FOLDED_TAIL
};
const SHARE_FOLD_LIMITS: FoldLimits = {
  unfoldedMachineTypeLimit: UNFOLDED_SHARE_MACHINE_TYPE_LIMIT,
  machineTypesKeptBesideFoldedTail: SHARE_MACHINE_TYPES_KEPT_BESIDE_FOLDED_TAIL
};

export function createPowerChart(planet: PlanetEnergyLevelsResponse, worldObjectLabels: WorldObjectLabelsResponse): PowerChartViewModel {
  const optimizerBoostBars = planet.optimizers.length > 0 ? [createOptimizerBoostBar(planet.optimizers)] : NO_COMPANION_BARS;
  const productionSource: PanelSource = {
    title: energyLevelsSectionProductionTitle,
    series: 'production',
    totalLevel: planet.production,
    breakdown: planet.productionBreakdown,
    companionBars: optimizerBoostBars
  };
  const consumptionSource: PanelSource = {
    title: energyLevelsSectionConsumptionTitle,
    series: 'consumption',
    totalLevel: planet.consumption,
    breakdown: planet.consumptionBreakdown,
    companionBars: NO_COMPANION_BARS
  };
  const production = createPanel(productionSource, worldObjectLabels);
  const consumption = createPanel(consumptionSource, worldObjectLabels);
  const hasFoldedTail = [...production.bars, ...consumption.bars].some((bar) => bar.series === 'foldedTail');
  const shareScale = Math.max(planet.production, planet.consumption);

  return {
    production,
    consumption,
    legend: [
      {label: powerPageProducersTitle, series: 'production'},
      ...optimizerBoostBars.map((bar): PowerChartLegendItemViewModel => ({label: bar.label, series: bar.series})),
      {label: powerPageConsumersTitle, series: 'consumption'},
      ...hasFoldedTail ? [{label: powerPageFoldedTailLabel, series: 'foldedTail' as const}] : []
    ],
    share: {
      production: createShareBar(productionSource, shareScale, worldObjectLabels),
      consumption: createShareBar(consumptionSource, shareScale, worldObjectLabels)
    }
  };
}

function selectBars(source: PanelSource, foldLimits: FoldLimits, worldObjectLabels: WorldObjectLabelsResponse): ChartBar[] {
  const entries = [...source.breakdown].sort((first, second) => second.totalLevel - first.totalLevel);
  const isFolded = entries.length > foldLimits.unfoldedMachineTypeLimit;
  const keptEntries = isFolded ? entries.slice(0, foldLimits.machineTypesKeptBesideFoldedTail) : entries;
  const keptBars = [...keptEntries.map((entry) => createMachineBar(entry, source.series, worldObjectLabels)), ...source.companionBars]
    .sort((first, second) => second.totalLevel - first.totalLevel);
  return isFolded ? [...keptBars, createFoldedTailBar(entries.slice(foldLimits.machineTypesKeptBesideFoldedTail))] : keptBars;
}

function resolveSummary(source: PanelSource): string {
  return resolvePowerPageChartSummary(source.breakdown.length, formatKilowatts(source.totalLevel));
}

function createPanel(source: PanelSource, worldObjectLabels: WorldObjectLabelsResponse): PowerChartPanelViewModel {
  const bars = selectBars(source, BARS_FOLD_LIMITS, worldObjectLabels);
  const largestTotalLevel = Math.max(0, ...bars.map((bar) => bar.totalLevel));
  const fullWidthLevel = TICK_INTERVALS * findTickStep(largestTotalLevel);

  return {
    title: source.title,
    summary: resolveSummary(source),
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

function createShareBar(source: PanelSource, scale: number, worldObjectLabels: WorldObjectLabelsResponse): PowerShareBarViewModel {
  const bars = selectBars(source, SHARE_FOLD_LIMITS, worldObjectLabels);
  const machineBars = bars.filter((bar) => bar.series === source.series);

  return {
    title: source.title,
    summary: resolveSummary(source),
    segments: bars.map((bar) => createShareSegment(bar, selectShareFill(bar, machineBars.indexOf(bar)), scale))
  };
}

function selectShareFill(bar: ChartBar, machineRank: number): PowerShareFill {
  if (bar.series === 'production' || bar.series === 'consumption') {
    return MACHINE_SHARE_FILLS[bar.series][machineRank];
  }
  return bar.series;
}

function createShareSegment(bar: ChartBar, fill: PowerShareFill, scale: number): PowerShareSegmentViewModel {
  const widthPercentage = scale === 0 ? 0 : bar.totalLevel * FULL_WIDTH_PERCENTAGE / scale;
  const segment: PowerShareSegmentViewModel = {label: bar.label, fill, widthPercentage, detail: bar.detail};
  if (bar.productionRatio === undefined || widthPercentage < WRITTEN_SHARE_MIN_WIDTH_PERCENTAGE) {
    return segment;
  }
  return {...segment, writtenShare: formatShare(bar.productionRatio)};
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
    productionRatio: entry.productionRatio,
    detail: appendShare(detail, entry.productionRatio)
  };
}

function createFoldedTailBar(foldedEntries: readonly EnergyBreakdownEntryResponse[]): ChartBar {
  const totalLevel = foldedEntries.reduce((total, entry) => total + entry.totalLevel, 0);
  const machineCount = foldedEntries.reduce((total, entry) => total + entry.quantity, 0);
  const productionRatio = sumProductionRatios(foldedEntries.map((entry) => entry.productionRatio));
  return {
    label: resolvePowerPageFoldedTailBarLabel(foldedEntries.length),
    series: 'foldedTail',
    totalLevel,
    productionRatio,
    detail: appendShare(resolvePowerPageFoldedTailBarDetail(machineCount, formatKilowatts(totalLevel)), productionRatio)
  };
}

function createOptimizerBoostBar(optimizers: readonly OptimizerResponse[]): ChartBar {
  const boost = sumOptimizerBoost(optimizers);
  return {
    label: powerPageOptimizerBoostLabel,
    series: 'optimizerBoost',
    totalLevel: boost.contribution,
    productionRatio: boost.productionRatio,
    detail: appendShare(
      resolvePowerPageOptimizerBoostBarDetail(optimizers.length, formatKilowatts(boost.contribution)),
      boost.productionRatio
    )
  };
}

function appendShare(detail: string, productionRatio: number | undefined): string {
  if (productionRatio === undefined) {
    return detail;
  }
  return resolvePowerPageBarDetailWithShare(detail, formatShare(productionRatio));
}
