import {formatDecimalNumber} from "./thousandsSeparator.strategy";
import {NON_BREAKING_SPACE} from "./nonBreakingSpace";

export function formatDecimalNumberWithSuffix(value: number, suffix: string): string {
  return `${formatDecimalNumber(value)}${NON_BREAKING_SPACE}${suffix}`;
}
