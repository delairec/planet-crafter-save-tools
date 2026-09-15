import {formatDecimalNumberWithSuffix} from "./formatDecimalNumberWithSuffix";

export interface Threshold {
  value: number | bigint;
  suffix: string;
  multiply?: number;
}

export function formatNumberByThresholds(value: number | bigint, thresholds: Threshold[]): string {
  const num = Number(value);

  for (const threshold of thresholds) {
    const thresholdValue = Number(threshold.value);
    if (num >= thresholdValue) {
      const result = num / thresholdValue;
      return formatDecimalNumberWithSuffix(result, threshold.suffix);
    }
  }

  const smallestThreshold = thresholds[thresholds.length - 1];
  return formatDecimalNumberWithSuffix(num, smallestThreshold.suffix);
}
