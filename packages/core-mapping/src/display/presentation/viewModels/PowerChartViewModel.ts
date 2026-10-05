export type PowerChartSeries = 'production' | 'consumption' | 'optimizerBoost' | 'foldedTail';

export interface PowerChartBarViewModel {
  label: string;
  series: PowerChartSeries;
  widthPercentage: number;
  value: string;
  detail: string;
}

export interface PowerChartPanelViewModel {
  title: string;
  summary: string;
  bars: PowerChartBarViewModel[];
  ticks: string[];
}

export interface PowerChartLegendItemViewModel {
  label: string;
  series: PowerChartSeries;
}

export type PowerShareShade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type PowerShareFill = `production-${PowerShareShade}` | `consumption-${PowerShareShade}` | 'optimizerBoost' | 'foldedTail';

export interface PowerShareSegmentViewModel {
  label: string;
  fill: PowerShareFill;
  widthPercentage: number;
  writtenShare?: string;
  detail: string;
}

export interface PowerShareBarViewModel {
  title: string;
  summary: string;
  segments: PowerShareSegmentViewModel[];
}

export interface PowerShareChartViewModel {
  production: PowerShareBarViewModel;
  consumption: PowerShareBarViewModel;
}

export interface PowerChartViewModel {
  production: PowerChartPanelViewModel;
  consumption: PowerChartPanelViewModel;
  legend: PowerChartLegendItemViewModel[];
  share: PowerShareChartViewModel;
}
