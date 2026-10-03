import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {FormatNumberStrategies} from "./formatters/formatNumber/FormatNumberStrategies";
import {formatKilowatts} from "./formatKilowatts";

const SURPLUS_SIGN = '+';
const DEFICIT_SIGN = '−';
const BALANCE_SIGN = '';

export interface PowerLevels {
  readonly production: number;
  readonly consumption: number;
  readonly available: number;
}

export interface FormattedPowerFigures {
  production: string;
  consumption: string;
  available: string;
  shareOfProductionConsumed?: string;
}

export function formatPowerFigures({production, consumption, available}: PowerLevels): FormattedPowerFigures {
  return {
    production: formatKilowatts(production),
    consumption: formatKilowatts(consumption),
    available: selectAvailablePowerSign(available) + formatKilowatts(Math.abs(available)),
    ...formatShareOfProductionConsumed(production, consumption)
  };
}

function selectAvailablePowerSign(available: number): string {
  if (available > 0) {
    return SURPLUS_SIGN;
  }
  if (available < 0) {
    return DEFICIT_SIGN;
  }

  return BALANCE_SIGN;
}

function formatShareOfProductionConsumed(production: number, consumption: number): Pick<FormattedPowerFigures, 'shareOfProductionConsumed'> {
  if (production === 0) {
    return {};
  }

  return {shareOfProductionConsumed: formatNumber(consumption / production, FormatNumberStrategies.PERCENTAGE)};
}
