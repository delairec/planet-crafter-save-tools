import {GAME_DEFAULT_MODIFIER} from "../gameDefaultModifier";
import {SaveConfigurationValueObject} from "../valueObjects/SaveConfigurationValueObject";

export function resolvePowerConsumptionModifier(saveConfiguration: SaveConfigurationValueObject | undefined): number {
  return saveConfiguration?.modifiers.powerConsumption ?? GAME_DEFAULT_MODIFIER;
}
