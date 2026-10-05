import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {FormatNumberStrategies} from "./formatters/formatNumber/FormatNumberStrategies";
import {terraformationLevelsSectionSystemTerraformationIndexUnit} from "../messages/terraformationLevelsSectionMessages.js";

export function formatSystemTerraformationIndex(index: number): string {
  return formatNumber(index, FormatNumberStrategies.SYSTEM_TERRAFORMATION_INDEX) + terraformationLevelsSectionSystemTerraformationIndexUnit;
}
