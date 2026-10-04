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

export interface PowerChartViewModel {
  production: PowerChartPanelViewModel;
  consumption: PowerChartPanelViewModel;
  legend: PowerChartLegendItemViewModel[];
}
