import {formatNumberByUnitThresholds} from "./symbol.strategy";
import {formatDecimalNumber} from "./thousandsSeparator.strategy";
import {formatPercentageNumber} from "./percentage.strategy";
import {formatNumberByPartsPerThresholds} from "./partsPer.strategy";
import {formatNumberByKelvinThresholds} from "./kelvin.strategy";
import {formatNumberByPascalThresholds} from "./pascal.strategy";
import {formatNumberByWeightThresholds} from "./weight.strategy";
import {formatNumberByFileSizeThresholds} from "./fileSize.strategy";
import {formatNumberBySystemTerraformationIndexThresholds} from "./systemTerraformationIndex.strategy";

export const FormatNumberStrategies = {
  SYMBOL: formatNumberByUnitThresholds,
  THOUSANDS_SEPARATOR: formatDecimalNumber,
  PERCENTAGE: formatPercentageNumber,
  PARTS_PER: formatNumberByPartsPerThresholds,
  KELVIN: formatNumberByKelvinThresholds,
  PASCAL: formatNumberByPascalThresholds,
  WEIGHT: formatNumberByWeightThresholds,
  FILE_SIZE: formatNumberByFileSizeThresholds,
  SYSTEM_TERRAFORMATION_INDEX: formatNumberBySystemTerraformationIndexThresholds,
} satisfies Record<string, (value: number | bigint) => string>;

export type FormatNumberStrategyName = keyof typeof FormatNumberStrategies;
export type FormatNumberStrategy = typeof FormatNumberStrategies[FormatNumberStrategyName];
