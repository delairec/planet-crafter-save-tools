import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {FormatNumberStrategies} from "./formatters/formatNumber/FormatNumberStrategies";

export function formatShare(productionRatio: number): string {
  return formatNumber(productionRatio, FormatNumberStrategies.PERCENTAGE);
}
