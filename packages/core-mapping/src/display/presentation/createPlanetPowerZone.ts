import {
  EnergyBreakdownEntryResponse,
  OptimizerResponse,
  PlanetEnergyLevelsResponse,
  PowerBalanceResponse
} from "../application/responses/EnergyLevelsResponse";
import {WorldObjectLabelsResponse} from "../application/responses/WorldObjectLabelsResponse";
import {TonedValueViewModel} from "./viewModels/ConfigurationPageViewModel";
import {
  PlanetPowerZoneViewModel,
  PowerBreakdownRowViewModel,
  PowerBreakdownTableViewModel,
  PowerLoadMeterViewModel,
  PowerOptimizersViewModel
} from "./viewModels/PlanetPowerZoneViewModel";
import {formatPowerFigures} from "./formatPowerFigures";
import {formatKilowatts} from "./formatKilowatts";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {FormatNumberStrategies} from "./formatters/formatNumber/FormatNumberStrategies";
import {
  energyLevelsSectionAvailableTitle,
  energyLevelsSectionConsumptionTitle,
  energyLevelsSectionProductionTitle,
  resolveEnergyLevelsSectionUnnamedPlanetName
} from "./messages/energyLevelsSectionMessages.js";
import {
  powerPageBalancedBalance,
  powerPageBalancedToneLabel,
  powerPageConsumersTitle,
  powerPageDeficitBalance,
  powerPageDeficitToneLabel,
  powerPageOptimizersTitle,
  powerPageProducersTitle,
  powerPageSurplusBalance,
  powerPageSurplusToneLabel,
  powerPageTightBalance,
  powerPageTightToneLabel,
  powerPageTotalLabel,
  resolvePowerPageBreakdownSummary,
  resolvePowerPageLoadMeterLabel,
  resolvePowerPageOptimizersSummary
} from "./messages/powerPageMessages.js";

const BADGE_BY_BALANCE: Record<PowerBalanceResponse, TonedValueViewModel> = {
  deficit: {value: powerPageDeficitBalance, tone: 'danger', toneLabel: powerPageDeficitToneLabel},
  tight: {value: powerPageTightBalance, tone: 'neutral', toneLabel: powerPageTightToneLabel},
  surplus: {value: powerPageSurplusBalance, tone: 'positive', toneLabel: powerPageSurplusToneLabel},
  balanced: {value: powerPageBalancedBalance, tone: 'neutral', toneLabel: powerPageBalancedToneLabel}
};
const FULL_METER_PERCENTAGE = 100;
const NO_SHARE = '';
const NO_UNIT_LEVEL = '';

interface BreakdownTotals {
  readonly quantity: number;
  readonly totalLevel: number;
  readonly productionRatio?: number;
}

export function createPlanetPowerZone(planet: PlanetEnergyLevelsResponse, worldObjectLabels: WorldObjectLabelsResponse): PlanetPowerZoneViewModel {
  const figures = formatPowerFigures(planet);
  const zone: PlanetPowerZoneViewModel = {
    planetName: planet.planetName ?? resolveEnergyLevelsSectionUnnamedPlanetName(planet.planetId),
    balance: BADGE_BY_BALANCE[planet.balance],
    production: {label: energyLevelsSectionProductionTitle, value: figures.production},
    consumption: {label: energyLevelsSectionConsumptionTitle, value: figures.consumption},
    available: {label: energyLevelsSectionAvailableTitle, value: figures.available},
    optimizers: createOptimizers(planet.optimizers, worldObjectLabels),
    breakdownSummary: resolvePowerPageBreakdownSummary(
      sumBreakdown(planet.productionBreakdown).quantity,
      sumBreakdown(planet.consumptionBreakdown).quantity,
      planet.optimizers.length
    ),
    producers: createBreakdownTable(powerPageProducersTitle, planet.productionBreakdown, worldObjectLabels),
    consumers: createBreakdownTable(powerPageConsumersTitle, planet.consumptionBreakdown, worldObjectLabels)
  };
  if (figures.shareOfProductionConsumed !== undefined) {
    zone.loadMeter = createLoadMeter(figures.shareOfProductionConsumed, planet);
  }
  return zone;
}

function createLoadMeter(shareOfProductionConsumed: string, {production, consumption}: PlanetEnergyLevelsResponse): PowerLoadMeterViewModel {
  return {
    label: resolvePowerPageLoadMeterLabel(shareOfProductionConsumed),
    fillPercentage: Math.min(consumption / production * FULL_METER_PERCENTAGE, FULL_METER_PERCENTAGE)
  };
}

function createOptimizers(optimizers: readonly OptimizerResponse[], worldObjectLabels: WorldObjectLabelsResponse): PowerOptimizersViewModel {
  const boost = optimizers.reduce((total, optimizer) => total + optimizer.contribution, 0);
  const boostRatio = sumRatios(optimizers.map((optimizer) => optimizer.productionRatio));

  return {
    title: powerPageOptimizersTitle,
    summary: resolvePowerPageOptimizersSummary(optimizers.length, formatKilowattsWithShare(boost, boostRatio)),
    rows: optimizers.map((optimizer) => ({
      label: worldObjectLabels[optimizer.name],
      fuses: `${formatNumber(optimizer.fuseCount)} / ${formatNumber(optimizer.fuseSlots)}`,
      boostedMachines: optimizer.boostedMachines
        .map((machine) => `${formatNumber(machine.quantity)} ${worldObjectLabels[machine.name]}`)
        .join(', '),
      contribution: formatKilowatts(optimizer.contribution),
      share: formatShare(optimizer.productionRatio)
    }))
  };
}

function createBreakdownTable(title: string, breakdown: readonly EnergyBreakdownEntryResponse[], worldObjectLabels: WorldObjectLabelsResponse): PowerBreakdownTableViewModel {
  const totals = sumBreakdown(breakdown);

  return {
    title,
    rows: breakdown.map((entry): PowerBreakdownRowViewModel => ({
      label: worldObjectLabels[entry.name],
      quantity: formatNumber(entry.quantity),
      unitLevel: formatKilowatts(entry.unitLevel),
      totalLevel: formatKilowatts(entry.totalLevel),
      share: formatShare(entry.productionRatio)
    })),
    total: {
      label: powerPageTotalLabel,
      quantity: formatNumber(totals.quantity),
      unitLevel: NO_UNIT_LEVEL,
      totalLevel: formatKilowatts(totals.totalLevel),
      share: formatShare(totals.productionRatio)
    }
  };
}

function sumBreakdown(breakdown: readonly EnergyBreakdownEntryResponse[]): BreakdownTotals {
  return {
    quantity: breakdown.reduce((total, entry) => total + entry.quantity, 0),
    totalLevel: breakdown.reduce((total, entry) => total + entry.totalLevel, 0),
    productionRatio: sumRatios(breakdown.map((entry) => entry.productionRatio))
  };
}

function sumRatios(ratios: readonly (number | undefined)[]): number | undefined {
  return ratios.reduce<number | undefined>((total, ratio) => ratio === undefined ? total : (total ?? 0) + ratio, undefined);
}

function formatKilowattsWithShare(kilowatts: number, productionRatio: number | undefined): string {
  if (productionRatio === undefined) {
    return formatKilowatts(kilowatts);
  }
  return `${formatKilowatts(kilowatts)} (${formatShare(productionRatio)})`;
}

function formatShare(productionRatio: number | undefined): string {
  if (productionRatio === undefined) {
    return NO_SHARE;
  }
  return formatNumber(productionRatio, FormatNumberStrategies.PERCENTAGE);
}
