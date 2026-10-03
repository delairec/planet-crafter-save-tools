export interface GaugeReading {
  readonly value: number;
  readonly maximum: number;
}

const EMPTY_GAUGE_PERCENTAGE = 0;
const FULL_GAUGE_PERCENTAGE = 100;

export function computeGaugePercentage({value, maximum}: GaugeReading): number {
  const percentage = value / maximum * FULL_GAUGE_PERCENTAGE;
  return Math.min(FULL_GAUGE_PERCENTAGE, Math.max(EMPTY_GAUGE_PERCENTAGE, percentage));
}
