import {formatNumberByThresholds, Threshold} from "./threshold.strategy";

const BYTES_PER_KILOBYTE = 1_024;

const thresholds: Threshold[] = [
  {value: BYTES_PER_KILOBYTE ** 3, suffix: "GB"},
  {value: BYTES_PER_KILOBYTE ** 2, suffix: "MB"},
  {value: BYTES_PER_KILOBYTE, suffix: "KB"},
  {value: 1, suffix: "B"},
];

export function formatNumberByFileSizeThresholds(value: number | bigint) {
  return formatNumberByThresholds(value, thresholds);
}
