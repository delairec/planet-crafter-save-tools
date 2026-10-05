import {TonedValueViewModel} from "./ConfigurationPageViewModel";
import {PowerChartViewModel} from "./PowerChartViewModel";

export interface PowerFigureTileViewModel {
  label: string;
  value: string;
}

export interface PowerLoadMeterViewModel {
  label: string;
  fillPercentage: number;
}

export interface PowerOptimizerRowViewModel {
  label: string;
  fuses: string;
  boostedMachines: string;
  contribution: string;
  share: string;
}

export interface PowerOptimizersViewModel {
  title: string;
  summary: string;
  rows: PowerOptimizerRowViewModel[];
}

export interface PowerBreakdownRowViewModel {
  label: string;
  quantity: string;
  unitLevel: string;
  totalLevel: string;
  share: string;
}

export interface PowerBreakdownTableViewModel {
  title: string;
  rows: PowerBreakdownRowViewModel[];
  total: PowerBreakdownRowViewModel;
}

export interface PlanetPowerZoneViewModel {
  planetName: string;
  balance: TonedValueViewModel;
  production: PowerFigureTileViewModel;
  consumption: PowerFigureTileViewModel;
  available: PowerFigureTileViewModel;
  loadMeter?: PowerLoadMeterViewModel;
  optimizers: PowerOptimizersViewModel;
  breakdownSummary: string;
  producers: PowerBreakdownTableViewModel;
  consumers: PowerBreakdownTableViewModel;
  chart: PowerChartViewModel;
}
