import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {NON_BREAKING_SPACE} from "./formatters/formatNumber/nonBreakingSpace";
import {energyLevelsSectionKilowattUnit} from "./messages/energyLevelsSectionMessages.js";

export function formatKilowatts(kilowatts: number): string {
  return formatNumber(kilowatts) + NON_BREAKING_SPACE + energyLevelsSectionKilowattUnit;
}
