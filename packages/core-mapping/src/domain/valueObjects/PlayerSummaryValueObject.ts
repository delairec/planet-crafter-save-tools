import {assertArray, assertNonEmptyString} from "../errors/assertions";

export interface PlayerSummaryValueObject {
  readonly name: string;
  readonly inventory: readonly string[];
  readonly equipment: readonly string[];
}

export function createPlayerSummaryValueObject(input: PlayerSummaryValueObject): PlayerSummaryValueObject {
  return {
    name: assertNonEmptyString(input.name, 'PlayerSummaryValueObject.name'),
    inventory: assertArray<unknown>(input.inventory, 'PlayerSummaryValueObject.inventory')
      .map((item, index) => assertNonEmptyString(item, `PlayerSummaryValueObject.inventory[${index}]`)),
    equipment: assertArray<unknown>(input.equipment, 'PlayerSummaryValueObject.equipment')
      .map((item, index) => assertNonEmptyString(item, `PlayerSummaryValueObject.equipment[${index}]`))
  };
}
