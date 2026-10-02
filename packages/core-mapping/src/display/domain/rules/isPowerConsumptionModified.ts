import {GAME_DEFAULT_MODIFIER} from "../gameDefaultModifier";

export function isPowerConsumptionModified(powerConsumptionModifier: number): boolean {
  return powerConsumptionModifier !== GAME_DEFAULT_MODIFIER;
}
