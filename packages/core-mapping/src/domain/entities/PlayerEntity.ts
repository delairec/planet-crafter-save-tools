import {assertArray, assertNonEmptyString} from "../errors/assertions";

export interface PlayerEntityInput {
  readonly name: string;
  readonly inventory: readonly string[];
  readonly equipment: readonly string[];
}

export class PlayerEntity {
  private readonly _name: string;
  private readonly _inventory: readonly string[];
  private readonly _equipment: readonly string[];

  constructor(input: PlayerEntityInput) {
    this._name = assertNonEmptyString(input.name, 'PlayerEntity.name');
    this._inventory = assertArray<unknown>(input.inventory, 'PlayerEntity.inventory')
      .map((item, index) => assertNonEmptyString(item, `PlayerEntity.inventory[${index}]`));
    this._equipment = assertArray<unknown>(input.equipment, 'PlayerEntity.equipment')
      .map((item, index) => assertNonEmptyString(item, `PlayerEntity.equipment[${index}]`));
  }

  get name(): string {
    return this._name;
  }

  get inventory(): readonly string[] {
    return this._inventory;
  }

  get equipment(): readonly string[] {
    return this._equipment;
  }
}
