import {TerraformationLevelSummaryResponse} from "../application/responses/TerraformationLevelSummaryResponse";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {FormatNumberStrategies} from "./formatters/formatNumber/FormatNumberStrategies";
import {
  terraformationLevelsSectionPurificationUnit,
  terraformationLevelsSectionTerraformationIndexUnit
} from "./messages/terraformationLevelsSectionMessages.js";

export interface FormattedTerraformationFigures {
  terraformationIndex: string;
  oxygen: string;
  heat: string;
  pressure: string;
  purification?: string;
  plants: string;
  insects: string;
  animals: string;
  biomass: string;
}

export function formatTerraformationFigures(level: TerraformationLevelSummaryResponse): FormattedTerraformationFigures {
  return {
    terraformationIndex: formatNumber(level.terraformationIndex, FormatNumberStrategies.SYMBOL) + terraformationLevelsSectionTerraformationIndexUnit,
    oxygen: formatNumber(level.unitOxygenLevel, FormatNumberStrategies.PARTS_PER),
    heat: formatNumber(level.unitHeatLevel, FormatNumberStrategies.KELVIN),
    pressure: formatNumber(level.unitPressureLevel, FormatNumberStrategies.PASCAL),
    ...formatPurification(level.unitPurificationLevel),
    plants: formatNumber(level.unitPlantsLevel, FormatNumberStrategies.WEIGHT),
    insects: formatNumber(level.unitInsectsLevel, FormatNumberStrategies.WEIGHT),
    animals: formatNumber(level.unitAnimalsLevel, FormatNumberStrategies.WEIGHT),
    biomass: formatNumber(level.biomass, FormatNumberStrategies.WEIGHT)
  };
}

function formatPurification(unitPurificationLevel: number | undefined): Pick<FormattedTerraformationFigures, 'purification'> {
  if (unitPurificationLevel === undefined) {
    return {};
  }

  return {purification: formatNumber(unitPurificationLevel, FormatNumberStrategies.SYMBOL) + terraformationLevelsSectionPurificationUnit};
}
